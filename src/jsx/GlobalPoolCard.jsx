const GlobalPoolCard = ({ pool }) => {
  if (!pool) return null;

  return (
    <div className="global-pool-card card-surface">
      <h2>Community knowledge base</h2>
      <p className="stat-label">
        Each analysis adds players and matches to a shared pool (rank tracked separately for ranked
        vs all queues).
      </p>
      <ul className="global-pool-stats">
        <li>
          <span className="stat-value">{pool.globalPlayerCount?.toLocaleString()}</span>
          <span className="stat-label"> unique players</span>
        </li>
        <li>
          <span className="stat-value">{pool.globalMatchCount?.toLocaleString()}</span>
          <span className="stat-label"> matches catalogued</span>
        </li>
        <li>
          <span className="stat-value">{pool.contributorCount?.toLocaleString()}</span>
          <span className="stat-label"> contributors</span>
        </li>
        <li>
          <span className="stat-value">{pool.rankObservationsRanked?.toLocaleString()}</span>
          <span className="stat-label"> ranked rank snapshots</span>
        </li>
        <li>
          <span className="stat-value">{pool.rankObservationsAll?.toLocaleString()}</span>
          <span className="stat-label"> all-queue rank snapshots</span>
        </li>
      </ul>
    </div>
  );
};

export default GlobalPoolCard;
