const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/payments (Admin view all payments)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payments = await query(
      'SELECT p.*, u.name as user_name, u.email as user_email, g.title as game_title FROM PAYMENT p JOIN `USER` u ON p.user_id = u.user_id JOIN GAME g ON p.game_id = g.game_id ORDER BY p.payment_date DESC'
    );
    res.json(payments);
  } catch (error) {
    console.error('Fetch all payments error:', error);
    res.status(500).json({ message: 'Error retrieving payment records' });
  }
});

// GET /api/payments/user/:userId (User's payments)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.role !== 'admin' && req.user.id != userId) {
      return res.status(403).json({ message: 'Unauthorized access to user payments' });
    }

    const payments = await query(
      'SELECT p.*, g.title as game_title FROM PAYMENT p JOIN GAME g ON p.game_id = g.game_id WHERE p.user_id = ? ORDER BY p.payment_date DESC',
      [userId]
    );
    res.json(payments);
  } catch (error) {
    console.error('Fetch user payments error:', error);
    res.status(500).json({ message: 'Error retrieving user payment history' });
  }
});

// POST /api/payments (Process mock payment & entitle game in library)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { game_id, amount, payment_method, payment_status } = req.body;
    const userId = req.user.id;

    if (!game_id || amount === undefined || !payment_method) {
      return res.status(400).json({ message: 'Game ID, amount, and payment method are required' });
    }

    const status = payment_status || 'Completed';
    const currentDate = new Date().toISOString().split('T')[0];

    // 1. Insert into PAYMENT table
    const paymentResult = await query(
      'INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, game_id, parseFloat(amount), status, payment_method, currentDate]
    );

    // 2. If status is Completed, add to LIBRARY table
    if (status === 'Completed') {
      // Check if already in library
      const existingLib = await query(
        'SELECT * FROM `LIBRARY` WHERE user_id = ? AND game_id = ?',
        [userId, game_id]
      );

      if (!existingLib || existingLib.length === 0) {
        await query(
          'INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status) VALUES (?, ?, ?, ?)',
          [userId, game_id, currentDate, 'Owned']
        );
      }
    }

    res.status(201).json({
      message: 'Payment processed successfully',
      payment_id: paymentResult.insertId,
      payment: {
        payment_id: paymentResult.insertId,
        user_id: userId,
        game_id,
        amount: parseFloat(amount),
        payment_status: status,
        payment_method,
        payment_date: currentDate
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Error processing purchase transaction' });
  }
});

module.exports = router;
