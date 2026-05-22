import sys

from dataAggregator import gameStats
from db import init_db, normalize_match_mode, save_run


def main():
    if len(sys.argv) < 2:
        print('Usage: job.py <player_id> [ranked|all]', file=sys.stderr)
        sys.exit(1)

    player_id = sys.argv[1]
    if not player_id.isdigit():
        print('Invalid player ID', file=sys.stderr)
        sys.exit(1)

    try:
        match_mode = normalize_match_mode(sys.argv[2] if len(sys.argv) > 2 else 'ranked')
    except ValueError as e:
        print(e, file=sys.stderr)
        sys.exit(1)

    init_db()
    engine = gameStats(player_id, match_mode=match_mode)
    payload = engine.getData()
    save_run(player_id, match_mode, payload, engine.match_meta_list)
    print(f'Saved {match_mode} analysis for {player_id} ({len(payload["matchesAnalyzed"])} matches)')


if __name__ == '__main__':
    main()
