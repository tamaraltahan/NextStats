const express = require('express');
const cors = require('cors');
const path = require('path');
const { execFile, execFileSync } = require('child_process');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;
const pythonCmd = process.env.PYTHON_CMD || 'python';
const PYTHON_TIMEOUT_MS = 10 * 60 * 1000;
const JOB_SCRIPT = path.join(__dirname, 'python', 'job.py');

function validatePlayerId(id) {
  return typeof id === 'string' && /^\d{1,12}$/.test(id);
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'gamestats-api' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/globalPool', (req, res) => {
  try {
    res.json(db.getGlobalPoolSummary());
  } catch (err) {
    console.error('globalPool error:', err);
    res.status(500).json({ error: 'Failed to read global pool.' });
  }
});

app.post('/verified', (req, res) => {
  const id = req.body?.id != null ? String(req.body.id) : '';
  const matchMode = db.normalizeMode(req.body?.matchMode);

  if (!validatePlayerId(id)) {
    res.status(400).json({ error: 'Invalid player ID. Use a numeric OpenDota player ID.' });
    return;
  }

  execFile(
    pythonCmd,
    [JOB_SCRIPT, id, matchMode],
    { cwd: path.join(__dirname, '..'), timeout: PYTHON_TIMEOUT_MS },
    (error, stdout, stderr) => {
      if (error) {
        console.error('Python job failed:', error.message);
        if (stderr) console.error(stderr);
        const message =
          error.killed && error.signal === 'SIGTERM'
            ? 'Analysis timed out. Try again later.'
            : `Error running analysis: ${error.message}`;
        res.status(500).json({ error: message });
        return;
      }
      if (stderr) console.warn('Python stderr:', stderr);
      if (stdout) console.log(stdout);
      res.json({ completed: true, matchMode });
    }
  );
});

app.get('/playerData', (req, res) => {
  const pid = req.query.id != null ? String(req.query.id) : '';
  const matchMode = db.normalizeMode(req.query.mode);

  if (!validatePlayerId(pid)) {
    res.status(400).json({ error: 'Invalid player ID.' });
    return;
  }

  try {
    const payload = db.getRunPayload(pid, matchMode);
    if (!payload) {
      res.status(404).json({
        error: `No ${matchMode} analysis found. Run verification for this mode first.`,
      });
      return;
    }
    res.json(db.enrichPayload(payload));
  } catch (err) {
    console.error('Failed to read player data:', err);
    res.status(500).json({ error: 'Failed to read stored player data.' });
  }
});

try {
  execFileSync(pythonCmd, [path.join(__dirname, 'python', 'init_db.py')], {
    cwd: path.join(__dirname, '..'),
  });
} catch (err) {
  console.warn('DB init warning:', err.message);
}

app.listen(port, () => {
  console.log(`GameStats API listening on http://localhost:${port}`);
  console.log(`Database: ${db.DB_PATH}`);
});
