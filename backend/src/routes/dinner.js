const express = require('express');
const db = require('../db');
const dinner = require('../lib/dinner');
const { logActivity } = require('../lib/activity');
const { todayStr } = require('../lib/dates');

const router = express.Router();

router.get('/', (req, res) => {
  const today = todayStr();
  const voteDate = dinner.votingDate(today);
  const ideas = dinner.listIdeasForVoting(voteDate, req.userId);
  const tonight = dinner.getWinner(dinner.tonightDate(today));
  const leaderboard = dinner.getLeaderboard(6);
  const history = dinner.getHistory(8);
  res.json({ voteDate, ideas, tonight, leaderboard, history });
});

router.post('/ideas', (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'x-user-id header required' });
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text is required' });
  const info = db
    .prepare('INSERT INTO dinner_ideas (text, created_by) VALUES (?, ?)')
    .run(text, req.userId);
  logActivity(req.userId, 'idea');
  res.status(201).json({ id: info.lastInsertRowid, text });
});

router.delete('/ideas/:id', (req, res) => {
  db.prepare('UPDATE dinner_ideas SET active = 0 WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

router.post('/vote', (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'x-user-id header required' });
  const { ideaId } = req.body;
  const idea = db.prepare('SELECT * FROM dinner_ideas WHERE id = ? AND active = 1').get(ideaId);
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  const voteDate = dinner.votingDate();
  db.prepare(
    `INSERT INTO dinner_votes (idea_id, user_id, vote_date) VALUES (?, ?, ?)
     ON CONFLICT(user_id, vote_date) DO UPDATE SET idea_id = excluded.idea_id, created_at = datetime('now')`
  ).run(idea.id, req.userId, voteDate);
  logActivity(req.userId, 'vote');
  res.json(dinner.listIdeasForVoting(voteDate, req.userId));
});

module.exports = router;
