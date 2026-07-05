const express = require('express');
const db = require('../db');
const dinner = require('../lib/dinner');
const { computeBadges } = require('../lib/badges');
const { todayStr, addDays } = require('../lib/dates');

const MICRO_MISSIONS = [
  'Refill something before it becomes someone else’s problem.',
  'Wipe down one surface you walk past every day.',
  'Find five things that don’t belong in this room and return them.',
  'Water a plant that looks thirsty.',
  'Toss anything in the fridge past its prime.',
  'Straighten the shoes by the door.',
  'Empty one trash can nobody has claimed yet.',
];

const router = express.Router();

// A single combined payload for the "Today at a glance" dashboard cards.
router.get('/glance', (req, res) => {
  const today = todayStr();

  const nextEvent = db
    .prepare(
      `SELECT * FROM calendar_events WHERE date(start_at) >= date(?) ORDER BY start_at ASC LIMIT 1`
    )
    .get(today);

  const tonight = dinner.getWinner(dinner.tonightDate(today));
  const voteDate = dinner.votingDate(today);
  const ideas = dinner.listIdeasForVoting(voteDate, req.userId);
  const totalVotes = ideas.reduce((sum, i) => sum + i.votes, 0);

  const noteCount = db.prepare('SELECT COUNT(*) n FROM notes').get().n;
  const replyCount = db.prepare('SELECT COUNT(*) n FROM note_replies').get().n;
  const latestNote = db
    .prepare('SELECT created_at FROM notes ORDER BY created_at DESC LIMIT 1')
    .get();

  const { people } = computeBadges();
  const topPeople = [...people].sort((a, b) => b.badges.length - a.badges.length).slice(0, 3);

  const missionIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24)) % MICRO_MISSIONS.length;

  res.json({
    updatedAt: new Date().toISOString(),
    nextEvent: nextEvent || null,
    dinner: {
      tonight,
      voteDate,
      optionCount: ideas.length,
      totalVotes,
    },
    notes: {
      count: noteCount,
      replyCount,
      latestAt: latestNote ? latestNote.created_at : null,
    },
    topPeople,
    microMission: MICRO_MISSIONS[missionIndex],
  });
});

module.exports = router;
