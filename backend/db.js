const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.GAMESTATS_DB_PATH
  || path.join(__dirname, 'python', 'gamestats.db');

const PLAYER_ENTRIES_DIR = path.join(__dirname, 'python', 'PlayerEntries');
const VALID_MODES = new Set(['ranked', 'all']);

let db;

function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function normalizeMode(mode) {
  const m = (mode || 'ranked').toLowerCase();
  return VALID_MODES.has(m) ? m : 'ranked';
}

function getRunPayload(subjectId, matchMode) {
  const mode = normalizeMode(matchMode);
  const row = getDb()
    .prepare(
      `SELECT payload_json FROM analysis_runs
       WHERE subject_account_id = ? AND match_mode = ?`
    )
    .get(String(subjectId), mode);

  if (row) {
    const data = JSON.parse(row.payload_json);
    data.matchMode = mode;
    return data;
  }

  // Legacy JSON fallback (treated as ranked)
  if (mode === 'ranked') {
    const jsonPath = path.join(PLAYER_ENTRIES_DIR, `${subjectId}.json`);
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      data.matchMode = 'ranked';
      data._legacyJson = true;
      return data;
    }
  }
  return null;
}

function getGlobalPoolSummary() {
  const conn = getDb();
  return {
    globalPlayerCount: conn.prepare('SELECT COUNT(*) AS c FROM global_players').get().c,
    globalMatchCount: conn.prepare('SELECT COUNT(*) AS c FROM global_matches').get().c,
    contributorCount: conn
      .prepare('SELECT COUNT(DISTINCT subject_account_id) AS c FROM contributors')
      .get().c,
    rankObservationsRanked: conn
      .prepare("SELECT COUNT(*) AS c FROM global_player_ranks WHERE match_mode = 'ranked'")
      .get().c,
    rankObservationsAll: conn
      .prepare("SELECT COUNT(*) AS c FROM global_player_ranks WHERE match_mode = 'all'")
      .get().c,
  };
}

function enrichPayload(data) {
  const totals = [];
  const winPercents = [];
  if (data.playerData) {
    Object.values(data.playerData).forEach((p) => {
      totals.push(p.total);
      winPercents.push(p.winPercent);
    });
  }
  data.totals = totals;
  data.winPercents = winPercents;
  data.globalPool = getGlobalPoolSummary();
  return data;
}

module.exports = {
  getRunPayload,
  getGlobalPoolSummary,
  enrichPayload,
  normalizeMode,
  DB_PATH,
};
