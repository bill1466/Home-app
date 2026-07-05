const db = require('../db');
const { daysBetween } = require('./dates');

const ROTATION_EPOCH = '2024-01-01';

function getKids() {
  return db.prepare('SELECT * FROM users WHERE does_chores = 1 ORDER BY sort_order').all();
}

function getRooms() {
  return db.prepare('SELECT * FROM rooms ORDER BY sort_order').all().map((r) => ({
    ...r,
    tasks: JSON.parse(r.tasks),
  }));
}

// Deterministic daily rotation: each room's assignee shifts by one kid per day.
function assignmentsForDate(dateStr) {
  const kids = getKids();
  const rooms = getRooms();
  if (kids.length === 0) return rooms.map((room) => ({ room, user: null }));

  const dayIndex = daysBetween(ROTATION_EPOCH, dateStr);
  return rooms.map((room, roomIndex) => {
    const kidIndex = ((dayIndex + roomIndex) % kids.length + kids.length) % kids.length;
    return { room, user: kids[kidIndex] };
  });
}

module.exports = { getKids, getRooms, assignmentsForDate, ROTATION_EPOCH };
