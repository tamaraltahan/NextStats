import { matchModeLabel } from '@/lib/matchMode';

const StatsSummary = ({ statistics, analysis, matchMode = 'ranked' }) => {
  const bounds = analysis?.bounds || {};
  const win = bounds.winRate || {};
  const games = bounds.totalGames || {};

  return (
    <div className="stats-summary card-surface">
      <div className="stats-summary__block">
        <h2>Your match pool ({matchModeLabel(matchMode)})</h2>
        <ul>
          <li>
            Median win rate:{' '}
            <span className="stat-value">{win.median != null ? `${win.median}%` : `${statistics.meanWins}%`}</span>
            {win.median != null && (
              <span className="stat-label"> (mean {statistics.meanWins}%)</span>
            )}
          </li>
          <li>
            Median games played:{' '}
            <span className="stat-value">
              {games.median != null ? games.median.toLocaleString() : statistics.meanTotal.toLocaleString()}
            </span>
          </li>
          <li>
            Matches analyzed:{' '}
            <span className="stat-value">{analysis?.matches ?? '—'}</span>
          </li>
        </ul>
      </div>

      <div className="stats-summary__block">
        <h2>Detection model</h2>
        <p>
          Players receive a <strong>suspicion score (0–100)</strong> from combined signals: IQR outliers on
          win rate and game volume, smurf-shaped profiles (high WR + fewer games), and rank vs win-rate
          mismatch. Tiers: <strong>Watch (25+)</strong>, <strong>Likely outlier (50+)</strong>,{' '}
          <strong>Strong outlier (75+)</strong>.
        </p>
      </div>

      {win.lower != null && (
        <div className="stats-summary__block">
          <h2>IQR bands in this sample</h2>
          <ul>
            <li>
              Win rate outside{' '}
              <span className="stat-value">
                {win.lower.toFixed(1)}% – {win.upper.toFixed(1)}%
              </span>{' '}
              (typical range between quartiles)
            </li>
            <li>
              Total games outside{' '}
              <span className="stat-value">
                {Math.round(games.lower).toLocaleString()} – {Math.round(games.upper).toLocaleString()}
              </span>
            </li>
          </ul>
        </div>
      )}

      {analysis?.methodology?.note && (
        <p className="stat-label" style={{ fontSize: '0.85rem' }}>
          {analysis.methodology.note}
        </p>
      )}

      <div className="disclaimer-box">
        <strong>Important:</strong> Scores highlight statistical unusualness in your recent ranked games—not
        proof of smurfing or rule-breaking. Use results as a starting point for review, not as accusations.
      </div>
    </div>
  );
};

export default StatsSummary;
