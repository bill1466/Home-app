# Eastwood Home Hub — mobile app

A household mobile app for chores, dinner voting, family notes, a shared
calendar, and reward badges — modeled on the `home.home` family intranet
dashboard.

## Structure

- `backend/` — Node/Express + SQLite API. Self-host it on your home
  server/NAS alongside `home.home`; every family member's phone talks to it.
- `mobile/` — Expo (React Native) app with per-person profiles (no
  passwords — just "who's using the app"), matching the Home Hub feature set:
  - **Home** — notices, at-a-glance dashboard, micro mission, quick links
  - **Dinner** — vote on tomorrow's dinner, tonight's winner, leaderboard, history
  - **Chores** — daily rotating room checklists, reset/log
  - **Notes** — shared family notes with replies
  - **More → Badges** — the 9 reward-badge categories + per-person stats
  - **More → Calendar** — next 14 days
  - **More → Family favorites** — links out to Home Assistant, Mealie, Immich,
    Nextcloud, Plex, Vaultwarden, etc.

## Quickstart

```bash
# 1. Backend
cd backend
npm install
npm start            # listens on :4000, seeds starter data on first run

# 2. Mobile app
cd ../mobile
npm install
npx expo start        # scan the QR code with Expo Go on your phone
```

On first launch the app will try to reach `http://home.home:4000/api`.
If your backend runs somewhere else (a different host/port), open
**More → Settings** in the app and change the server address — it's saved
on-device.

## Before you deploy for real

- **Family favorites links** (`backend/src/seed.js`, the `links` seed) use
  placeholder addresses like `http://homeassistant.home.home/`. Edit them to
  match your actual LAN hostnames/ports for Home Assistant, Mealie, Immich,
  Nextcloud, Plex, and Vaultwarden.
- **Chore rotation** (`backend/src/lib/chores.js`) uses a simple deterministic
  day-based rotation among household members flagged `does_chores`. It won't
  necessarily match any rotation you were running by hand — adjust the
  formula or hardcode a schedule if you need a specific order.
- Keep the backend running persistently (pm2, a systemd service, or a Docker
  container) so it survives reboots — see `backend/README.md`.
