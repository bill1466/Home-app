const db = require('../db');
const { addDays, todayStr } = require('./dates');

function votingDate(today = todayStr()) {
  return addDays(today, 1);
}

function tonightDate(today = todayStr()) {
  return today;
}

function listIdeasForVoting(voteDate, currentUserId) {
  const ideas = db.prepare('SELECT * FROM dinner_ideas WHERE active = 1 ORDER BY id').all();
  const votes = db
    .prepare('SELECT idea_id, user_id FROM dinner_votes WHERE vote_date = ?')
    .all(voteDate);
  const countByIdea = {};
  let myIdeaId = null;
  for (const v of votes) {
    countByIdea[v.idea_id] = (countByIdea[v.idea_id] || 0) + 1;
    if (currentUserId && v.user_id === currentUserId) myIdeaId = v.idea_id;
  }
  return ideas.map((idea) => ({
    id: idea.id,
    text: idea.text,
    votes: countByIdea[idea.id] || 0,
    votedByMe: idea.id === myIdeaId,
  }));
}

// Reads the finalized winner for a date, lazily computing+storing it from votes
// the first time it's requested once that date has fully passed.
function getWinner(date) {
  const stored = db
    .prepare('SELECT idea_text, votes FROM dinner_results WHERE result_date = ? ORDER BY idea_text')
    .all(date);
  if (stored.length > 0) {
    return { date, ideas: stored.map((r) => r.idea_text), votes: stored[0].votes };
  }

  const today = todayStr();
  if (date >= today) return null; // still open or not yet in the past

  const rows = db
    .prepare(
      `SELECT di.text AS text, COUNT(*) AS n
       FROM dinner_votes dv
       JOIN dinner_ideas di ON di.id = dv.idea_id
       WHERE dv.vote_date = ?
       GROUP BY dv.idea_id
       ORDER BY n DESC`
    )
    .all(date);
  if (rows.length === 0) return null;

  const max = rows[0].n;
  const winners = rows.filter((r) => r.n === max);
  const insert = db.prepare('INSERT INTO dinner_results (result_date, idea_text, votes) VALUES (?, ?, ?)');
  for (const w of winners) insert.run(date, w.text, w.n);
  return { date, ideas: winners.map((w) => w.text), votes: max };
}

function getLeaderboard(limit = 6) {
  return db
    .prepare(
      `SELECT idea_text AS text, COUNT(*) AS wins, SUM(votes) AS totalVotes, MAX(result_date) AS lastWon
       FROM dinner_results
       GROUP BY idea_text
       ORDER BY wins DESC, totalVotes DESC, lastWon DESC
       LIMIT ?`
    )
    .all(limit);
}

function getHistory(limit = 8) {
  const rows = db
    .prepare('SELECT DISTINCT result_date FROM dinner_results ORDER BY result_date DESC LIMIT ?')
    .all(limit);
  return rows.map(({ result_date }) => {
    const ideas = db
      .prepare('SELECT idea_text FROM dinner_results WHERE result_date = ? ORDER BY idea_text')
      .all(result_date)
      .map((r) => r.idea_text);
    return { date: result_date, ideas };
  });
}

module.exports = { votingDate, tonightDate, listIdeasForVoting, getWinner, getLeaderboard, getHistory };
