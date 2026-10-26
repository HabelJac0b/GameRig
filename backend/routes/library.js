const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/library/user/:userId
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.role !== 'admin' && req.user.id != userId) {
      return res.status(403).json({ message: 'Unauthorized access to user library' });
    }

    const libraryItems = await query(
      'SELECT l.library_id, l.user_id, l.game_id, l.purchase_date, l.status, g.title as game_title, g.description, g.genre, g.price, g.platform, g.release_date FROM `LIBRARY` l JOIN GAME g ON l.game_id = g.game_id WHERE l.user_id = ? ORDER BY l.purchase_date DESC',
      [userId]
    );

    res.json(libraryItems);
  } catch (error) {
    console.error('Fetch user library error:', error);
    res.status(500).json({ message: 'Error retrieving user games library' });
  }
});

// GET /api/library (Admin view all library entries)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const libraryItems = await query(
      'SELECT l.library_id, l.user_id, l.game_id, l.purchase_date, l.status, u.name as user_name, u.email as user_email, g.title as game_title FROM `LIBRARY` l JOIN `USER` u ON l.user_id = u.user_id JOIN GAME g ON l.game_id = g.game_id ORDER BY l.purchase_date DESC'
    );
    res.json(libraryItems);
  } catch (error) {
    console.error('Fetch all library records error:', error);
    res.status(500).json({ message: 'Error retrieving library records' });
  }
});

module.exports = router;
