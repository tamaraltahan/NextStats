import React from 'react';
import dynamic from 'next/dynamic';

const DynamicPiePlot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <>Loading...</>,
});

const MyScatterPlot = ({ title, x, y }) => {
  return (
    <DynamicPiePlot
      data={[
        {
          type: 'scatter',
          mode: 'markers+text',
          x,
          y,
        },
      ]}
      layout={{
        width: 1000,
        height: 800,
        title,
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0.2)',
        font: { color: 'white' },
        xaxis:{
          title:{
            text:"Total Games"
          }
        },
        yaxis:{
          title:{
            text:"Win Percent"
          }
        }
      }}
    />
  );
};

export default MyScatterPlot;

// winrate + total games for all players as 2 arrays
