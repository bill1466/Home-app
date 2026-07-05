const express = require('express');
const db = require('../db');
const { addDays, todayStr } = require('../lib/dates');

const router = express.Router();

router.get('/upcoming', (req, res) => {
  const start = todayStr();
  const end = addDays(start, 14);
  const events = db
    .prepare(
      `SELECT * FROM calendar_events
       WHERE date(start_at) >= date(?) AND date(start_at) <= date(?)
       ORDER BY start_at ASC`
    )
    .all(start, end);
  res.json({ start, end, events });
});

module.exports = router;
