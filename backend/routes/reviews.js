const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reviews (All reviews for admin table)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reviews = await query(
      'SELECT r.*, u.name as user_name, u.email as user_email, g.title as game_title FROM REVIEW r JOIN `USER` u ON r.user_id = u.user_id JOIN GAME g ON r.game_id = g.game_id ORDER BY r.review_date DESC'
    );
    res.json(reviews);
  } catch (error) {
    console.error('Fetch all reviews error:', error);
    res.status(500).json({ message: 'Error retrieving reviews list' });
  }
});

// GET /api/reviews/game/:gameId
router.get('/game/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const reviews = await query(
      'SELECT r.*, u.name as user_name FROM REVIEW r JOIN `USER` u ON r.user_id = u.user_id WHERE r.game_id = ? ORDER BY r.review_date DESC',
      [gameId]
    );
    res.json(reviews);
  } catch (error) {
    console.error('Fetch game reviews error:', error);
    res.status(500).json({ message: 'Error retrieving game reviews' });
  }
});

// POST /api/reviews (Submit review)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { game_id, rating, review_text } = req.body;
    const userId = req.user.id;

    if (!game_id || !rating || !review_text) {
      return res.status(400).json({ message: 'Game ID, rating, and review text are required' });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const reviewDate = new Date().toISOString().split('T')[0];

    const result = await query(
      'INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date) VALUES (?, ?, ?, ?, ?)',
      [userId, game_id, numericRating, review_text, reviewDate]
    );

    res.status(201).json({
      message: 'Review submitted successfully',
      review_id: result.insertId,
      review: {
        review_id: result.insertId,
        user_id: userId,
        user_name: req.user.name,
        game_id,
        rating: numericRating,
        review_text,
        review_date: reviewDate
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Admin or review owner can delete
    const reviews = await query('SELECT * FROM REVIEW WHERE review_id = ?', [reviewId]);
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = reviews[0];
    if (req.user.role !== 'admin' && req.user.id != review.user_id) {
      return res.status(403).json({ message: 'Unauthorized to delete this review' });
    }

    await query('DELETE FROM REVIEW WHERE review_id = ?', [reviewId]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;
