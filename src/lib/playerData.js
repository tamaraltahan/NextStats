import { TIER_SCATTER_COLORS } from './analysis';

export function buildScatterPoints(players) {
  if (!players?.length) return [];
  return players.map((p) => ({
    id: p.id,
    total: p.total,
    winPercent: p.winPercent,
    userName: p.userName || p.id,
    tier: p.tier,
    suspicionScore: p.suspicionScore,
  }));
}

export function tierColor(tier) {
  return TIER_SCATTER_COLORS[tier] || TIER_SCATTER_COLORS.typical;
}
