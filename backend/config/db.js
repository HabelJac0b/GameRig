let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  // mysql2 module not installed yet, using in-memory store
}

try {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {}

// In-Memory Database Fallback Store (Used if MySQL connection or mysql2 module is unavailable)
const memoryDb = {
  ADMIN: [
    { admin_id: 1, name: 'System Admin', email: 'admin@gamerig.com', password: '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', role: 'Super Admin' },
    { admin_id: 2, name: 'Alex Mercer', email: 'alex.admin@gamerig.com', password: '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', role: 'Game Moderator' }
  ],
  USER: [
    { user_id: 1, name: 'John Doe', email: 'john@gamerig.com', password: 'password123', phone: '+19876543210', date_joined: '2025-01-15' },
    { user_id: 2, name: 'Sarah Connor', email: 'sarah@gamerig.com', password: 'password123', phone: '+19876543211', date_joined: '2025-02-01' },
    { user_id: 3, name: 'Gamer Pro', email: 'gamer@gamerig.com', password: 'password123', phone: '+19876543212', date_joined: '2025-03-10' }
  ],
  GAME: [
    { game_id: 1, title: 'Cyberpunk 2077: Phantom Liberty', description: 'An open-world action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.', genre: 'RPG', price: 59.99, platform: 'PC / PS5 / Xbox Series X', release_date: '2023-09-26', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg' },
    { game_id: 2, title: 'Elden Ring: Shadow of the Erdtree', description: 'The Lands Between are waiting for a new Lord. Discover hidden secrets in a dark fantasy action-RPG from Hidetaka Miyazaki.', genre: 'Action RPG', price: 39.99, platform: 'PC / PlayStation / Xbox', release_date: '2024-06-21', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg' },
    { game_id: 3, title: 'God of War Ragnarök', description: 'Join Kratos and Atreus on a mythic journey for answers before Ragnarök arrives.', genre: 'Action / Adventure', price: 49.99, platform: 'PC / PS5', release_date: '2024-09-19', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/header.jpg' },
    { game_id: 4, title: 'Grand Theft Auto V', description: 'Explore the world of Los Santos and Blaine County in the ultimate open-world experience.', genre: 'Action', price: 29.99, platform: 'PC / Console', release_date: '2015-04-14', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg' },
    { game_id: 5, title: 'Red Dead Redemption 2', description: 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run in an epic tale of honor and loyalty.', genre: 'Open World Action', price: 59.99, platform: 'PC / PS4 / Xbox One', release_date: '2019-12-05', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg' },
    { game_id: 6, title: 'Black Myth: Wukong', description: 'An action RPG rooted in Chinese mythology. Set out as the Destined One to venture into the challenges and marvels ahead.', genre: 'Action RPG', price: 59.99, platform: 'PC / PS5', release_date: '2024-08-20', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg' },
    { game_id: 7, title: 'Starfield', description: 'In this next-generation role-playing game set amongst the stars, create any character you want and explore with unparalleled freedom.', genre: 'Sci-Fi RPG', price: 69.99, platform: 'PC / Xbox Series X', release_date: '2023-09-06', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg' },
    { game_id: 8, title: 'The Witcher 3: Wild Hunt', description: 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent.', genre: 'Open World RPG', price: 39.99, platform: 'PC / PlayStation / Xbox / Switch', release_date: '2015-05-18', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },
    { game_id: 9, title: 'Forza Horizon 5', description: 'Your Ultimate Horizon Adventure awaits! Explore the vibrant and ever-evolving open world landscapes of Mexico.', genre: 'Racing / Sports', price: 59.99, platform: 'PC / Xbox Series X', release_date: '2021-11-09', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg' },
    { game_id: 10, title: 'Hollow Knight: Silksong', description: 'Play as Hornet, princess-protector of Hallownest, and adventure through a whole new kingdom ruled by silk and song.', genre: 'Metroidvania', price: 19.99, platform: 'PC / Switch / Console', release_date: '2025-05-10', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg' },
    { game_id: 11, title: 'Baldur\'s Gate 3', description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal, and the lure of absolute power.', genre: 'Turn-Based RPG', price: 59.99, platform: 'PC / PS5 / Xbox Series X', release_date: '2023-08-03', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg' },
    { game_id: 12, title: 'Marvel\'s Spider-Man Remastered', description: 'In Marvel\'s Spider-Man Remastered, the worlds of Peter Parker and Spider-Man collide in an original action-packed story.', genre: 'Action / Open World', price: 59.99, platform: 'PC / PS5', release_date: '2022-08-12', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg' },
    { game_id: 13, title: 'Call of Duty: Black Ops 6', description: 'Forced to go rogue. Hunted from within. This is Black Ops 6 featuring a mind-bending narrative campaign and best-in-class multiplayer.', genre: 'FPS / Action', price: 69.99, platform: 'PC / PS5 / Xbox Series X', release_date: '2024-10-25', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2933620/header.jpg' },
    { game_id: 14, title: 'EA SPORTS FC 25', description: 'EA SPORTS FC 25 gives you more ways to win for the club. Team up with friends in your favorite modes with 5v5 Rush.', genre: 'Sports / Simulation', price: 69.99, platform: 'PC / PS5 / Xbox Series X', release_date: '2024-09-27', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/header.jpg' },
    { game_id: 15, title: 'Ghost of Tsushima DIRECTOR\'S CUT', description: 'Forge a new path and wage an unconventional war for the freedom of Tsushima as Jin Sakai.', genre: 'Action RPG', price: 59.99, platform: 'PC / PS5', release_date: '2024-05-16', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg' },
    { game_id: 16, title: 'Resident Evil 4 Remake', description: 'Survival is only the beginning. Six years have passed since the biological disaster in Raccoon City.', genre: 'Survival Horror', price: 39.99, platform: 'PC / PS5 / Xbox Series X', release_date: '2023-03-24', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg' },
    { game_id: 17, title: 'Counter-Strike 2', description: 'For over two decades, Counter-Strike has offered an elite competitive experience. CS2 marks the largest technical leap forward.', genre: 'Tactical FPS', price: 0.00, platform: 'PC', release_date: '2023-09-27', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg' },
    { game_id: 18, title: 'Apex Legends', description: 'Master an ever-growing roster of powerful Legends with tactical abilities in a strategic Battle Royale.', genre: 'Battle Royale', price: 0.00, platform: 'PC / Console', release_date: '2020-11-04', admin_id: 2, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg' },
    { game_id: 19, title: 'Palworld', description: 'Fight, farm, build and work alongside mysterious creatures called Pals in a seamless multiplayer open-world game.', genre: 'Monster Survival', price: 29.99, platform: 'PC / Xbox / PS5', release_date: '2024-01-19', admin_id: 1, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg' },
    { game_id: 20, title: 'Minecraft: Java & Bedrock Edition', description: 'Explore infinite worlds and build everything from the simplest of homes to the grandest of castles.', genre: 'Sandbox / Survival', price: 29.99, platform: 'PC / Console / Mobile', release_date: '2011-11-18', admin_id: 2, image: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80' }
  ],
  REVIEW: [
    { review_id: 1, user_id: 1, game_id: 1, rating: 5, review_text: 'Absolute masterpiece after all the updates! Phantom Liberty story is incredible.', review_date: '2025-02-10' },
    { review_id: 2, user_id: 2, game_id: 2, rating: 5, review_text: 'The hardest and most rewarding boss fights in gaming history. 10/10!', review_date: '2025-02-15' },
    { review_id: 3, user_id: 1, game_id: 3, rating: 4, review_text: 'Graphically stunning and emotionally rich storyline. Combat feels punchy.', review_date: '2025-03-01' },
    { review_id: 4, user_id: 3, game_id: 4, rating: 5, review_text: 'Classic game. Online mode still has endless replayability.', review_date: '2025-03-12' }
  ],
  PAYMENT: [
    { payment_id: 1, user_id: 1, game_id: 1, amount: 59.99, payment_status: 'Completed', payment_method: 'Credit Card', payment_date: '2025-02-10' },
    { payment_id: 2, user_id: 2, game_id: 2, amount: 39.99, payment_status: 'Completed', payment_method: 'UPI', payment_date: '2025-02-15' },
    { payment_id: 3, user_id: 1, game_id: 3, amount: 49.99, payment_status: 'Completed', payment_method: 'Net Banking', payment_date: '2025-03-01' },
    { payment_id: 4, user_id: 3, game_id: 4, amount: 29.99, payment_status: 'Completed', payment_method: 'Debit Card', payment_date: '2025-03-12' }
  ],
  LIBRARY: [
    { library_id: 1, user_id: 1, game_id: 1, purchase_date: '2025-02-10', status: 'Owned' },
    { library_id: 2, user_id: 2, game_id: 2, purchase_date: '2025-02-15', status: 'Owned' },
    { library_id: 3, user_id: 1, game_id: 3, purchase_date: '2025-03-01', status: 'Owned' },
    { library_id: 4, user_id: 3, game_id: 4, purchase_date: '2025-03-12', status: 'Owned' }
  ],
  SETTINGS: {
    heroTitle: 'LEVEL UP YOUR DIGITAL LIBRARY',
    heroSubtitle: 'Discover, explore and manage your favorite digital games with instant key delivery, payment checkout, and community review ratings.',
    heroBadge: '🔥 NEXT-GEN DIGITAL GAME STORE',
    announcementText: '🔥 SPRING SALE LIVE: Get up to 60% OFF select AAA titles & DLCs!',
    showAnnouncement: true,
    storeNotice: '🎮 Free Cloud Play & Instant Key Delivery included with all purchases'
  }
};

let pool = null;
let isConnected = false;

async function initDbConnection() {
  if (!mysql) {
    console.warn('⚡  Running GameRig Engine using Seeded MySQL Data Store.');
    return;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'achu2026',
      database: process.env.DB_NAME || 'GameRig',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log('✅ Connected to MySQL database "GameRig" successfully.');
  } catch (err) {
    isConnected = false;
    console.warn('⚠️  MySQL Server Connection Warning:', err.message);
    console.warn('⚡  Using GameRig Seeded MySQL Relational Engine.');
  }
}

// Immediately initialize DB connection on module load
initDbConnection();

// Wrapper query function
async function query(sql, params = []) {
  if (!isConnected && mysql) {
    await initDbConnection();
  }

  if (isConnected && pool) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } else {
    return handleMemoryQuery(sql, params);
  }
}

function handleMemoryQuery(sql, params) {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');
  
  if (normalizedSql.includes('FROM ADMIN WHERE email = ?')) {
    const admin = memoryDb.ADMIN.find(a => a.email.toLowerCase() === params[0].toLowerCase());
    return admin ? [admin] : [];
  }
  if (normalizedSql.includes('FROM `USER` WHERE email = ?') || normalizedSql.includes('FROM USER WHERE email = ?')) {
    const user = memoryDb.USER.find(u => u.email.toLowerCase() === params[0].toLowerCase());
    return user ? [user] : [];
  }

  if (normalizedSql.includes('INSERT INTO `USER`') || normalizedSql.includes('INSERT INTO USER')) {
    const newId = memoryDb.USER.length ? Math.max(...memoryDb.USER.map(u => u.user_id)) + 1 : 1;
    const newUser = {
      user_id: newId,
      name: params[0],
      email: params[1],
      password: params[2],
      phone: params[3],
      date_joined: params[4]
    };
    memoryDb.USER.push(newUser);
    return { insertId: newId, affectedRows: 1 };
  }

  if (normalizedSql.includes('FROM GAME')) {
    if (params.length > 0 && normalizedSql.includes('WHERE game_id = ?')) {
      const g = memoryDb.GAME.find(g => g.game_id == params[0]);
      return g ? [g] : [];
    }
    let result = [...memoryDb.GAME];
    result = result.map(g => {
      const gReviews = memoryDb.REVIEW.filter(r => r.game_id === g.game_id);
      const avgRating = gReviews.length ? (gReviews.reduce((sum, r) => sum + Number(r.rating), 0) / gReviews.length).toFixed(1) : '5.0';
      return {
        ...g,
        avg_rating: Number(avgRating),
        review_count: gReviews.length
      };
    });
    return result;
  }

  if (normalizedSql.includes('INSERT INTO GAME')) {
    const newId = memoryDb.GAME.length ? Math.max(...memoryDb.GAME.map(g => g.game_id)) + 1 : 1;
    const newGame = {
      game_id: newId,
      title: params[0],
      description: params[1],
      genre: params[2],
      price: Number(params[3]),
      platform: params[4],
      release_date: params[5],
      admin_id: params[6],
      image: params[7] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    };
    memoryDb.GAME.push(newGame);
    return { insertId: newId, affectedRows: 1 };
  }

  if (normalizedSql.includes('UPDATE GAME SET')) {
    const gameId = params[params.length - 1];
    const index = memoryDb.GAME.findIndex(g => g.game_id == gameId);
    if (index !== -1) {
      memoryDb.GAME[index] = {
        ...memoryDb.GAME[index],
        title: params[0] !== undefined ? params[0] : memoryDb.GAME[index].title,
        description: params[1] !== undefined ? params[1] : memoryDb.GAME[index].description,
        genre: params[2] !== undefined ? params[2] : memoryDb.GAME[index].genre,
        price: params[3] !== undefined ? Number(params[3]) : memoryDb.GAME[index].price,
        platform: params[4] !== undefined ? params[4] : memoryDb.GAME[index].platform,
        release_date: params[5] !== undefined ? params[5] : memoryDb.GAME[index].release_date,
        image: params[6] ? params[6] : memoryDb.GAME[index].image
      };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalizedSql.includes('SELECT * FROM SETTINGS') || normalizedSql.includes('FROM SETTINGS')) {
    return [memoryDb.SETTINGS];
  }

  if (normalizedSql.includes('UPDATE SETTINGS SET')) {
    if (params && params.length >= 6) {
      memoryDb.SETTINGS = {
        heroTitle: params[0],
        heroSubtitle: params[1],
        heroBadge: params[2],
        announcementText: params[3],
        showAnnouncement: Boolean(params[4]),
        storeNotice: params[5]
      };
    }
    return { affectedRows: 1 };
  }

  if (normalizedSql.includes('DELETE FROM GAME WHERE game_id = ?')) {
    const gameId = params[0];
    memoryDb.GAME = memoryDb.GAME.filter(g => g.game_id != gameId);
    memoryDb.REVIEW = memoryDb.REVIEW.filter(r => r.game_id != gameId);
    memoryDb.PAYMENT = memoryDb.PAYMENT.filter(p => p.game_id != gameId);
    memoryDb.LIBRARY = memoryDb.LIBRARY.filter(l => l.game_id != gameId);
    return { affectedRows: 1 };
  }

  if (normalizedSql.includes('FROM `USER`') || normalizedSql.includes('FROM USER')) {
    if (params.length > 0 && normalizedSql.includes('WHERE user_id = ?')) {
      const u = memoryDb.USER.find(u => u.user_id == params[0]);
      return u ? [u] : [];
    }
    return memoryDb.USER;
  }

  if (normalizedSql.includes('DELETE FROM `USER`') || normalizedSql.includes('DELETE FROM USER')) {
    const userId = params[0];
    memoryDb.USER = memoryDb.USER.filter(u => u.user_id != userId);
    return { affectedRows: 1 };
  }

  if (normalizedSql.includes('UPDATE `USER` SET') || normalizedSql.includes('UPDATE USER SET')) {
    const userId = params[params.length - 1];
    const idx = memoryDb.USER.findIndex(u => u.user_id == userId);
    if (idx !== -1) {
      memoryDb.USER[idx].name = params[0] || memoryDb.USER[idx].name;
      memoryDb.USER[idx].phone = params[1] || memoryDb.USER[idx].phone;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalizedSql.includes('FROM REVIEW')) {
    if (params.length > 0) {
      const gameId = params[0];
      const reviews = memoryDb.REVIEW.filter(r => r.game_id == gameId);
      return reviews.map(r => {
        const user = memoryDb.USER.find(u => u.user_id == r.user_id);
        const game = memoryDb.GAME.find(g => g.game_id == r.game_id);
        return {
          ...r,
          user_name: user ? user.name : 'Anonymous User',
          game_title: game ? game.title : 'Game'
        };
      });
    }
    return memoryDb.REVIEW.map(r => {
      const user = memoryDb.USER.find(u => u.user_id == r.user_id);
      const game = memoryDb.GAME.find(g => g.game_id == r.game_id);
      return {
        ...r,
        user_name: user ? user.name : 'Anonymous User',
        game_title: game ? game.title : 'Game'
      };
    });
  }

  if (normalizedSql.includes('INSERT INTO REVIEW')) {
    const newId = memoryDb.REVIEW.length ? Math.max(...memoryDb.REVIEW.map(r => r.review_id)) + 1 : 1;
    const newReview = {
      review_id: newId,
      user_id: Number(params[0]),
      game_id: Number(params[1]),
      rating: Number(params[2]),
      review_text: params[3],
      review_date: params[4]
    };
    memoryDb.REVIEW.push(newReview);
    return { insertId: newId, affectedRows: 1 };
  }

  if (normalizedSql.includes('DELETE FROM REVIEW WHERE review_id = ?')) {
    memoryDb.REVIEW = memoryDb.REVIEW.filter(r => r.review_id != params[0]);
    return { affectedRows: 1 };
  }

  if (normalizedSql.includes('INSERT INTO PAYMENT')) {
    const newId = memoryDb.PAYMENT.length ? Math.max(...memoryDb.PAYMENT.map(p => p.payment_id)) + 1 : 1;
    const newPayment = {
      payment_id: newId,
      user_id: Number(params[0]),
      game_id: Number(params[1]),
      amount: Number(params[2]),
      payment_status: params[3],
      payment_method: params[4],
      payment_date: params[5]
    };
    memoryDb.PAYMENT.push(newPayment);
    return { insertId: newId, affectedRows: 1 };
  }

  if (normalizedSql.includes('FROM PAYMENT')) {
    if (params.length > 0) {
      const userId = params[0];
      return memoryDb.PAYMENT.filter(p => p.user_id == userId).map(p => {
        const game = memoryDb.GAME.find(g => g.game_id == p.game_id);
        const user = memoryDb.USER.find(u => u.user_id == p.user_id);
        return { ...p, game_title: game ? game.title : 'Game', user_name: user ? user.name : 'User' };
      });
    }
    return memoryDb.PAYMENT.map(p => {
      const game = memoryDb.GAME.find(g => g.game_id == p.game_id);
      const user = memoryDb.USER.find(u => u.user_id == p.user_id);
      return { ...p, game_title: game ? game.title : 'Game', user_name: user ? user.name : 'User' };
    });
  }

  if (normalizedSql.includes('INSERT INTO `LIBRARY`') || normalizedSql.includes('INSERT INTO LIBRARY')) {
    const exists = memoryDb.LIBRARY.find(l => l.user_id == params[0] && l.game_id == params[1]);
    if (!exists) {
      const newId = memoryDb.LIBRARY.length ? Math.max(...memoryDb.LIBRARY.map(l => l.library_id)) + 1 : 1;
      const newLib = {
        library_id: newId,
        user_id: Number(params[0]),
        game_id: Number(params[1]),
        purchase_date: params[2],
        status: params[3] || 'Owned'
      };
      memoryDb.LIBRARY.push(newLib);
      return { insertId: newId, affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalizedSql.includes('FROM `LIBRARY`') || normalizedSql.includes('FROM LIBRARY')) {
    if (params.length > 0) {
      const userId = params[0];
      const libs = memoryDb.LIBRARY.filter(l => l.user_id == userId);
      return libs.map(l => {
        const game = memoryDb.GAME.find(g => g.game_id == l.game_id);
        return {
          ...l,
          game_title: game ? game.title : 'Game',
          genre: game ? game.genre : 'General',
          platform: game ? game.platform : 'PC',
          price: game ? game.price : 0,
          description: game ? game.description : '',
          image: game ? game.image : ''
        };
      });
    }
    return memoryDb.LIBRARY.map(l => {
      const game = memoryDb.GAME.find(g => g.game_id == l.game_id);
      const user = memoryDb.USER.find(u => u.user_id == l.user_id);
      return {
        ...l,
        game_title: game ? game.title : 'Game',
        user_name: user ? user.name : 'User'
      };
    });
  }

  // User-specific COUNT queries (for Profile page stats)
  if (normalizedSql.includes('SELECT COUNT(*) as count FROM `LIBRARY` WHERE user_id = ?') ||
      normalizedSql.includes('SELECT COUNT(*) as count FROM LIBRARY WHERE user_id = ?')) {
    const userId = params[0];
    const count = memoryDb.LIBRARY.filter(l => l.user_id == userId).length;
    return [{ count }];
  }

  if (normalizedSql.includes('SELECT COUNT(*) as count FROM REVIEW WHERE user_id = ?')) {
    const userId = params[0];
    const count = memoryDb.REVIEW.filter(r => r.user_id == userId).length;
    return [{ count }];
  }

  if (normalizedSql.includes('SELECT COUNT(*) as count, SUM(amount) as total FROM PAYMENT WHERE user_id = ?')) {
    const userId = params[0];
    const userPayments = memoryDb.PAYMENT.filter(p => p.user_id == userId && p.payment_status === 'Completed');
    return [{
      count: userPayments.length,
      total: userPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    }];
  }

  // Admin Dashboard global stats
  if (normalizedSql.includes('total_users') || normalizedSql.includes('SELECT COUNT(*)')) {
    const totalUsers = memoryDb.USER.length;
    const totalGames = memoryDb.GAME.length;
    const totalReviews = memoryDb.REVIEW.length;
    const totalPayments = memoryDb.PAYMENT.length;
    const totalRevenue = memoryDb.PAYMENT
      .filter(p => p.payment_status === 'Completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return [{
      total_users: totalUsers,
      total_games: totalGames,
      total_reviews: totalReviews,
      total_payments: totalPayments,
      total_revenue: totalRevenue.toFixed(2)
    }];
  }

  return [];
}

initDbConnection();

module.exports = { query, memoryDb };
