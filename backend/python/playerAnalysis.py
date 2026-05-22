"""
Composite player analysis: IQR bands, rank context, suspicion scoring, and tiers.
"""

import statistics
from typing import Any, Optional

# OpenDota rank_tier: first digit = medal (1 Herald .. 8 Immortal), second = stars
RANK_MEDALS = {
    1: 'Herald',
    2: 'Guardian',
    3: 'Crusader',
    4: 'Archon',
    5: 'Legend',
    6: 'Ancient',
    7: 'Divine',
    8: 'Immortal',
}

# Rough expected win rate (%) for established accounts at each medal
RANK_EXPECTED_WINRATE = {
    1: 48.0,
    2: 49.0,
    3: 49.5,
    4: 50.0,
    5: 50.5,
    6: 51.0,
    7: 51.5,
    8: 52.0,
}

CLASSIFICATION_META = {
    'account_shape': {
        'label': 'Smurf-shaped',
        'description': 'High win rate with relatively few total games',
    },
    'volume_outlier': {
        'label': 'Volume outlier',
        'description': 'Total games unusually high or low vs your match pool (IQR)',
    },
    'performance_outlier': {
        'label': 'Performance outlier',
        'description': 'Win rate unusually high or low vs your match pool (IQR)',
    },
    'rank_mismatch': {
        'label': 'Rank mismatch',
        'description': 'Win rate well above typical for their displayed rank',
    },
}

TIER_META = {
    'typical': {'label': 'Typical', 'minScore': 0},
    'watch': {'label': 'Watch', 'minScore': 25},
    'likely_outlier': {'label': 'Likely outlier', 'minScore': 50},
    'strong_outlier': {'label': 'Strong outlier', 'minScore': 75},
}


def rank_label(rank_tier: Any) -> Optional[str]:
    if rank_tier is None:
        return None
    try:
        tier = int(rank_tier)
    except (TypeError, ValueError):
        return None
    medal = tier // 10
    stars = tier % 10
    name = RANK_MEDALS.get(medal)
    if not name:
        return None
    if medal >= 8:
        return name
    return f'{name} {stars}' if stars else name


def expected_winrate(rank_tier: Any) -> Optional[float]:
    if rank_tier is None:
        return None
    try:
        medal = int(rank_tier) // 10
    except (TypeError, ValueError):
        return None
    return RANK_EXPECTED_WINRATE.get(medal)


def _iqr_bounds(values: list[float]) -> dict[str, float]:
    if len(values) < 4:
        spread = statistics.stdev(values) if len(values) > 1 else (abs(values[0]) * 0.15 if values else 1)
        mid = statistics.mean(values) if values else 0
        return {
            'q1': mid - spread,
            'q3': mid + spread,
            'lower': mid - 1.5 * spread,
            'upper': mid + 1.5 * spread,
            'median': mid,
        }
    quantiles = statistics.quantiles(values, n=4)
    q1, q2, q3 = quantiles[0], quantiles[1], quantiles[2]
    iqr = q3 - q1
    return {
        'q1': q1,
        'q3': q3,
        'lower': q1 - 1.5 * iqr,
        'upper': q3 + 1.5 * iqr,
        'median': q2,
    }


def _tier_from_score(score: float) -> str:
    if score >= TIER_META['strong_outlier']['minScore']:
        return 'strong_outlier'
    if score >= TIER_META['likely_outlier']['minScore']:
        return 'likely_outlier'
    if score >= TIER_META['watch']['minScore']:
        return 'watch'
    return 'typical'


def _outside_bounds(value: float, bounds: dict[str, float]) -> bool:
    return value < bounds['lower'] or value > bounds['upper']


