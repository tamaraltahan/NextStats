export const TIER_ORDER = ['strong_outlier', 'likely_outlier', 'watch', 'typical'];

export const TIER_STYLES = {
  typical: { label: 'Typical', color: '#64748b', bg: 'rgba(100,116,139,0.2)' },
  watch: { label: 'Watch', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  likely_outlier: { label: 'Likely outlier', color: '#fb923c', bg: 'rgba(251,146,60,0.18)' },
  strong_outlier: { label: 'Strong outlier', color: '#f87171', bg: 'rgba(248,113,113,0.2)' },
};

export const TIER_SCATTER_COLORS = {
  typical: '#64748b',
  watch: '#fbbf24',
  likely_outlier: '#fb923c',
  strong_outlier: '#f87171',
};

const OUTLIER_KEYS = [
  'outlierWinsPositive',
  'outlierTotalsPositive',
  'outliersWinsNegative',
  'outliersTotalNegative',
  'highWinLowGames',
  'lowWinLowGames',
];

/** Rebuild analysis from API payload (supports pre-migration JSON). */
export function normalizeAnalysis(data) {
  if (data?.analysis?.players?.length) {
    return data.analysis;
  }
  return buildLegacyAnalysis(data?.playerData, data?.outliers);
}

function buildLegacyAnalysis(playerData, outliers) {
  if (!playerData) {
    return {
      players: [],
      topSuspects: [],
      flaggedPlayerIds: [],
      tierCounts: { typical: 0, watch: 0, likely_outlier: 0, strong_outlier: 0 },
      classificationCounts: {},
      bounds: {},
      methodology: { tiers: Object.fromEntries(Object.entries(TIER_STYLES).map(([k, v]) => [k, v.label])) },
    };
  }

  const flagged = new Set();
  if (outliers) {
    for (const key of OUTLIER_KEYS) {
      const group = outliers[key];
      if (group && typeof group === 'object') {
        Object.keys(group).forEach((id) => flagged.add(String(id)));
      }
    }
  }

  const players = Object.entries(playerData).map(([id, p]) => {
    const isHighLow = outliers?.highWinLowGames?.[id] != null;
    const isFlagged = flagged.has(String(id));
    let tier = 'typical';
    if (isHighLow) tier = 'strong_outlier';
    else if (isFlagged) tier = 'likely_outlier';

    const classifications = [];
    if (outliers?.highWinLowGames?.[id]) classifications.push('account_shape');
    if (outliers?.outlierWinsPositive?.[id] || outliers?.outliersWinsNegative?.[id]) {
      classifications.push('performance_outlier');
    }
    if (outliers?.outlierTotalsPositive?.[id] || outliers?.outliersTotalNegative?.[id]) {
      classifications.push('volume_outlier');
    }

    return {
      id: String(id),
      userName: p.userName,
      rank: p.rank,
      rankLabel: null,
      total: p.total,
      winPercent: p.winPercent,
      win: p.win,
      lose: p.lose,
      suspicionScore: tier === 'strong_outlier' ? 80 : tier === 'likely_outlier' ? 55 : 0,
      tier,
      tierLabel: TIER_STYLES[tier]?.label ?? tier,
      classifications,
      classificationLabels: classifications,
    };
  });

  players.sort((a, b) => b.suspicionScore - a.suspicionScore);

  return {
    players,
    topSuspects: players.filter((p) => p.tier !== 'typical').slice(0, 15),
    flaggedPlayerIds: [...flagged],
    tierCounts: players.reduce((acc, p) => {
      acc[p.tier] = (acc[p.tier] || 0) + 1;
      return acc;
    }, { typical: 0, watch: 0, likely_outlier: 0, strong_outlier: 0 }),
    classificationCounts: {},
    bounds: {},
    methodology: {
      tiers: Object.fromEntries(Object.entries(TIER_STYLES).map(([k, v]) => [k, v.label])),
      note: 'Re-run analysis to use the updated scoring model.',
    },
  };
}

export function getPlayerById(analysis, id) {
  return analysis.players.find((p) => p.id === String(id));
}
