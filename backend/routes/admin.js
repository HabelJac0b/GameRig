const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/dashboard
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM \`USER\`) AS total_users,
        (SELECT COUNT(*) FROM GAME) AS total_games,
        (SELECT COUNT(*) FROM REVIEW) AS total_reviews,
        (SELECT COUNT(*) FROM PAYMENT) AS total_payments,
        (SELECT COALESCE(SUM(amount), 0) FROM PAYMENT WHERE payment_status = 'Completed') AS total_revenue
    `);

    res.json(stats[0] || {
      total_users: 0,
      total_games: 0,
      total_reviews: 0,
      total_payments: 0,
      total_revenue: 0.00
    });
  } catch (error) {
    console.error('Fetch admin dashboard stats error:', error);
    res.status(500).json({ message: 'Error retrieving dashboard analytics' });
  }
});

module.exports = router;
