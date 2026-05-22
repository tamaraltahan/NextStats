"""
SQLite persistence: per-subject analysis (ranked vs all) and additive global player pool.
"""

import json
import os
import sqlite3
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('GAMESTATS_DB_PATH', os.path.join(SCRIPT_DIR, 'gamestats.db'))

MATCH_MODES = ('ranked', 'all')

# OpenDota lobby_type 7 = ranked; 10 = turbo (common unranked)
RANKED_LOBBY_TYPES = {7}


def _utc_now():
    return datetime.now(timezone.utc).isoformat()


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('PRAGMA foreign_keys=ON')
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH) or '.', exist_ok=True)
    with get_connection() as conn:
        conn.executescript(
            '''
            CREATE TABLE IF NOT EXISTS global_players (
                account_id TEXT PRIMARY KEY,
                user_name TEXT,
                wins INTEGER NOT NULL DEFAULT 0,
                losses INTEGER NOT NULL DEFAULT 0,
                total_games INTEGER NOT NULL DEFAULT 0,
                win_percent REAL,
                sighting_count INTEGER NOT NULL DEFAULT 0,
                contributor_count INTEGER NOT NULL DEFAULT 0,
                first_seen_at TEXT NOT NULL,
                last_seen_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS global_player_ranks (
                account_id TEXT NOT NULL,
                match_mode TEXT NOT NULL,
                rank_tier INTEGER,
                observation_count INTEGER NOT NULL DEFAULT 1,
                last_seen_at TEXT NOT NULL,
                PRIMARY KEY (account_id, match_mode),
                FOREIGN KEY (account_id) REFERENCES global_players(account_id)
            );

            CREATE TABLE IF NOT EXISTS global_matches (
                match_id INTEGER PRIMARY KEY,
                lobby_type INTEGER,
                game_mode INTEGER,
                first_seen_at TEXT NOT NULL,
                seen_count INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS analysis_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_account_id TEXT NOT NULL,
                match_mode TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                api_calls INTEGER DEFAULT 0,
                matches_ruined INTEGER DEFAULT 0,
                payload_json TEXT NOT NULL,
                UNIQUE (subject_account_id, match_mode)
            );

            CREATE TABLE IF NOT EXISTS analyzed_matches (
                subject_account_id TEXT NOT NULL,
                match_mode TEXT NOT NULL,
                match_id INTEGER NOT NULL,
                lobby_type INTEGER,
                game_mode INTEGER,
                PRIMARY KEY (subject_account_id, match_mode, match_id)
            );

            CREATE TABLE IF NOT EXISTS contributors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_account_id TEXT NOT NULL,
                match_mode TEXT NOT NULL,
                contributed_at TEXT NOT NULL
            );
            '''
        )


def normalize_match_mode(mode):
    mode = (mode or 'ranked').lower().strip()
    if mode not in MATCH_MODES:
        raise ValueError(f'Invalid match_mode: {mode}. Use ranked or all.')
    return mode


def filter_matches_by_mode(matches, match_mode):
    if match_mode == 'all':
        return list(matches)
    return [m for m in matches if m.get('lobby_type') in RANKED_LOBBY_TYPES]


def load_previous_run(subject_id, match_mode):
    """Returns (matches_analyzed, player_data, matches_ruined) or empty defaults."""
    match_mode = normalize_match_mode(match_mode)
    with get_connection() as conn:
        row = conn.execute(
            '''
            SELECT payload_json FROM analysis_runs
            WHERE subject_account_id = ? AND match_mode = ?
            ''',
            (str(subject_id), match_mode),
        ).fetchone()
        if not row:
            return [], {}, 0
        try:
            data = json.loads(row['payload_json'])
        except json.JSONDecodeError:
            return [], {}, 0
        return (
            data.get('matchesAnalyzed', []),
            data.get('playerData', {}),
            data.get('MatchesRuined', 0),
        )


