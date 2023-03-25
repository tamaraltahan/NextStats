import React from 'react';
import Plotly from 'react-plotly.js';

const MyPlot = (title, data) => {
  return (
    <Plotly
      data={[{ type: 'pie', values: [19, 25, 55], labels: ['1', '2', '3'] }]}
      layout={{
        width: 400,
        height: 300,
        title: 'A Fancy Plot',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0.2)',
        font: { color: 'white' },
      }}
    />
  );
};

export default MyPlot;
