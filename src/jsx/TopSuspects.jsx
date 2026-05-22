import TierBadge from './TierBadge';

const TopSuspects = ({ suspects }) => {
  if (!suspects?.length) {
    return (
      <p className="stat-label" style={{ textAlign: 'center', padding: '1rem' }}>
        No players above &quot;Watch&quot; tier in this sample.
      </p>
    );
  }

  return (
    <ol className="top-suspects-list">
      {suspects.map((p, index) => (
        <li key={p.id} className="top-suspect-item card-surface">
          <span className="top-suspect-rank">#{index + 1}</span>
          <div className="top-suspect-body">
            <div className="top-suspect-head">
              <a
                className="external-link"
                href={`https://www.opendota.com/players/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong>{p.userName || p.id}</strong>
              </a>
              <TierBadge tier={p.tier} score={p.suspicionScore} />
            </div>
            <p className="stat-label">
              {p.rankLabel ? `${p.rankLabel} · ` : ''}
              {p.winPercent}% WR · {p.total?.toLocaleString()} games
            </p>
            {p.classificationLabels?.length > 0 && (
              <p className="top-suspect-flags">{p.classificationLabels.join(' · ')}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default TopSuspects;
