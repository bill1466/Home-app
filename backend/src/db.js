const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'home-hub.sqlite');

require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🙂',
  color TEXT NOT NULL DEFAULT '#5b8def',
  does_chores INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  details TEXT,
  event_date TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tasks TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS chore_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  task_index INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(date, room_id, task_index)
);

CREATE TABLE IF NOT EXISTS dinner_ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS dinner_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER NOT NULL REFERENCES dinner_ideas(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  vote_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, vote_date)
);

CREATE TABLE IF NOT EXISTS dinner_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_date TEXT NOT NULL,
  idea_text TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS note_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('login','chore','idea','vote','note')),
  activity_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  calendar_name TEXT NOT NULL DEFAULT 'Family',
  source TEXT NOT NULL DEFAULT 'iCloud',
  start_at TEXT NOT NULL,
  end_at TEXT,
  all_day INTEGER NOT NULL DEFAULT 0,
  location TEXT
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  url TEXT,
  internal_route TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
`);

module.exports = db;