def analyze_players(player_data: dict) -> dict:
    if not player_data:
        return _empty_analysis()

    win_values = [p['winPercent'] for p in player_data.values()]
    game_values = [float(p['total']) for p in player_data.values()]
    win_bounds = _iqr_bounds(win_values)
    game_bounds = _iqr_bounds(game_values)

    players_out = []
    legacy = {
        'outlierWinsPositive': {},
        'outlierTotalsPositive': {},
        'outliersWinsNegative': {},
        'outliersTotalNegative': {},
        'highWinLowGames': {},
        'lowWinLowGames': {},
        'winPercentThreshold': round((win_bounds['upper'] - win_bounds['median']), 2),
        'totalGamesThreshold': round((game_bounds['upper'] - game_bounds['median'])),
    }

    tier_counts = {k: 0 for k in TIER_META}
    classification_counts = {k: 0 for k in CLASSIFICATION_META}

    for pid, pdata in player_data.items():
        pid_str = str(pid)
        win_pct = pdata['winPercent']
        total = pdata['total']
        rank = pdata.get('rank')
        rank_lbl = rank_label(rank)
        expected_wr = expected_winrate(rank)

        classifications = []
        score_parts = []

        # IQR performance outlier
        if _outside_bounds(win_pct, win_bounds):
            classifications.append('performance_outlier')
            deviation = abs(win_pct - win_bounds['median']) / max(win_bounds['upper'] - win_bounds['median'], 0.01)
            score_parts.append(min(25, 12 + deviation * 8))
            if win_pct >= win_bounds['upper']:
                legacy['outlierWinsPositive'][pid] = pdata
            else:
                legacy['outliersWinsNegative'][pid] = pdata

        # IQR volume outlier
        if _outside_bounds(float(total), game_bounds):
            classifications.append('volume_outlier')
            deviation = abs(total - game_bounds['median']) / max(game_bounds['upper'] - game_bounds['median'], 1)
            score_parts.append(min(20, 10 + deviation * 6))
            if total >= game_bounds['upper']:
                legacy['outlierTotalsPositive'][pid] = pdata
            else:
                legacy['outliersTotalNegative'][pid] = pdata

        # Smurf-shaped: high win + below-median games
        low_games = total < game_bounds['median']
        high_win = win_pct > win_bounds['median'] + max(3, (win_bounds['upper'] - win_bounds['median']) * 0.5)
        if low_games and high_win:
            classifications.append('account_shape')
            score_parts.append(28)
            legacy['highWinLowGames'][pid] = pdata

        # Low win + low games (new account / low impact pattern)
        low_win = win_pct < win_bounds['median'] - max(3, (win_bounds['median'] - win_bounds['lower']) * 0.5)
        if low_games and low_win:
            if 'performance_outlier' not in classifications:
                classifications.append('performance_outlier')
            score_parts.append(10)
            legacy['lowWinLowGames'][pid] = pdata

        # Rank mismatch
        if expected_wr is not None and rank_lbl:
            wr_gap = win_pct - expected_wr
            if wr_gap >= 8 and total < game_bounds['median'] * 1.2:
                classifications.append('rank_mismatch')
                score_parts.append(min(25, 10 + wr_gap * 1.2))

        # Deduplicate classifications while preserving order
        seen = set()
        unique_classifications = []
        for c in classifications:
            if c not in seen:
                seen.add(c)
                unique_classifications.append(c)

        suspicion_score = round(min(100, sum(score_parts)), 1) if score_parts else 0
        tier = _tier_from_score(suspicion_score)

        tier_counts[tier] += 1
        for c in unique_classifications:
            classification_counts[c] += 1

        players_out.append({
            'id': pid_str,
            'userName': pdata.get('userName'),
            'rank': rank,
            'rankLabel': rank_lbl,
            'win': pdata.get('win'),
            'lose': pdata.get('lose'),
            'total': total,
            'winPercent': win_pct,
            'suspicionScore': suspicion_score,
            'tier': tier,
            'tierLabel': TIER_META[tier]['label'],
            'classifications': unique_classifications,
            'classificationLabels': [CLASSIFICATION_META[c]['label'] for c in unique_classifications],
        })

    players_out.sort(key=lambda x: x['suspicionScore'], reverse=True)
    top_suspects = [p for p in players_out if p['tier'] != 'typical'][:15]

    flagged_ids = {p['id'] for p in players_out if p['tier'] != 'typical'}

    return {
        'players': players_out,
        'topSuspects': top_suspects,
        'flaggedPlayerIds': list(flagged_ids),
        'tierCounts': tier_counts,
        'classificationCounts': classification_counts,
        'bounds': {
            'winRate': {k: round(v, 2) for k, v in win_bounds.items()},
            'totalGames': {k: round(v, 2) for k, v in game_bounds.items()},
        },
        'methodology': {
            'winRateRule': 'IQR (1.5× interquartile range) on win %',
            'gamesRule': 'IQR on total games',
            'composite': 'Suspicion score combines flags; tiers at 25 / 50 / 75',
            'classifications': CLASSIFICATION_META,
            'tiers': {k: v['label'] for k, v in TIER_META.items()},
        },
        'legacyOutliers': legacy,
    }


def _empty_analysis():
    return {
        'players': [],
        'topSuspects': [],
        'flaggedPlayerIds': [],
        'tierCounts': {k: 0 for k in TIER_META},
        'classificationCounts': {k: 0 for k in CLASSIFICATION_META},
        'bounds': {},
        'methodology': {'classifications': CLASSIFICATION_META, 'tiers': {k: v['label'] for k, v in TIER_META.items()}},
        'legacyOutliers': {},
    }


def count_impacted_matches(player_match_ids: dict, suspect_ids: set) -> int:
    """Matches containing at least one watch-tier-or-higher smurf-shaped / strong player."""
    count = 0
    for _match, players in player_match_ids.items():
        if any(str(p) in suspect_ids for p in players):
            count += 1
    return count
