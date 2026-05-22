'use client';
import { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { tierColor } from '@/lib/playerData';

const DynamicPlot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <p className="stat-label">Loading chart…</p>,
});

const OPENDOTA_PLAYER = (id) => `https://www.opendota.com/players/${id}`;

const MyScatterPlot = ({ title, points = [] }) => {
  const plotData = useMemo(() => {
    const x = points.map((p) => p.total);
    const y = points.map((p) => p.winPercent);
    const text = points.map((p) => p.userName || p.id);
    const customdata = points.map((p) => p.id);
    const color = points.map((p) => tierColor(p.tier));
    const markerSize = points.map((p) =>
      p.tier === 'strong_outlier' ? 14 : p.tier === 'likely_outlier' ? 12 : 9
    );

    return [
      {
        type: 'scatter',
        mode: 'markers',
        x,
        y,
        text,
        customdata,
        marker: { color, size: markerSize, opacity: 0.88, line: { color: '#1e293b', width: 1 } },
        hovertemplate:
          '<b>%{text}</b><br>Games: %{x:,}<br>Win rate: %{y}%<br><i>Click for OpenDota</i><extra></extra>',
      },
    ];
  }, [points]);

  const handleClick = useCallback((event) => {
    const playerId = event?.points?.[0]?.customdata;
    if (playerId) {
      window.open(OPENDOTA_PLAYER(playerId), '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <div className="scatter-plot-wrap">
      <p className="scatter-hint stat-label">
        Color = tier (gray typical → yellow watch → orange likely → red strong). Click a point for
        OpenDota.
      </p>
      <DynamicPlot
        data={plotData}
        onClick={handleClick}
        layout={{
          width: Math.min(900, typeof window !== 'undefined' ? window.innerWidth - 48 : 900),
          height: 420,
          title: { text: title, font: { color: '#f1f5f9', size: 14 } },
          plot_bgcolor: 'rgba(0,0,0,0)',
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { family: 'Outfit, sans-serif', color: '#94a3b8' },
          xaxis: {
            title: { text: 'Total games', font: { color: '#94a3b8' } },
            gridcolor: 'rgba(148,163,184,0.12)',
          },
          yaxis: {
            title: { text: 'Win %', font: { color: '#94a3b8' } },
            gridcolor: 'rgba(148,163,184,0.12)',
          },
          margin: { t: 48, b: 56, l: 56, r: 24 },
          hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9' } },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: '100%', maxWidth: '900px', cursor: 'pointer' }}
      />
    </div>
  );
};

export default MyScatterPlot;
