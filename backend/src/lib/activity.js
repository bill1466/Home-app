const db = require('../db');
const { todayStr } = require('./dates');

function logActivity(userId, type, date = todayStr()) {
  db.prepare('INSERT INTO activity_log (user_id, type, activity_date) VALUES (?, ?, ?)').run(
    userId,
    type,
    date
  );
}

module.exports = { logActivity };
