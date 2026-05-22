import { TIER_STYLES } from '@/lib/analysis';

const TierBadge = ({ tier, score }) => {
  const style = TIER_STYLES[tier] || TIER_STYLES.typical;
  return (
    <span
      className="tier-badge"
      style={{ color: style.color, background: style.bg, borderColor: style.color }}
    >
      {style.label}
      {score != null ? ` · ${score}` : ''}
    </span>
  );
};

export default TierBadge;
