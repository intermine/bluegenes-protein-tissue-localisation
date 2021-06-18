import React, { useState, useEffect } from 'react';
import { queryData } from './query';
import Heatmap from './components/Heatmap';
import FilterPanel from './components/FilterPanel';
import Loading from './components/Loading';

const RootContainer = ({ serviceUrl, entity }) => {
	const [data, setData] = useState([]);
	const [heatmapData, setHeatmapData] = useState({});
	const [filteredHeatmapData, setFilterHeatmapData] = useState({});
	const [tissueList, setTissueList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedExpression, setSelectedExpression] = useState({});
	const [selectedTissue, setSelectedTissue] = useState([]);
	const expressionLevel = ['Low', 'Medium', 'High', 'Not Detected'];

	useEffect(() => {
		let levelMap = {};
		expressionLevel.forEach(l => (levelMap = { ...levelMap, [l]: true }));
		setSelectedExpression(levelMap);
		setLoading(true);
		const { value } = entity;
		queryData({
			serviceUrl: serviceUrl,
			geneId: !Array.isArray(value) ? [value] : value
		})
			.then(data => {
				setData(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	useEffect(() => {
		const heatmapObj = {};
		const genes = data.map(d => d.symbol);
		data.forEach(d => {
			d.proteinAtlasExpression.forEach(p => {
				heatmapObj[p.tissue.name] = {
					data:
						heatmapObj[p.tissue.name] && heatmapObj[p.tissue.name].data
							? {
									...heatmapObj[p.tissue.name].data,
									[d.symbol]: heatmapObj[p.tissue.name].data[d.symbol]
										? {
												[p.cellType]: getScore(p.level),
												...heatmapObj[p.tissue.name].data[d.symbol]
										  }
										: { Gene: d.symbol, [p.cellType]: getScore(p.level) }
							  }
							: {
									[d.symbol]: {
										Gene: d.symbol,
										[p.cellType]: getScore(p.level)
									}
							  },
					tissue:
						heatmapObj[p.tissue.name] && heatmapObj[p.tissue.name].tissue
							? heatmapObj[p.tissue.name].tissue.filter(
									t => t.value == p.cellType
							  ).length == 0
								? [
										{ value: p.cellType, label: p.cellType },
										...heatmapObj[p.tissue.name].tissue
								  ]
								: heatmapObj[p.tissue.name].tissue
							: [{ value: p.cellType, label: p.cellType }]
				};
				if (
					heatmapObj[p.tissue.name] &&
					heatmapObj[p.tissue.name].data &&
					Object.keys(heatmapObj[p.tissue.name].data).length < genes.length
				) {
					genes.forEach(g => {
						heatmapObj[p.tissue.name].data = {
							[g]: { Gene: g },
							...heatmapObj[p.tissue.name].data
						};
					});
				}
			});
		});
		const tissueList = Object.keys(heatmapObj).map(tissue => ({
			value: tissue,
			label: tissue
		}));

		tissueList.sort((a, b) => {
			if (a.label < b.label) return -1;
			if (a.label > b.label) return 1;
			return 0;
		});

		setTissueList(tissueList);
		setSelectedTissue(tissueList);
		setHeatmapData(heatmapObj);
		setFilterHeatmapData(heatmapObj);
	}, [data]);

	const getScore = level => {
		if (level === 'Low') return 1;
		if (level === 'Medium') return 2;
		if (level === 'High') return 3;
		return 0;
	};

	const getLevel = value => {
		if (value === 0) return 'Not Detected';
		if (value === 1) return 'Low';
		if (value === 2) return 'Medium';
		if (value === 3) return 'High';
	};

	const expressionLevelFilter = e => {
		const { value, checked } = e.target;
		// simply toggle the state of expression level in its map
		const newSelectedExpression = {
			...selectedExpression,
			[value]: checked
		};
		setSelectedExpression(newSelectedExpression);
		filterByTissue(newSelectedExpression);
	};

	const filterByTissue = newSelectedExpression => {
		const tissues = selectedTissue.map(t => t.value);
		const obj = {};
		Object.keys(heatmapData).map(tissue => {
			if (tissues.indexOf(tissue) !== -1) {
				obj[tissue] = {
					data: {},
					tissue: heatmapData[tissue].tissue
				};
				Object.keys(heatmapData[tissue].data).map(gene => {
					obj[tissue].data[gene] = { Gene: gene };
					Object.keys(heatmapData[tissue].data[gene]).map(cell => {
						const value = heatmapData[tissue].data[gene][cell];
						if (value == 1 && newSelectedExpression['Low'])
							obj[tissue].data[gene][cell] = value;
						if (value == 0 && newSelectedExpression['Not Detected'])
							obj[tissue].data[gene][cell] = value;
						if (value == 2 && newSelectedExpression['Medium'])
							obj[tissue].data[gene][cell] = value;
						if (value == 3 && newSelectedExpression['High'])
							obj[tissue].data[gene][cell] = value;
					});
				});
			}
		});
		setFilterHeatmapData(obj);
	};

	return (
		<div className="rootContainer">
			<FilterPanel
				tissueList={tissueList}
				selectedExpression={selectedExpression}
				expressionLevelFilter={expressionLevelFilter}
				updateFilter={value => setSelectedTissue(value)}
				filterTissue={() => filterByTissue(selectedExpression)}
			/>
			{Object.keys(filteredHeatmapData).length ? (
				<Heatmap graphData={filteredHeatmapData} getLevel={getLevel} />
			) : loading ? (
				<Loading />
			) : (
				<h4>No results</h4>
			)}
		</div>
	);
};

export default RootContainer;
