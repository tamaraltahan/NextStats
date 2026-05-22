import { TIER_STYLES, TIER_ORDER } from '@/lib/analysis';

const TierLegend = ({ tierCounts }) => (
  <div className="tier-legend">
    {TIER_ORDER.map((tier) => {
      const s = TIER_STYLES[tier];
      const count = tierCounts?.[tier] ?? 0;
      return (
        <div key={tier} className="tier-legend__item" style={{ borderColor: s.color }}>
          <span className="tier-legend__dot" style={{ background: s.color }} />
          <span className="tier-legend__label">{s.label}</span>
          <span className="tier-legend__count">{count}</span>
        </div>
      );
    })}
  </div>
);

export default TierLegend;
