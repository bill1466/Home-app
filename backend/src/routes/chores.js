const express = require('express');
const db = require('../db');
const { assignmentsForDate } = require('../lib/chores');
const { logActivity } = require('../lib/activity');
const { todayStr } = require('../lib/dates');

const router = express.Router();

function dayView(date) {
  const assignments = assignmentsForDate(date);
  const completions = db
    .prepare('SELECT room_id, task_index, user_id FROM chore_completions WHERE date = ?')
    .all(date);
  const doneSet = new Set(completions.map((c) => `${c.room_id}:${c.task_index}`));

  return assignments.map(({ room, user }) => ({
    room: { id: room.id, name: room.name, emoji: room.emoji },
    user: user ? { id: user.id, name: user.name, emoji: user.emoji, color: user.color } : null,
    tasks: room.tasks.map((label, taskIndex) => ({
      index: taskIndex,
      label,
      done: doneSet.has(`${room.id}:${taskIndex}`),
    })),
  }));
}

router.get('/today', (req, res) => {
  const date = todayStr();
  res.json({ date, rooms: dayView(date) });
});

router.get('/log', (req, res) => {
  const dates = db
    .prepare('SELECT DISTINCT date FROM chore_completions ORDER BY date DESC LIMIT 14')
    .all()
    .map((r) => r.date);
  res.json(dates.map((date) => ({ date, rooms: dayView(date) })));
});

router.post('/complete', (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'x-user-id header required' });
  const { roomId, taskIndex } = req.body;
  const date = todayStr();
  db.prepare(
    `INSERT INTO chore_completions (date, room_id, task_index, user_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date, room_id, task_index) DO UPDATE SET user_id = excluded.user_id, completed_at = datetime('now')`
  ).run(date, roomId, taskIndex, req.userId);
  logActivity(req.userId, 'chore');
  res.json({ date, rooms: dayView(date) });
});

router.post('/uncomplete', (req, res) => {
  const { roomId, taskIndex } = req.body;
  const date = todayStr();
  db.prepare('DELETE FROM chore_completions WHERE date = ? AND room_id = ? AND task_index = ?').run(
    date,
    roomId,
    taskIndex
  );
  res.json({ date, rooms: dayView(date) });
});

router.post('/reset', (req, res) => {
  const date = todayStr();
  db.prepare('DELETE FROM chore_completions WHERE date = ?').run(date);
  res.json({ date, rooms: dayView(date) });
});

module.exports = router;
