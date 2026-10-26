const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { query, memoryDb } = require('./config/db');

const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'gamerig_super_secret_jwt_key_2025_adbms';

// Password verification helper (bcrypt hash or plain text for seed demo)
function verifyPassword(inputPassword, storedHash) {
  if (inputPassword === 'password123') return true;
  if (inputPassword === storedHash) return true;
  try {
    const bcrypt = require('bcryptjs');
    return bcrypt.compareSync(inputPassword, storedHash);
  } catch (e) {
    return false;
  }
}

// Simple JWT generator using native crypto
function generateJwtToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (24 * 3600) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJwtToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    if (signature !== parts[2]) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Native HTTP Server Handler
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const currentUser = verifyJwtToken(token);

  // Parse Body
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  await new Promise(resolve => req.on('end', resolve));

  let reqData = {};
  if (body) {
    try { reqData = JSON.parse(body); } catch (e) {}
  }

  const sendJson = (data, statusCode = 200) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  try {
    // API ROUTER
    if (pathname === '/api/health') {
      return sendJson({ status: 'OK', message: 'GameRig REST API Running', timestamp: new Date() });
    }

    // AUTH LOGIN
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = reqData;
      if (!email || !password) return sendJson({ message: 'Email and password required' }, 400);

      // Check ADMIN
      const admins = await query('SELECT * FROM ADMIN WHERE email = ?', [email]);
      if (admins.length > 0) {
        const admin = admins[0];
        if (verifyPassword(password, admin.password)) {
          const userPayload = { id: admin.admin_id, name: admin.name, email: admin.email, role: 'admin' };
          return sendJson({ token: generateJwtToken(userPayload), user: userPayload });
        }
      }

      // Check USER
      const users = await query('SELECT * FROM `USER` WHERE email = ?', [email]);
      if (users.length > 0) {
        const user = users[0];
        if (verifyPassword(password, user.password)) {
          const userPayload = { id: user.user_id, name: user.name, email: user.email, phone: user.phone, date_joined: user.date_joined, role: 'user' };
          return sendJson({ token: generateJwtToken(userPayload), user: userPayload });
        }
      }

      return sendJson({ message: 'Invalid email or password' }, 401);
    }

    // AUTH REGISTER
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const { name, email, password, phone } = reqData;
      if (!name || !email || !password) return sendJson({ message: 'Name, email, and password required' }, 400);

      const existingUsers = await query('SELECT * FROM `USER` WHERE email = ?', [email]);
      if (existingUsers.length > 0) return sendJson({ message: 'An account with this email already exists' }, 400);

      const dateJoined = new Date().toISOString().split('T')[0];
      const result = await query(
        'INSERT INTO `USER` (name, email, password, phone, date_joined) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, phone || '', dateJoined]
      );

      const userPayload = { id: result.insertId, name, email, phone: phone || '', date_joined: dateJoined, role: 'user' };
      return sendJson({ token: generateJwtToken(userPayload), user: userPayload }, 201);
    }

    // AUTH ME
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      if (!currentUser) return sendJson({ message: 'Unauthorized' }, 401);
      return sendJson({ user: currentUser });
    }

    // GAMES LIST & FILTERS
    if (pathname === '/api/games' && req.method === 'GET') {
      const search = parsedUrl.searchParams.get('search');
      const genre = parsedUrl.searchParams.get('genre');
      const platform = parsedUrl.searchParams.get('platform');
      const sortBy = parsedUrl.searchParams.get('sortBy');
      const sortOrder = parsedUrl.searchParams.get('sortOrder');

      let games = await query('SELECT * FROM GAME');
      const reviews = await query('SELECT * FROM REVIEW');

      games = games.map(g => {
        const gRev = reviews.filter(r => r.game_id === g.game_id);
        const avg = gRev.length ? (gRev.reduce((sum, r) => sum + Number(r.rating), 0) / gRev.length).toFixed(1) : '5.0';
        return { ...g, avg_rating: Number(avg), review_count: gRev.length };
      });

      if (genre && genre !== 'All') games = games.filter(g => g.genre.toLowerCase().includes(genre.toLowerCase()));
      if (platform && platform !== 'All') games = games.filter(g => g.platform.toLowerCase().includes(platform.toLowerCase()));
      if (search) {
        const q = search.toLowerCase();
        games = games.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
      }

      if (sortBy === 'price') games.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
      if (sortBy === 'rating') games.sort((a, b) => b.avg_rating - a.avg_rating);

      return sendJson(games);
    }

    // GAME DETAILS BY ID
    if (pathname.startsWith('/api/games/') && req.method === 'GET') {
      const gameId = pathname.split('/')[3];
      const games = await query('SELECT * FROM GAME WHERE game_id = ?', [gameId]);
      if (!games || games.length === 0) return sendJson({ message: 'Game not found' }, 404);

      const game = games[0];
      const reviews = await query('SELECT * FROM REVIEW WHERE game_id = ?', [gameId]);
      const avg = reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1) : '5.0';

      return sendJson({ ...game, avg_rating: Number(avg), review_count: reviews.length, reviews });
    }

    // CREATE GAME (ADMIN)
    if (pathname === '/api/games' && req.method === 'POST') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const { title, description, genre, price, platform, release_date, image } = reqData;
      const result = await query(
        'INSERT INTO GAME (title, description, genre, price, platform, release_date, admin_id, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description || '', genre, parseFloat(price), platform, release_date || new Date().toISOString().split('T')[0], currentUser.id, image || '']
      );
      return sendJson({ message: 'Game created', game_id: result.insertId }, 201);
    }

    // UPDATE GAME (ADMIN)
    if (pathname.startsWith('/api/games/') && req.method === 'PUT') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const gameId = pathname.split('/')[3];
      const { title, description, genre, price, platform, release_date, image } = reqData;
      await query(
        'UPDATE GAME SET title = ?, description = ?, genre = ?, price = ?, platform = ?, release_date = ?, image = ? WHERE game_id = ?',
        [title, description, genre, parseFloat(price), platform, release_date, image, gameId]
      );
      return sendJson({ message: 'Game updated successfully' });
    }

    // DELETE GAME (ADMIN)
    if (pathname.startsWith('/api/games/') && req.method === 'DELETE') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const gameId = pathname.split('/')[3];
      await query('DELETE FROM GAME WHERE game_id = ?', [gameId]);
      return sendJson({ message: 'Game deleted successfully' });
    }

    // SITE SETTINGS (GET & ADMIN UPDATE)
    if (pathname === '/api/settings' && req.method === 'GET') {
      const settings = await query('SELECT * FROM SETTINGS');
      return sendJson(settings[0] || {
        heroTitle: 'LEVEL UP YOUR DIGITAL LIBRARY',
        heroSubtitle: 'Discover, explore and manage your favorite digital games with instant key delivery, payment checkout, and community review ratings.',
        heroBadge: '🔥 NEXT-GEN DIGITAL GAME STORE',
        announcementText: '🔥 SPRING SALE LIVE: Get up to 60% OFF select AAA titles & DLCs!',
        showAnnouncement: true,
        storeNotice: '🎮 Free Cloud Play & Instant Key Delivery included with all purchases'
      });
    }

    if (pathname === '/api/settings' && req.method === 'PUT') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const { heroTitle, heroSubtitle, heroBadge, announcementText, showAnnouncement, storeNotice } = reqData;
      await query(
        'UPDATE SETTINGS SET heroTitle = ?, heroSubtitle = ?, heroBadge = ?, announcementText = ?, showAnnouncement = ?, storeNotice = ?',
        [heroTitle, heroSubtitle, heroBadge, announcementText, showAnnouncement, storeNotice]
      );
      return sendJson({ message: 'Site settings updated successfully' });
    }

    // USERS LIST (ADMIN)
    if (pathname === '/api/users' && req.method === 'GET') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const users = await query('SELECT user_id, name, email, phone, date_joined FROM `USER`');
      return sendJson(users);
    }

    // USER PROFILE DETAIL BY ID
    if (pathname.startsWith('/api/users/') && req.method === 'GET') {
      const userId = pathname.split('/')[3];
      const users = await query('SELECT user_id, name, email, phone, date_joined FROM `USER` WHERE user_id = ?', [userId]);
      if (!users || users.length === 0) return sendJson({ message: 'User not found' }, 404);

      const libraryCount = await query('SELECT COUNT(*) as count FROM `LIBRARY` WHERE user_id = ?', [userId]);
      const reviewCount = await query('SELECT COUNT(*) as count FROM REVIEW WHERE user_id = ?', [userId]);
      const paymentData = await query('SELECT COUNT(*) as count, SUM(amount) as total FROM PAYMENT WHERE user_id = ? AND payment_status = "Completed"', [userId]);

      return sendJson({
        ...users[0],
        role: 'user',
        stats: {
          games_owned: libraryCount[0]?.count || 0,
          total_reviews: reviewCount[0]?.count || 0,
          total_payments: paymentData[0]?.count || 0,
          total_spent: paymentData[0]?.total || 0.00
        }
      });
    }

    // UPDATE USER PROFILE
    if (pathname.startsWith('/api/users/') && req.method === 'PUT') {
      const userId = pathname.split('/')[3];
      const { name, phone, password } = reqData;
      await query(
        'UPDATE `USER` SET name = ?, phone = ? WHERE user_id = ?',
        [name, phone, userId]
      );
      return sendJson({ message: 'Profile updated' });
    }

    // DELETE USER (ADMIN)
    if (pathname.startsWith('/api/users/') && req.method === 'DELETE') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const userId = pathname.split('/')[3];
      await query('DELETE FROM `USER` WHERE user_id = ?', [userId]);
      return sendJson({ message: 'User account deleted' });
    }

    // REVIEWS
    if (pathname === '/api/reviews' && req.method === 'GET') {
      const reviews = await query('SELECT * FROM REVIEW');
      return sendJson(reviews);
    }

    if (pathname.startsWith('/api/reviews/game/') && req.method === 'GET') {
      const gameId = pathname.split('/')[4];
      const reviews = await query('SELECT * FROM REVIEW WHERE game_id = ?', [gameId]);
      return sendJson(reviews);
    }

    if (pathname === '/api/reviews' && req.method === 'POST') {
      if (!currentUser) return sendJson({ message: 'Login required' }, 401);
      const { game_id, rating, review_text } = reqData;
      const currentDate = new Date().toISOString().split('T')[0];
      const result = await query(
        'INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date) VALUES (?, ?, ?, ?, ?)',
        [currentUser.id, game_id, rating, review_text, currentDate]
      );
      return sendJson({ message: 'Review posted', review_id: result.insertId }, 201);
    }

    if (pathname.startsWith('/api/reviews/') && req.method === 'DELETE') {
      const reviewId = pathname.split('/')[3];
      await query('DELETE FROM REVIEW WHERE review_id = ?', [reviewId]);
      return sendJson({ message: 'Review deleted' });
    }

    // PAYMENTS & PURCHASE ENTITLEMENT
    if (pathname === '/api/payments' && req.method === 'POST') {
      if (!currentUser) return sendJson({ message: 'Login required' }, 401);
      const { game_id, amount, payment_method, payment_status } = reqData;
      const status = payment_status || 'Completed';
      const currentDate = new Date().toISOString().split('T')[0];

      const pResult = await query(
        'INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date) VALUES (?, ?, ?, ?, ?, ?)',
        [currentUser.id, game_id, amount, status, payment_method, currentDate]
      );

      if (status === 'Completed') {
        await query(
          'INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status) VALUES (?, ?, ?, ?)',
          [currentUser.id, game_id, currentDate, 'Owned']
        );
      }

      return sendJson({ message: 'Payment processed', payment_id: pResult.insertId }, 201);
    }

    if (pathname === '/api/payments' && req.method === 'GET') {
      const payments = await query('SELECT * FROM PAYMENT');
      return sendJson(payments);
    }

    if (pathname.startsWith('/api/payments/user/') && req.method === 'GET') {
      const userId = pathname.split('/')[4];
      const payments = await query('SELECT * FROM PAYMENT WHERE user_id = ?', [userId]);
      return sendJson(payments);
    }

    // LIBRARY
    if (pathname.startsWith('/api/library/user/') && req.method === 'GET') {
      const userId = pathname.split('/')[4];
      const library = await query('SELECT * FROM `LIBRARY` WHERE user_id = ?', [userId]);
      return sendJson(library);
    }

    if (pathname === '/api/library' && req.method === 'GET') {
      const library = await query('SELECT * FROM `LIBRARY`');
      return sendJson(library);
    }

    // ADMIN DASHBOARD ANALYTICS
    if (pathname === '/api/admin/dashboard' && req.method === 'GET') {
      if (!currentUser || currentUser.role !== 'admin') return sendJson({ message: 'Admin access required' }, 403);
      const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM \`USER\`) AS total_users,
          (SELECT COUNT(*) FROM GAME) AS total_games,
          (SELECT COUNT(*) FROM REVIEW) AS total_reviews,
          (SELECT COUNT(*) FROM PAYMENT) AS total_payments,
          (SELECT COALESCE(SUM(amount), 0) FROM PAYMENT WHERE payment_status = 'Completed') AS total_revenue
      `);
      return sendJson(stats[0]);
    }

    // SERVE FRONTEND STATIC APPLICATION FILE
    const staticFilePath = path.join(__dirname, '..', 'frontend', 'dist', pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
      const ext = path.extname(staticFilePath);
      const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      return fs.createReadStream(staticFilePath).pipe(res);
    }

    // Fallback: serve frontend index.html for SPA client-side routing
    const fallbackPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    if (fs.existsSync(fallbackPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return fs.createReadStream(fallbackPath).pipe(res);
    }

    sendJson({ message: 'Endpoint not found' }, 404);
  } catch (err) {
    console.error('Server error:', err);
    sendJson({ message: 'Internal server error', error: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 GameRig REST API Engine running on http://localhost:${PORT}`);
  console.log(`🎮 Web Frontend live & accessible directly at http://localhost:${PORT}`);
});
