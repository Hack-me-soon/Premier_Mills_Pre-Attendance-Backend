// routes/serverTime.js
const express = require('express');
const router = express.Router();

router.get('/time', (req, res) => {
  const serverTime = new Date();
  res.json({ serverTime });
});

module.exports = router;
