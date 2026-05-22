"""
One-time import of legacy PlayerEntries/*.json into SQLite (as ranked mode).
Run: python migrate_json_to_db.py
"""

import glob
import os

from db import import_json_file, init_db

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENTRIES_DIR = os.path.join(SCRIPT_DIR, 'PlayerEntries')


def main():
    init_db()
    paths = glob.glob(os.path.join(ENTRIES_DIR, '*.json'))
    if not paths:
        print('No JSON files found in PlayerEntries/')
        return

    for path in paths:
        subject = import_json_file(path, match_mode='ranked')
        print(f'Imported {subject} <- {os.path.basename(path)}')

    print(f'Done. Imported {len(paths)} file(s) into gamestats.db')


if __name__ == '__main__':
    main()
