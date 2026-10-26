const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await query('SELECT user_id, name, email, phone, date_joined FROM `USER` ORDER BY date_joined DESC');
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Error retrieving user accounts' });
  }
});

// GET /api/users/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check permission (own user or admin)
    if (req.user.role !== 'admin' && req.user.id != userId) {
      return res.status(403).json({ message: 'Unauthorized access to user profile' });
    }

    const users = await query('SELECT user_id, name, email, phone, date_joined FROM `USER` WHERE user_id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats (total games owned, total reviews written, total purchases)
    const user = users[0];
    const libraryCount = await query('SELECT COUNT(*) as games_owned FROM `LIBRARY` WHERE user_id = ?', [userId]);
    const reviewCount = await query('SELECT COUNT(*) as total_reviews FROM REVIEW WHERE user_id = ?', [userId]);
    const paymentSum = await query('SELECT COUNT(*) as total_payments, SUM(amount) as total_spent FROM PAYMENT WHERE user_id = ? AND payment_status = "Completed"', [userId]);

    res.json({
      ...user,
      stats: {
        games_owned: libraryCount[0]?.games_owned || 0,
        total_reviews: reviewCount[0]?.total_reviews || 0,
        total_payments: paymentSum[0]?.total_payments || 0,
        total_spent: paymentSum[0]?.total_spent || 0.00
      }
    });
  } catch (error) {
    console.error('Fetch user detail error:', error);
    res.status(500).json({ message: 'Error retrieving user details' });
  }
});

// PUT /api/users/:id (Update profile)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, password } = req.body;

    if (req.user.role !== 'admin' && req.user.id != userId) {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE `USER` SET name = ?, phone = ?, password = ? WHERE user_id = ?',
        [name, phone, hashedPassword, userId]
      );
    } else {
      await query(
        'UPDATE `USER` SET name = ?, phone = ? WHERE user_id = ?',
        [name, phone, userId]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// DELETE /api/users/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await query('DELETE FROM `USER` WHERE user_id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
