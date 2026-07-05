const express = require('express');
const db = require('../db');
const { logActivity } = require('../lib/activity');

const router = express.Router();

function withReplies(note) {
  const replies = db
    .prepare(
      `SELECT r.*, u.name AS author_name, u.emoji AS author_emoji FROM note_replies r
       JOIN users u ON u.id = r.author_id
       WHERE r.note_id = ? ORDER BY r.created_at ASC`
    )
    .all(note.id);
  return { ...note, replies };
}

router.get('/', (req, res) => {
  const notes = db
    .prepare(
      `SELECT n.*, u.name AS author_name, u.emoji AS author_emoji FROM notes n
       JOIN users u ON u.id = n.author_id
       ORDER BY n.created_at DESC`
    )
    .all();
  res.json(notes.map(withReplies));
});

router.post('/', (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'x-user-id header required' });
  const body = (req.body.body || '').trim();
  if (!body) return res.status(400).json({ error: 'body is required' });
  const info = db.prepare('INSERT INTO notes (author_id, body) VALUES (?, ?)').run(req.userId, body);
  logActivity(req.userId, 'note');
  const note = db.prepare('SELECT n.*, u.name AS author_name, u.emoji AS author_emoji FROM notes n JOIN users u ON u.id = n.author_id WHERE n.id = ?').get(info.lastInsertRowid);
  res.status(201).json(withReplies(note));
});

router.post('/:id/replies', (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'x-user-id header required' });
  const body = (req.body.body || '').trim();
  if (!body) return res.status(400).json({ error: 'body is required' });
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  db.prepare('INSERT INTO note_replies (note_id, author_id, body) VALUES (?, ?, ?)').run(
    note.id,
    req.userId,
    body
  );
  logActivity(req.userId, 'note');
  const updated = db.prepare('SELECT n.*, u.name AS author_name, u.emoji AS author_emoji FROM notes n JOIN users u ON u.id = n.author_id WHERE n.id = ?').get(note.id);
  res.status(201).json(withReplies(updated));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
