# Home Hub backend

Express + SQLite (via `better-sqlite3`) API for the Eastwood Home Hub mobile
app. Single process, single file database — meant to run on a home
server/NAS next to `home.home`.

## Run

```bash
npm install
npm start          # http://localhost:4000, PORT env var to change
```

The SQLite file lives at `backend/data/home-hub.sqlite` (created and seeded
automatically on first run — see `src/seed.js` for the starter household
members, rooms/chores, dinner ideas, notes, calendar events, and links).

## Keeping it running

Pick whichever fits your homelab:

```bash
# pm2
pm2 start src/server.js --name home-hub-api

# systemd unit (example)
# /etc/systemd/system/home-hub-api.service
[Unit]
Description=Home Hub API
After=network.target

[Service]
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
Environment=PORT=4000

[Install]
WantedBy=multi-user.target
```

## API surface

All routes are under `/api`. Requests that create/attribute content (votes,
notes, chore completions, notices) expect an `x-user-id` header identifying
the acting household member — the mobile app sends this automatically once
you pick a profile.

| Route | Notes |
|---|---|
| `GET /api/users` | household member list |
| `POST /api/users/:id/login` | records a login for streak/badge tracking |
| `GET/POST /api/notices` | manual dashboard notices |
| `GET /api/dinner` | tomorrow's voting options, tonight's winner, leaderboard, history |
| `POST /api/dinner/ideas`, `POST /api/dinner/vote`, `DELETE /api/dinner/ideas/:id` | |
| `GET /api/chores/today`, `GET /api/chores/log` | rotating room assignments + checklists |
| `POST /api/chores/complete`, `POST /api/chores/uncomplete`, `POST /api/chores/reset` | |
| `GET/POST /api/notes`, `POST /api/notes/:id/replies`, `DELETE /api/notes/:id` | |
| `GET /api/badges` | the 9 badge categories + per-person stats |
| `GET /api/calendar/upcoming` | next 14 days |
| `GET /api/links` | family favorites grid |
| `GET /api/home/glance` | combined payload for the dashboard cards |
