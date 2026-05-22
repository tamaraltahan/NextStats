const ClassificationOverview = ({ classificationCounts, methodology }) => {
  const meta = methodology?.classifications || {};
  const entries = Object.entries(classificationCounts || {}).filter(([, n]) => n > 0);

  if (!entries.length) {
    return <p className="stat-label">No classification flags in this sample.</p>;
  }

  return (
    <div className="classification-grid">
      {entries.map(([key, count]) => {
        const info = meta[key] || { label: key, description: '' };
        return (
          <div key={key} className="classification-card">
            <span className="classification-card__count">{count}</span>
            <span className="classification-card__label">{info.label || key}</span>
            <span className="classification-card__desc">{info.description}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ClassificationOverview;
