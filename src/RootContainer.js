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
		const heatmapValues = [];
		const tissueSet = new Set();

		data.forEach(d => {
			d.proteinAtlasExpression.forEach(p => {
				heatmapValues.push({
					tissue: p.tissue.name,
					gene: d.symbol,
					cell: p.cellType,
					expression: p.level
				});
				tissueSet.add(p.tissue.name);
			});
		});

		const tissueList = Array.from(tissueSet).map(tissue => ({
			label: tissue,
			value: tissue
		}));

		tissueList.sort((a, b) => {
			if (a.label < b.label) return -1;
			if (a.label > b.label) return 1;
			return 0;
		});

		setTissueList(tissueList);
		setSelectedTissue(tissueList);
		setHeatmapData(heatmapValues);
		setFilterHeatmapData(heatmapValues);
	}, [data]);

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
		const filteredValues = heatmapData.filter(({ tissue, expression }) => {
			if (tissues.includes(tissue)) {
				if (
					expression === 'Not detected' &&
					newSelectedExpression['Not Detected']
				)
					return true;
				if (expression === 'Low' && newSelectedExpression['Low']) return true;
				if (expression === 'Medium' && newSelectedExpression['Medium'])
					return true;
				if (expression === 'High' && newSelectedExpression['High']) return true;
			}

			return false;
		});
		setFilterHeatmapData(filteredValues);
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
			{filteredHeatmapData.length ? (
				<Heatmap graphData={filteredHeatmapData} />
			) : loading ? (
				<Loading />
			) : (
				<h4>No results</h4>
			)}
		</div>
	);
};

export default RootContainer;
