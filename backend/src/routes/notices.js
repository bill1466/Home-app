const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const notices = db
    .prepare(
      `SELECT n.*, u.name AS created_by_name FROM notices n
       LEFT JOIN users u ON u.id = n.created_by
       ORDER BY COALESCE(n.event_date, n.created_at) DESC, n.id DESC`
    )
    .all();
  res.json(notices);
});

router.post('/', (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'x-user-id header required' });
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  const details = req.body.details || null;
  const eventDate = req.body.eventDate || null;
  const info = db
    .prepare('INSERT INTO notices (title, details, event_date, created_by) VALUES (?, ?, ?, ?)')
    .run(title, details, eventDate, req.userId);
  res.status(201).json({ id: info.lastInsertRowid, title, details, event_date: eventDate });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
