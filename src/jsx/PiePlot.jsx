import React from 'react';
import dynamic from 'next/dynamic';

const DynamicPiePlot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <>Loading...</>,
});

const MyPiePlot = ({ title, axes1, axes2, label1, label2 }) => {
  return (
    <DynamicPiePlot
      data={[
        {
          type: 'pie',
          values: [axes1, axes2],
          labels: [label1, label2],
        },
      ]}
      layout={{
        width: 500,
        height: 400,
        title,
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0.2)',
        font: { color: 'white' },
      }}
    />
  );
};

export default MyPiePlot;

