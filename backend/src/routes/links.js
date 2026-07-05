const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const links = db.prepare('SELECT * FROM links ORDER BY sort_order').all();
  res.json(links);
});

module.exports = router;
