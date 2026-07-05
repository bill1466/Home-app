const express = require('express');
const db = require('../db');
const { logActivity } = require('../lib/activity');

const router = express.Router();

router.get('/', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY sort_order').all();
  res.json(users);
});

// "Log in" as a profile — no password, just records a login for streak/badge tracking.
router.post('/:id/login', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  logActivity(user.id, 'login');
  res.json(user);
});

module.exports = router;
