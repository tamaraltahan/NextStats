import dynamic from 'next/dynamic';

const DynamicPlot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <p className="stat-label">Loading chart…</p>,
});

const plotLayout = {
  plot_bgcolor: 'rgba(0,0,0,0)',
  paper_bgcolor: 'rgba(0,0,0,0)',
  font: { family: 'Outfit, sans-serif', color: '#94a3b8', size: 12 },
  title: { font: { color: '#f1f5f9', size: 14 } },
  margin: { t: 48, b: 32, l: 32, r: 32 },
};

const MyPiePlot = ({ title, axes1, axes2, label1, label2 }) => (
  <DynamicPlot
    data={[
      {
        type: 'pie',
        values: [axes1, axes2],
        labels: [label1, label2],
        marker: {
          colors: ['#8b5cf6', '#334155'],
        },
        textfont: { color: '#f1f5f9' },
        hole: 0.35,
      },
    ]}
    layout={{
      ...plotLayout,
      width: 380,
      height: 320,
      title,
      showlegend: true,
      legend: { font: { color: '#94a3b8' } },
    }}
    config={{ displayModeBar: false }}
  />
);

export default MyPiePlot;
