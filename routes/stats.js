const express = require('express');
const router = express.Router();
const { getStats } = require('../db/queries');

// Get portfolio stats
router.get('/', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
