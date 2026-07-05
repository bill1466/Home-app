const express = require('express');
const cors = require('cors');
const { seedIfEmpty } = require('./seed');

seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const userId = req.header('x-user-id');
  req.userId = userId ? Number(userId) : null;
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/users', require('./routes/users'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/dinner', require('./routes/dinner'));
app.use('/api/chores', require('./routes/chores'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/links', require('./routes/links'));
app.use('/api/home', require('./routes/home'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
