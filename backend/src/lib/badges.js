const db = require('../db');
const { daysBetween } = require('./dates');
const { getRooms } = require('./chores');

function longestStreak(dates) {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function computeUserStats() {
  const users = db.prepare('SELECT * FROM users ORDER BY sort_order').all();

  const loginDates = db
    .prepare("SELECT user_id, activity_date FROM activity_log WHERE type = 'login'")
    .all();
  const ideaCounts = db
    .prepare("SELECT user_id, COUNT(*) n FROM activity_log WHERE type = 'idea' GROUP BY user_id")
    .all();
  const voteDayCounts = db
    .prepare(
      "SELECT user_id, COUNT(DISTINCT activity_date) n FROM activity_log WHERE type = 'vote' GROUP BY user_id"
    )
    .all();
  const loginDayCounts = db
    .prepare(
      "SELECT user_id, COUNT(DISTINCT activity_date) n FROM activity_log WHERE type = 'login' GROUP BY user_id"
    )
    .all();
  const choreCounts = db
    .prepare('SELECT user_id, COUNT(*) n FROM chore_completions GROUP BY user_id')
    .all();
  const tidyDayCounts = db
    .prepare('SELECT user_id, COUNT(DISTINCT date) n FROM chore_completions GROUP BY user_id')
    .all();
  const notesCounts = db
    .prepare('SELECT author_id AS user_id, COUNT(*) n FROM notes GROUP BY author_id')
    .all();
  const replyCounts = db
    .prepare('SELECT author_id AS user_id, COUNT(*) n FROM note_replies GROUP BY author_id')
    .all();
  const activityTypeCounts = db
    .prepare(
      'SELECT user_id, COUNT(DISTINCT type) n FROM activity_log GROUP BY user_id'
    )
    .all();
  const hasNotes = new Set(notesCounts.map((r) => r.user_id));
  const hasReplies = new Set(replyCounts.map((r) => r.user_id));

  const toMap = (rows) => Object.fromEntries(rows.map((r) => [r.user_id, r.n]));
  const ideaMap = toMap(ideaCounts);
  const voteDayMap = toMap(voteDayCounts);
  const loginDayMap = toMap(loginDayCounts);
  const choreMap = toMap(choreCounts);
  const tidyDayMap = toMap(tidyDayCounts);
  const notesMap = toMap(notesCounts);
  const replyMap = toMap(replyCounts);
  const activityTypeMap = toMap(activityTypeCounts);

  const loginsByUser = {};
  for (const row of loginDates) {
    (loginsByUser[row.user_id] ||= []).push(row.activity_date);
  }

  const rooms = getRooms();
  const assignmentDates = db
    .prepare('SELECT DISTINCT date FROM chore_completions')
    .all()
    .map((r) => r.date);
  const cleanSweepMap = {};
  const { assignmentsForDate } = require('./chores');
  for (const date of assignmentDates) {
    const assignments = assignmentsForDate(date);
    for (const { room, user } of assignments) {
      if (!user) continue;
      const done = db
        .prepare('SELECT COUNT(*) n FROM chore_completions WHERE date = ? AND room_id = ? AND user_id = ?')
        .get(date, room.id, user.id).n;
      if (done >= room.tasks.length) {
        cleanSweepMap[user.id] = (cleanSweepMap[user.id] || 0) + 1;
      }
    }
  }

  return users.map((u) => {
    const loginStreak = longestStreak(loginsByUser[u.id] || []);
    return {
      id: u.id,
      name: u.name,
      emoji: u.emoji,
      color: u.color,
      loginStreak,
      loginDays: loginDayMap[u.id] || 0,
      ideas: ideaMap[u.id] || 0,
      voteDays: voteDayMap[u.id] || 0,
      chores: choreMap[u.id] || 0,
      tidyDays: tidyDayMap[u.id] || 0,
      cleanSweepDays: cleanSweepMap[u.id] || 0,
      notesAndReplies: (notesMap[u.id] || 0) + (replyMap[u.id] || 0),
      activityTypes: activityTypeMap[u.id] || 0,
    };
  });
}

const BADGE_DEFS = [
  {
    key: 'daily_dynamo',
    name: 'Daily Dynamo',
    emoji: '🔥',
    description: 'Longest consecutive streak of days logging in.',
    stat: (u) => u.loginStreak,
    format: (n) => `${n} day streak`,
  },
  {
    key: 'home_hub_regular',
    name: 'Home Hub Regular',
    emoji: '🏡',
    description: 'Most different days logged into the intranet.',
    stat: (u) => u.loginDays,
    format: (n) => `${n} days`,
  },
  {
    key: 'menu_mastermind',
    name: 'Menu Mastermind',
    emoji: '🍕',
    description: 'Most suggested dinner ideas.',
    stat: (u) => u.ideas,
    format: (n) => `${n} ideas`,
  },
  {
    key: 'dinner_decider',
    name: 'Dinner Decider',
    emoji: '🗳️',
    description: 'Most days voting for dinner.',
    stat: (u) => u.voteDays,
    format: (n) => `${n} voting days`,
  },
  {
    key: 'chore_champion',
    name: 'Chore Champion',
    emoji: '🧹',
    description: 'Most chore tasks checked off.',
    stat: (u) => u.chores,
    format: (n) => `${n} chores`,
  },
  {
    key: 'tidy_streaker',
    name: 'Tidy Streaker',
    emoji: '✨',
    description: 'Most days with at least one chore completed.',
    stat: (u) => u.tidyDays,
    format: (n) => `${n} days`,
  },
  {
    key: 'clean_sweep',
    name: 'Clean Sweep',
    emoji: '🌟',
    description: 'Most assigned room days fully completed.',
    stat: (u) => u.cleanSweepDays,
    format: (n) => `${n} perfect days`,
  },
  {
    key: 'family_scribe',
    name: 'Family Scribe',
    emoji: '📝',
    description: 'Most notes and replies shared.',
    stat: (u) => u.notesAndReplies,
    format: (n) => `${n} posts`,
  },
  {
    key: 'all_around_helper',
    name: 'All-Around Helper',
    emoji: '🏆',
    description: 'Most different ways of participating on Home Hub.',
    stat: (u) => u.activityTypes,
    format: (n) => `${n} activity types`,
  },
];

function computeBadges() {
  const users = computeUserStats();
  const badges = BADGE_DEFS.map((def) => {
    const withStat = users.map((u) => ({ user: u, value: def.stat(u) }));
    const max = Math.max(0, ...withStat.map((w) => w.value));
    const leaders = max > 0 ? withStat.filter((w) => w.value === max).map((w) => w.user) : [];
    return {
      key: def.key,
      name: def.name,
      emoji: def.emoji,
      description: def.description,
      value: max,
      label: def.format(max),
      leaders: leaders.map((u) => ({ id: u.id, name: u.name, emoji: u.emoji, color: u.color })),
    };
  });

  const badgesByUser = {};
  for (const badge of badges) {
    for (const leader of badge.leaders) {
      (badgesByUser[leader.id] ||= []).push({ key: badge.key, emoji: badge.emoji, name: badge.name });
    }
  }

  const people = users.map((u) => ({
    ...u,
    badges: badgesByUser[u.id] || [],
  }));

  return { badges, people };
}

module.exports = { computeBadges, computeUserStats, longestStreak };
