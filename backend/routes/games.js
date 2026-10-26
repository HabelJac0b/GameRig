const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/games
router.get('/', async (req, res) => {
  try {
    const { genre, platform, search, sortBy, sortOrder } = req.query;

    let games = await query('SELECT * FROM GAME');

    // Filtering & Searching in JS / SQL
    if (genre && genre !== 'All') {
      games = games.filter(g => g.genre.toLowerCase().includes(genre.toLowerCase()));
    }
    if (platform && platform !== 'All') {
      games = games.filter(g => g.platform.toLowerCase().includes(platform.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      games = games.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q)
      );
    }

    // Attach calculated average rating & review count
    const allReviews = await query('SELECT * FROM REVIEW');
    games = games.map(g => {
      const gReviews = allReviews.filter(r => r.game_id === g.game_id);
      const avg = gReviews.length ? (gReviews.reduce((sum, r) => sum + Number(r.rating), 0) / gReviews.length).toFixed(1) : '5.0';
      return {
        ...g,
        avg_rating: Number(avg),
        review_count: gReviews.length
      };
    });

    // Sorting
    if (sortBy === 'price') {
      games.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    } else if (sortBy === 'rating') {
      games.sort((a, b) => sortOrder === 'asc' ? a.avg_rating - b.avg_rating : b.avg_rating - a.avg_rating);
    } else if (sortBy === 'title') {
      games.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'release_date') {
      games.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    }

    res.json(games);
  } catch (error) {
    console.error('Fetch games error:', error);
    res.status(500).json({ message: 'Error retrieving games catalog' });
  }
});

// GET /api/games/:id
router.get('/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const games = await query('SELECT * FROM GAME WHERE game_id = ?', [gameId]);
    if (!games || games.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const game = games[0];
    const reviews = await query(
      'SELECT r.*, u.name as user_name FROM REVIEW r JOIN `USER` u ON r.user_id = u.user_id WHERE r.game_id = ? ORDER BY r.review_date DESC',
      [gameId]
    );

    const avg = reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1) : '5.0';

    res.json({
      ...game,
      avg_rating: Number(avg),
      review_count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Fetch game detail error:', error);
    res.status(500).json({ message: 'Error retrieving game details' });
  }
});

// POST /api/games (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, genre, price, platform, release_date, image } = req.body;

    if (!title || !genre || price === undefined || !platform) {
      return res.status(400).json({ message: 'Title, genre, price, and platform are required' });
    }

    const adminId = req.user.id;
    const releaseDate = release_date || new Date().toISOString().split('T')[0];

    const result = await query(
      'INSERT INTO GAME (title, description, genre, price, platform, release_date, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', genre, parseFloat(price), platform, releaseDate, adminId]
    );

    res.status(201).json({
      message: 'Game created successfully',
      game_id: result.insertId,
      game: {
        game_id: result.insertId,
        title,
        description,
        genre,
        price: parseFloat(price),
        platform,
        release_date: releaseDate,
        admin_id: adminId,
        image
      }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Error adding new game' });
  }
});

// PUT /api/games/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const gameId = req.params.id;
    const { title, description, genre, price, platform, release_date } = req.body;

    const result = await query(
      'UPDATE GAME SET title = ?, description = ?, genre = ?, price = ?, platform = ?, release_date = ? WHERE game_id = ?',
      [title, description, genre, parseFloat(price), platform, release_date, gameId]
    );

    res.json({ message: 'Game updated successfully' });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ message: 'Error updating game' });
  }
});

// DELETE /api/games/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const gameId = req.params.id;
    await query('DELETE FROM GAME WHERE game_id = ?', [gameId]);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Error deleting game' });
  }
});

module.exports = router;