def save_run(subject_id, match_mode, payload, match_meta_list):
    """Persist analysis snapshot and merge into global pool."""
    match_mode = normalize_match_mode(match_mode)
    subject_id = str(subject_id)
    now = _utc_now()
    payload['matchMode'] = match_mode
    payload_json = json.dumps(payload, ensure_ascii=False)

    with get_connection() as conn:
        existing = conn.execute(
            '''
            SELECT id FROM analysis_runs
            WHERE subject_account_id = ? AND match_mode = ?
            ''',
            (subject_id, match_mode),
        ).fetchone()

        if existing:
            conn.execute(
                '''
                UPDATE analysis_runs
                SET updated_at = ?, api_calls = ?, matches_ruined = ?, payload_json = ?
                WHERE subject_account_id = ? AND match_mode = ?
                ''',
                (
                    now,
                    payload.get('APICalls', 0),
                    payload.get('MatchesRuined', 0),
                    payload_json,
                    subject_id,
                    match_mode,
                ),
            )
            conn.execute(
                'DELETE FROM analyzed_matches WHERE subject_account_id = ? AND match_mode = ?',
                (subject_id, match_mode),
            )
        else:
            conn.execute(
                '''
                INSERT INTO analysis_runs (
                    subject_account_id, match_mode, created_at, updated_at,
                    api_calls, matches_ruined, payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    subject_id,
                    match_mode,
                    now,
                    now,
                    payload.get('APICalls', 0),
                    payload.get('MatchesRuined', 0),
                    payload_json,
                ),
            )

        for m in match_meta_list:
            conn.execute(
                '''
                INSERT INTO analyzed_matches (
                    subject_account_id, match_mode, match_id, lobby_type, game_mode
                ) VALUES (?, ?, ?, ?, ?)
                ''',
                (
                    subject_id,
                    match_mode,
                    m['match_id'],
                    m.get('lobby_type'),
                    m.get('game_mode'),
                ),
            )

        conn.execute(
            '''
            INSERT INTO contributors (subject_account_id, match_mode, contributed_at)
            VALUES (?, ?, ?)
            ''',
            (subject_id, match_mode, now),
        )

        _merge_global_pool(conn, subject_id, match_mode, payload.get('playerData', {}), match_meta_list)

    return payload


def _merge_global_pool(conn, subject_id, match_mode, player_data, match_meta_list):
    now = _utc_now()

    for match in match_meta_list:
        mid = match['match_id']
        row = conn.execute('SELECT seen_count FROM global_matches WHERE match_id = ?', (mid,)).fetchone()
        if row:
            conn.execute(
                'UPDATE global_matches SET seen_count = seen_count + 1 WHERE match_id = ?',
                (mid,),
            )
        else:
            conn.execute(
                '''
                INSERT INTO global_matches (match_id, lobby_type, game_mode, first_seen_at, seen_count)
                VALUES (?, ?, ?, ?, 1)
                ''',
                (mid, match.get('lobby_type'), match.get('game_mode'), now),
            )

    for account_id, pdata in player_data.items():
        aid = str(account_id)
        wins = int(pdata.get('win', 0))
        losses = int(pdata.get('lose', 0))
        total = int(pdata.get('total', wins + losses))
        win_pct = float(pdata.get('winPercent', 0))
        user_name = pdata.get('userName')
        rank = pdata.get('rank')

        existing = conn.execute(
            'SELECT sighting_count, contributor_count FROM global_players WHERE account_id = ?',
            (aid,),
        ).fetchone()

        if existing:
            conn.execute(
                '''
                UPDATE global_players SET
                    user_name = COALESCE(?, user_name),
                    wins = ?, losses = ?, total_games = ?, win_percent = ?,
                    sighting_count = sighting_count + 1,
                    last_seen_at = ?
                WHERE account_id = ?
                ''',
                (user_name, wins, losses, total, win_pct, now, aid),
            )
        else:
            conn.execute(
                '''
                INSERT INTO global_players (
                    account_id, user_name, wins, losses, total_games, win_percent,
                    sighting_count, contributor_count, first_seen_at, last_seen_at
                ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
                ''',
                (aid, user_name, wins, losses, total, win_pct, now, now),
            )

        if rank is not None:
            rank_row = conn.execute(
                '''
                SELECT rank_tier, observation_count FROM global_player_ranks
                WHERE account_id = ? AND match_mode = ?
                ''',
                (aid, match_mode),
            ).fetchone()
            if rank_row:
                conn.execute(
                    '''
                    UPDATE global_player_ranks
                    SET rank_tier = ?, observation_count = observation_count + 1, last_seen_at = ?
                    WHERE account_id = ? AND match_mode = ?
                    ''',
                    (rank, now, aid, match_mode),
                )
            else:
                conn.execute(
                    '''
                    INSERT INTO global_player_ranks (
                        account_id, match_mode, rank_tier, observation_count, last_seen_at
                    ) VALUES (?, ?, ?, 1, ?)
                    ''',
                    (aid, match_mode, rank, now),
                )


def get_run_payload(subject_id, match_mode):
    match_mode = normalize_match_mode(match_mode)
    with get_connection() as conn:
        row = conn.execute(
            '''
            SELECT payload_json FROM analysis_runs
            WHERE subject_account_id = ? AND match_mode = ?
            ''',
            (str(subject_id), match_mode),
        ).fetchone()
        if not row:
            return None
        data = json.loads(row['payload_json'])
        data['matchMode'] = match_mode
        return data


def get_global_pool_summary():
    with get_connection() as conn:
        players = conn.execute('SELECT COUNT(*) AS c FROM global_players').fetchone()['c']
        matches = conn.execute('SELECT COUNT(*) AS c FROM global_matches').fetchone()['c']
        contributors = conn.execute(
            'SELECT COUNT(DISTINCT subject_account_id) AS c FROM contributors'
        ).fetchone()['c']
        ranked_ranks = conn.execute(
            "SELECT COUNT(*) AS c FROM global_player_ranks WHERE match_mode = 'ranked'"
        ).fetchone()['c']
        all_ranks = conn.execute(
            "SELECT COUNT(*) AS c FROM global_player_ranks WHERE match_mode = 'all'"
        ).fetchone()['c']
        return {
            'globalPlayerCount': players,
            'globalMatchCount': matches,
            'contributorCount': contributors,
            'rankObservationsRanked': ranked_ranks,
            'rankObservationsAll': all_ranks,
        }


def import_json_file(json_path, match_mode='ranked'):
    """Import a legacy PlayerEntries/*.json file into the database."""
    with open(json_path, encoding='utf-8') as f:
        payload = json.load(f)
    subject_id = os.path.basename(json_path).replace('.json', '')
    match_meta = [
        {'match_id': mid, 'lobby_type': None, 'game_mode': None}
        for mid in payload.get('matchesAnalyzed', [])
    ]
    save_run(subject_id, match_mode, payload, match_meta)
    return subject_id
