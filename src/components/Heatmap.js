import React from 'react';
import { VegaLite } from 'react-vega';

const Heatmap = ({ graphData }) => {
	const spec = {
		$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
		height: { step: 10 },
		mark: 'rect',
		encoding: {
			column: {
				field: 'tissue',
				type: 'ordinal',
				header: {
					orient: 'bottom',
					labelAngle: 45,
					labelAlign: 'left',
					labelAnchor: 'start'
				},
				title: null,
				spacing: 0
			},
			y: { field: 'gene', type: 'ordinal', title: null },
			x: {
				field: 'cell',
				type: 'ordinal',
				title: null,
				axis: { orient: 'top', labelAngle: -45, labelAlign: 'left' }
			},
			color: {
				field: 'expression',
				type: 'ordinal',
				scale: {
					scheme: 'blues',
					domain: ['Not detected', 'Low', 'Medium', 'High']
				},
				legend: null
			},
			tooltip: [
				{ field: 'tissue', type: 'ordinal' },
				{ field: 'gene', type: 'ordinal' },
				{ field: 'cell', type: 'ordinal' },
				{ field: 'expression', type: 'ordinal' }
			]
		},
		resolve: { scale: { x: 'independent' } },
		data: { name: 'values' }
	};

	return (
		<div className="graph-container">
			<VegaLite spec={spec} data={{ values: graphData }} />
		</div>
	);
};

export default Heatmap;
