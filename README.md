# GameStats - Quick Start Guide

A Dota 2 smurf detection tool that analyzes a player's recent matches to identify potential smurfs or purchased accounts using statistical analysis.

**All you need:** Node.js, Python, and a Dota 2 player ID. The app uses the public OpenDota API—no API key registration needed.

## Quick Start

### 1. Install Dependencies

**Node.js:**
```bash
npm install
```

**Python:**
```bash
pip install -r backend/python/requirements.txt
```

### 2. Configure Backend URL

Copy the example env file and adjust if needed:

```bash
cp .env.example .env.local
```

Default in `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Run the App

```bash
npm run both
```

Open **http://localhost:3000** in your browser.

### 4. Find Your Dota 2 Player ID

Visit https://www.opendota.com/, search for your account, and copy the ID from the URL:

```
https://www.opendota.com/players/[YOUR_ID_HERE]
```

### 5. Analyze
1. Choose **Ranked only** or **All queues** (Turbo, etc.)
2. Paste your player ID and verify
3. Wait 2–5 minutes (OpenDota rate limits)
4. View results; switch modes on the stats page (each mode is saved separately)

### Migrate old JSON exports (optional)

If you have legacy `backend/python/PlayerEntries/*.json` files:

```bash
npm install
npm run migrate:json
```

---

## Advanced Setup

### Python Virtual Environment (Optional)

```bash
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # macOS/Linux
pip install -r backend/python/requirements.txt
```

### Running Frontend & Backend Separately

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend:**
```bash
npm run server
```

### Backend Environment Variables (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express API port |
| `PYTHON_CMD` | `python` | Python executable (`python3` on some Linux installs) |

---

## Troubleshooting

### "npm: command not found"

Install Node.js v18+ from https://nodejs.org/

### "Cannot find module 'requests'"

```bash
pip install -r backend/python/requirements.txt
```

### Port 3000 or 3001 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### "Error running Python script" in the browser

- Confirm Python: `python --version`
- Run `npm run both` from this directory (where `package.json` lives)
- Ensure `backend/python/PlayerEntries/` exists (created automatically on first run)

### Analysis runs but stats page is empty

- Analysis takes 2–5 minutes due to API rate limits
- Check the browser console (F12) and that the backend is reachable at `NEXT_PUBLIC_BACKEND_URL`
- Try a different player ID with a public OpenDota profile

---

## Architecture

| Layer | Stack | Role |
|-------|-------|------|
| Frontend | Next.js, React, Plotly | UI and charts |
| API | Express (Node) + better-sqlite3 | Triggers analysis, reads SQLite |
| Analysis | Python | Fetches OpenDota data, scoring & tiers |
| Storage | `backend/python/gamestats.db` | Per-user runs + global player pool |

## Match modes

| Mode | Matches included |
|------|------------------|
| **Ranked only** | OpenDota `lobby_type` 7 (ranked) |
| **All queues** | Every match in your recent OpenDota history |

Each mode stores a **separate** analysis for your account. Rank tiers in the global pool are tracked **per mode**, so ranked and Turbo-heavy samples do not overwrite each other's rank context.

## Global knowledge base

Every completed analysis **additively** contributes:

- Unique players sighted (with refreshed lifetime win/loss from OpenDota)
- Match IDs catalogued across contributors
- Rank snapshots keyed by `ranked` vs `all`

## Detection model

After you run verification, Python scores every parsed player in your selected match set:

- **IQR bands** on win rate and total games (more robust than mean ± σ)
- **Smurf-shaped** — high win rate with fewer games than the pool median
- **Rank mismatch** — win rate well above typical for their OpenDota medal
- **Suspicion score (0–100)** with tiers: Typical · Watch (25+) · Likely outlier (50+) · Strong outlier (75+)

Re-run verification for each mode you want on file. Legacy JSON in `PlayerEntries/` still loads for ranked-only via `npm run migrate:json` or automatic fallback.

---

## Resources

- [OpenDota API](https://docs.opendota.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

---

## License

See [LICENSE.md](./LICENSE.md)
