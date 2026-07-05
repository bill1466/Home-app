const db = require('./db');

function seedIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (userCount > 0) return;

  const insertUser = db.prepare(
    'INSERT INTO users (name, emoji, color, does_chores, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  const users = [
    ['Dad', '👨', '#4d7cfe', 0, 0],
    ['Mom', '👩', '#f06292', 0, 1],
    ['Riley', '✨', '#9575cd', 1, 2],
    ['Jordan', '🌟', '#4db6ac', 1, 3],
    ['Sam', '🧹', '#ffb74d', 1, 4],
    ['Quinn', '🍼', '#81c784', 0, 5],
  ];
  for (const u of users) insertUser.run(...u);

  const insertRoom = db.prepare(
    'INSERT INTO rooms (name, emoji, sort_order, tasks) VALUES (?, ?, ?, ?)'
  );
  insertRoom.run(
    'Kitchen',
    '🍳',
    0,
    JSON.stringify([
      'Empty dishwasher',
      'Put food away',
      'Fill dishwasher',
      'Handwash/dry',
      'Clean counters',
    ])
  );
  insertRoom.run(
    'Living Room',
    '🛋️',
    1,
    JSON.stringify([
      'Feed/Water Dogs',
      'Sweep Entryway',
      'Pick up floor',
      'Organize couch pillows',
      'Clean/Organize anything on tables/office area',
      'Bring out recycling on top of ship',
    ])
  );
  insertRoom.run(
    'Dining Room',
    '🍽️',
    2,
    JSON.stringify([
      'Clean Bathroom',
      'Make sure nothing on floor, bathroom, dining, laundry rooms',
      'No hairballs in shower',
      'No laundry in laundry room',
      'Wash table cloth if needed. Wash with dirty kitchen towels',
      'Clear Table',
      'Empty/Fill Sharks water',
      'Take out garbage/recycling',
    ])
  );

  const insertIdea = db.prepare(
    "INSERT INTO dinner_ideas (id, text, created_by, active) VALUES (?, ?, ?, 1)"
  );
  insertIdea.run(1, 'Chicken quesadillas', 1);
  insertIdea.run(2, 'Pizza night', 1);
  insertIdea.run(3, 'Stir fry with rice', 1);
  insertIdea.run(4, 'Mealie recipe pick', 1);

  const jordanId = db.prepare('SELECT id FROM users WHERE name = ?').get('Jordan').id;
  db.prepare(
    'INSERT INTO dinner_votes (idea_id, user_id, vote_date) VALUES (1, ?, ?)'
  ).run(jordanId, '2026-07-05');

  const insertResult = db.prepare(
    'INSERT INTO dinner_results (result_date, idea_text, votes) VALUES (?, ?, ?)'
  );
  const history = [
    ['2026-07-05', 'Chicken quesadillas', 1],
    ['2026-07-04', 'Burgers and fries', 1],
    ['2026-07-04', 'Pizza night', 1],
    ['2026-07-03', 'Chicken quesadillas', 1],
    ['2026-07-02', 'Spaghetti and meatballs', 1],
    ['2026-07-02', 'Chinese food in the freezer', 1],
    ['2026-07-01', 'Taco night', 1],
    ['2026-06-30', 'Grilled chicken with rice', 1],
    ['2026-06-29', 'Poke bowls', 2],
    ['2026-06-28', 'BBQ chicken sandwiches', 1],
    ['2026-06-28', 'Poke bowls', 1],
    ['2026-06-25', 'Stir fry with rice', 1],
    ['2026-06-20', 'Pizza night', 1],
    ['2026-06-18', "Carrabba's", 3],
    ['2026-06-17', 'Quesadillas', 4],
    ['2026-06-10', 'Stir fry with rice', 1],
  ];
  for (const row of history) insertResult.run(...row);

  const dadId = db.prepare('SELECT id FROM users WHERE name = ?').get('Dad').id;
  const insertNote = db.prepare(
    'INSERT INTO notes (author_id, body, created_at) VALUES (?, ?, ?)'
  );
  insertNote.run(
    dadId,
    "The password manager will let you save your passwords where you can always reach them. Whether on your phone or computer. It also allows me to share some of my passwords, like Netflix to where you can always get to it and don't have to ask me.",
    '2026-06-18 09:26:00'
  );
  insertNote.run(
    dadId,
    'Many of the links only work on home WiFi unless I set up the Tailscale app for you',
    '2026-06-16 18:18:00'
  );

  const insertEvent = db.prepare(
    'INSERT INTO calendar_events (title, calendar_name, source, start_at, all_day, location) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const events = [
    ['On call', 'Family', 'iCloud', '2026-06-29 00:00', 1, null],
    ['Riley therapy', 'Family', 'iCloud', '2026-06-29 15:30', 0, null],
    ['Jordan dance', 'Family', 'iCloud', '2026-06-29 19:30', 0, null],
    ['Sam pt', 'Family', 'iCloud', '2026-06-30 10:00', 0, null],
    ['Grandma birthday', 'Family', 'iCloud', '2026-06-30 15:00', 0, null],
    ['Birthday party', 'Family', 'iCloud', '2026-06-30 21:00', 0, null],
    ['Sam eye check up', 'Family', 'iCloud', '2026-07-01 10:30', 0, null],
    ['Doctor appt', 'Family', 'iCloud', '2026-07-01 15:00', 0, null],
    ['Pharmacy pickup', 'Home', 'iCloud', '2026-07-02 00:00', 1, null],
    ['In service', 'Family', 'iCloud', '2026-07-02 07:00', 0, null],
    ['Riley therapy team', 'Family', 'iCloud', '2026-07-02 12:00', 0, null],
    ['Sam pt', 'Family', 'iCloud', '2026-07-02 13:30', 0, null],
    ['Jordan dance', 'Family', 'iCloud', '2026-07-06 19:30', 0, null],
    ['Trash pickup', 'Home', 'iCloud', '2026-07-07 00:00', 1, null],
    ['Doctor follow-up', 'Family', 'iCloud', '2026-07-09 15:00', 0, null],
    ['Riley therapy', 'Family', 'iCloud', '2026-07-13 15:30', 0, null],
  ];
  for (const e of events) insertEvent.run(...e);

  const insertLink = db.prepare(
    'INSERT INTO links (label, emoji, description, url, internal_route, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const links = [
    ['Home Assistant', '🏠', 'Lights, climate, sensors, automations', 'http://homeassistant.home.home/', null, 0],
    ['Mealie', '🍽️', 'Recipes, meal plans, shopping lists', 'http://mealie.home.home/', null, 1],
    ['Dinner Vote', '🗳️', "Vote on tomorrow's dinner", null, 'Dinner', 2],
    ['Rewards', '🏆', 'Badges for logins, dinner, chores, and helpfulness', null, 'Badges', 3],
    ['Chores', '🧹', 'Daily rotating room checklist', null, 'Chores', 4],
    ['Notes', '📝', 'Shared family notes', null, 'Notes', 5],
    ['Photos', '📷', 'Immich family photo library', 'http://immich.home.home/', null, 6],
    ['Files', '📁', 'Nextcloud family files', 'http://nextcloud.home.home/', null, 7],
    ['Movies & Shows', '🎬', 'Request and discover media', 'http://requests.home.home/', null, 8],
    ['Plex', '📺', 'Watch the home media library', 'http://plex.home.home/', null, 9],
    ['Vaultwarden', '🔐', 'Family password vault', 'http://vault.home.home/', null, 10],
  ];
  for (const l of links) insertLink.run(...l);

  const insertActivity = db.prepare(
    'INSERT INTO activity_log (user_id, type, activity_date) VALUES (?, ?, ?)'
  );
  const rileyId = db.prepare('SELECT id FROM users WHERE name = ?').get('Riley').id;
  const samId = db.prepare('SELECT id FROM users WHERE name = ?').get('Sam').id;
  const momId = db.prepare('SELECT id FROM users WHERE name = ?').get('Mom').id;

  const today = new Date('2026-07-05T00:00:00');
  const iso = (d) => d.toISOString().slice(0, 10);
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return iso(d);
  };

  for (let i = 0; i < 3; i++) insertActivity.run(dadId, 'login', daysAgo(i));
  insertActivity.run(momId, 'login', daysAgo(0));
  insertActivity.run(jordanId, 'login', daysAgo(0));

  for (let i = 0; i < 8; i++) insertActivity.run(dadId, 'idea', daysAgo(i * 3));
  for (let i = 0; i < 3; i++) insertActivity.run(momId, 'idea', daysAgo(i * 4));
  for (let i = 0; i < 4; i++) insertActivity.run(rileyId, 'idea', daysAgo(i * 5));
  insertActivity.run(samId, 'idea', daysAgo(2));

  for (let i = 0; i < 7; i++) insertActivity.run(dadId, 'vote', daysAgo(i));
  for (let i = 0; i < 6; i++) insertActivity.run(momId, 'vote', daysAgo(i));
  for (let i = 0; i < 6; i++) insertActivity.run(rileyId, 'vote', daysAgo(i));
  for (let i = 0; i < 12; i++) insertActivity.run(jordanId, 'vote', daysAgo(i));
  for (let i = 0; i < 5; i++) insertActivity.run(samId, 'vote', daysAgo(i));

  insertActivity.run(dadId, 'note', daysAgo(17));
  insertActivity.run(dadId, 'note', daysAgo(19));

  const rooms = db.prepare('SELECT * FROM rooms ORDER BY sort_order').all();
  const kids = [rileyId, jordanId, samId];
  const insertChore = db.prepare(
    'INSERT OR IGNORE INTO chore_completions (date, room_id, task_index, user_id, completed_at) VALUES (?, ?, ?, ?, ?)'
  );
  const targetTotals = { [rileyId]: 13, [jordanId]: 12, [samId]: 14 };
  const running = { [rileyId]: 0, [jordanId]: 0, [samId]: 0 };
  for (let dayOffset = 13; dayOffset >= 1; dayOffset--) {
    const date = daysAgo(dayOffset);
    rooms.forEach((room, roomIndex) => {
      const kidIndex = (dayOffset + roomIndex) % kids.length;
      const userId = kids[kidIndex];
      const tasks = JSON.parse(room.tasks);
      tasks.forEach((_, taskIndex) => {
        if (running[userId] < targetTotals[userId] && Math.random() > 0.15) {
          insertChore.run(date, room.id, taskIndex, userId, `${date} 18:00:00`);
          running[userId] += 1;
        }
      });
    });
  }
}

module.exports = { seedIfEmpty };
