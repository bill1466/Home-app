const express = require('express');
const { computeBadges } = require('../lib/badges');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ...computeBadges(), updatedAt: new Date().toISOString() });
});

module.exports = router;
