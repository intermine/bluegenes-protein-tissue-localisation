import React from 'react';
import { VegaLite } from 'react-vega';

const Heatmap = ({ graphData, getLevel }) => {

	return (
		<div className="graph-container">
			<pre>{JSON.stringify(graphData, null, 2)}</pre>
		</div>
	);
};

export default Heatmap;
