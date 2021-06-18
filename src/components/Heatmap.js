import React from 'react';
import { VegaLite } from 'react-vega';

const Heatmap = ({ graphData, getLevel }) => {
	const spec = {
		$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
		// width: 'container',
		// height: { step: 10 },
		// autosize: {
		// 	type: 'fit-x',
		// 	contains: 'padding'
		// },
		mark: 'rect',
		encoding: {
			row: { field: 'tissue' },
			y: { field: 'gene', type: 'ordinal', title: null },
			x: {
				field: 'cell',
				type: 'ordinal',
				title: null,
				axis: { orient: 'top', labelAngle: -45, labelAlign: 'left' }
			},
			color: {
				field: 'expression',
				type: 'quantitative',
				scale: { scheme: 'blues' },
				legend: null
			},
			tooltip: [
				{ field: 'tissue', type: 'ordinal' },
				{ field: 'gene', type: 'ordinal' },
				{ field: 'cell', type: 'ordinal' },
				{ field: 'expression', type: 'quantitative' }
			]
		},
		data: { name: 'values' }
	};

	return (
		<div className="graph-container">
			<VegaLite spec={spec} data={{ values: graphData }} />
		</div>
	);
};

export default Heatmap;
