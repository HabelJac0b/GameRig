-- ============================================================================
-- GAMERIG DATABASE — PHASE 2: DATABASE CREATION & DATA PREPARATION
-- ADBMS Project — Complete MySQL Script
-- ============================================================================
-- Run this entire file in MySQL:
--   mysql -u root -p < GameRig_Phase2_Complete.sql
-- Or paste sections into MySQL Workbench / CLI one at a time.
-- ============================================================================


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 1 — DDL: CREATE DATABASE & CREATE TABLE
-- ████████████████████████████████████████████████████████████████████████████

-- 1.1  Create the database
CREATE DATABASE IF NOT EXISTS GameRig_DB;
USE GameRig_DB;

-- 1.2  Drop existing tables (reverse order of FK dependencies)
DROP TABLE IF EXISTS `LIBRARY`;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS REVIEW;
DROP TABLE IF EXISTS GAME;
DROP TABLE IF EXISTS `USER`;
DROP TABLE IF EXISTS ADMIN;

-- 1.3  ADMIN table
CREATE TABLE ADMIN (
    admin_id    INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,          -- UNIQUE prevents duplicate emails
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(50)     DEFAULT 'Admin'
);

-- 1.4  USER table  (USER is a MySQL reserved word → backticks)
CREATE TABLE `USER` (
    user_id     INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,          -- UNIQUE prevents duplicate emails
    password    VARCHAR(255)    NOT NULL,
    phone       VARCHAR(15),                              -- NULL allowed (optional)
    date_joined DATE            NOT NULL
);

-- 1.5  GAME table
CREATE TABLE GAME (
    game_id      INT             PRIMARY KEY AUTO_INCREMENT,
    title        VARCHAR(150)    NOT NULL,
    description  TEXT,                                     -- NULL allowed (optional)
    genre        VARCHAR(50)     NOT NULL,
    price        DECIMAL(10,2)   NOT NULL DEFAULT 0.00
                                 CHECK (price >= 0),      -- no negative prices
    platform     VARCHAR(50)     NOT NULL,
    release_date DATE,
    image        VARCHAR(500),
    admin_id     INT,
    FOREIGN KEY (admin_id) REFERENCES ADMIN(admin_id) ON DELETE SET NULL
);

-- 1.6  REVIEW table
CREATE TABLE REVIEW (
    review_id    INT     PRIMARY KEY AUTO_INCREMENT,
    user_id      INT     NOT NULL,
    game_id      INT     NOT NULL,
    rating       INT     NOT NULL CHECK (rating >= 1 AND rating <= 5),   -- valid range 1–5
    review_text  TEXT,                                                    -- NULL allowed (optional)
    review_date  DATE    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id)  ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)    ON DELETE CASCADE
);

-- 1.7  PAYMENT table
CREATE TABLE PAYMENT (
    payment_id      INT             PRIMARY KEY AUTO_INCREMENT,
    user_id         INT             NOT NULL,
    game_id         INT             NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL CHECK (amount >= 0),    -- no negative amounts
    payment_status  VARCHAR(30)     NOT NULL DEFAULT 'Completed',
    payment_method  VARCHAR(50)     NOT NULL,
    payment_date    DATE            NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)   ON DELETE CASCADE
);

-- 1.8  LIBRARY table
CREATE TABLE `LIBRARY` (
    library_id     INT          PRIMARY KEY AUTO_INCREMENT,
    user_id        INT          NOT NULL,
    game_id        INT          NOT NULL,
    purchase_date  DATE         NOT NULL,
    status         VARCHAR(30)  DEFAULT 'Owned',
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)   ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_id)   -- a user cannot own the same game twice
);


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 2 — DML: INSERT, UPDATE, DELETE
-- ████████████████████████████████████████████████████████████████████████████

-- ──────────────────────────────────────────────────────
-- 2.1  INSERT — Seed ADMIN (2 rows)
-- ──────────────────────────────────────────────────────
INSERT INTO ADMIN (name, email, password, role) VALUES
('System Admin',  'admin@gamerig.com',      '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', 'Super Admin'),
('Alex Mercer',   'alex.admin@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', 'Game Moderator');

-- ──────────────────────────────────────────────────────
-- 2.2  INSERT — Seed USER (3 rows, one with NULL phone)
-- ──────────────────────────────────────────────────────
INSERT INTO `USER` (name, email, password, phone, date_joined) VALUES
('John Doe',     'john@gamerig.com',  '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543210', '2025-01-15'),
('Sarah Connor', 'sarah@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543211', '2025-02-01'),
('Gamer Pro',    'gamer@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', NULL,           '2025-03-10');

-- ──────────────────────────────────────────────────────
-- 2.3  INSERT — Seed GAME (20 rows, some with NULL description)
-- ──────────────────────────────────────────────────────
INSERT INTO GAME (title, description, genre, price, platform, release_date, image, admin_id) VALUES
('Cyberpunk 2077: Phantom Liberty',
 'An open-world action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.',
 'RPG', 59.99, 'PC / PS5 / Xbox Series X', '2023-09-26',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', 1),

('Elden Ring: Shadow of the Erdtree',
 'The Lands Between are waiting for a new Lord. Discover hidden secrets in a dark fantasy action-RPG from Hidetaka Miyazaki.',
 'Action RPG', 39.99, 'PC / PlayStation / Xbox', '2024-06-21',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', 1),

('God of War Ragnarok',
 'Join Kratos and Atreus on a mythic journey for answers before Ragnarok arrives.',
 'Action / Adventure', 49.99, 'PC / PS5', '2024-09-19',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/header.jpg', 2),

('Grand Theft Auto V',
 'Explore the world of Los Santos and Blaine County in the ultimate open-world experience.',
 'Action', 29.99, 'PC / Console', '2015-04-14',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg', 1),

('Red Dead Redemption 2',
 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run in an epic tale of honor and loyalty.',
 'Open World Action', 59.99, 'PC / PS4 / Xbox One', '2019-12-05',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg', 1),

('Black Myth: Wukong',
 'An action RPG rooted in Chinese mythology. Set out as the Destined One to venture into the challenges and marvels ahead.',
 'Action RPG', 59.99, 'PC / PS5', '2024-08-20',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg', 2),

('Starfield',
 'In this next-generation role-playing game set amongst the stars, create any character you want and explore with unparalleled freedom.',
 'Sci-Fi RPG', 69.99, 'PC / Xbox Series X', '2023-09-06',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg', 2),

('The Witcher 3: Wild Hunt',
 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent.',
 'Open World RPG', 39.99, 'PC / PlayStation / Xbox / Switch', '2015-05-18',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg', 1),

('Forza Horizon 5',
 'Your Ultimate Horizon Adventure awaits! Explore the vibrant and ever-evolving open world landscapes of Mexico.',
 'Racing / Sports', 59.99, 'PC / Xbox Series X', '2021-11-09',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg', 2),

('Hollow Knight: Silksong',
 'Play as Hornet, princess-protector of Hallownest, and adventure through a whole new kingdom ruled by silk and song.',
 'Metroidvania', 19.99, 'PC / Switch / Console', '2025-05-10',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg', 2),

('Baldurs Gate 3',
 'Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal, and the lure of absolute power.',
 'Turn-Based RPG', 59.99, 'PC / PS5 / Xbox Series X', '2023-08-03',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg', 1),

('Marvels Spider-Man Remastered',
 'In Marvels Spider-Man Remastered, the worlds of Peter Parker and Spider-Man collide in an original action-packed story.',
 'Action / Open World', 59.99, 'PC / PS5', '2022-08-12',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg', 2),

('Call of Duty: Black Ops 6',
 'Forced to go rogue. Hunted from within. This is Black Ops 6 featuring a mind-bending narrative campaign and best-in-class multiplayer.',
 'FPS / Action', 69.99, 'PC / PS5 / Xbox Series X', '2024-10-25',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/2933620/header.jpg', 1),

('EA SPORTS FC 25',
 'EA SPORTS FC 25 gives you more ways to win for the club. Team up with friends in your favorite modes with 5v5 Rush.',
 'Sports / Simulation', 69.99, 'PC / PS5 / Xbox Series X', '2024-09-27',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/header.jpg', 2),

('Ghost of Tsushima DIRECTORS CUT',
 'Forge a new path and wage an unconventional war for the freedom of Tsushima as Jin Sakai.',
 'Action RPG', 59.99, 'PC / PS5', '2024-05-16',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg', 1),

('Resident Evil 4 Remake',
 'Survival is only the beginning. Six years have passed since the biological disaster in Raccoon City.',
 'Survival Horror', 39.99, 'PC / PS5 / Xbox Series X', '2023-03-24',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg', 2),

('Counter-Strike 2',
 'For over two decades, Counter-Strike has offered an elite competitive experience. CS2 marks the largest technical leap forward.',
 'Tactical FPS', 0.00, 'PC', '2023-09-27',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 1),

('Apex Legends',
 NULL,
 'Battle Royale', 0.00, 'PC / Console', '2020-11-04',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg', 2),

('Palworld',
 'Fight, farm, build and work alongside mysterious creatures called Pals in a seamless multiplayer open-world game.',
 'Monster Survival', 29.99, 'PC / Xbox / PS5', '2024-01-19',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg', 1),

('Minecraft: Java and Bedrock Edition',
 NULL,
 'Sandbox / Survival', 29.99, 'PC / Console / Mobile', '2011-11-18',
 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025', 2);

-- ──────────────────────────────────────────────────────
-- 2.4  INSERT — Seed REVIEW (6 rows, one with NULL review_text)
-- ──────────────────────────────────────────────────────
INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date) VALUES
(1, 1, 5, 'Absolute masterpiece after all the updates! Phantom Liberty story is incredible.', '2025-02-10'),
(2, 2, 5, 'The hardest and most rewarding boss fights in gaming history. 10/10!',           '2025-02-15'),
(1, 3, 4, 'Graphically stunning and emotionally rich storyline. Combat feels punchy.',       '2025-03-01'),
(3, 4, 5, 'Classic game. Online mode still has endless replayability.',                      '2025-03-12'),
(2, 5, 4, NULL,                                                                              '2025-04-01'),
(3, 1, 3, 'Good game but a bit overhyped. Still worth trying.',                              '2025-04-05');

-- ──────────────────────────────────────────────────────
-- 2.5  INSERT — Seed PAYMENT (6 rows: 4 Completed, 1 Pending, 1 Failed)
-- ──────────────────────────────────────────────────────
INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date) VALUES
(1, 1, 59.99, 'Completed', 'Credit Card',  '2025-02-10'),
(2, 2, 39.99, 'Completed', 'UPI',          '2025-02-15'),
(1, 3, 49.99, 'Completed', 'Net Banking',  '2025-03-01'),
(3, 4, 29.99, 'Completed', 'Debit Card',   '2025-03-12'),
(2, 5, 59.99, 'Pending',   'Credit Card',  '2025-04-01'),
(3, 6, 59.99, 'Failed',    'UPI',          '2025-04-10');

-- ──────────────────────────────────────────────────────
-- 2.6  INSERT — Seed LIBRARY (4 rows)
-- ──────────────────────────────────────────────────────
INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status) VALUES
(1, 1, '2025-02-10', 'Owned'),
(2, 2, '2025-02-15', 'Owned'),
(1, 3, '2025-03-01', 'Owned'),
(3, 4, '2025-03-12', 'Owned');

-- ──────────────────────────────────────────────────────
-- 2.7  UPDATE — Game price change
-- ──────────────────────────────────────────────────────
-- Scenario: GTA V price drops during a sale
UPDATE GAME
SET    price = 19.99
WHERE  game_id = 4;

-- Verify the update
SELECT game_id, title, price FROM GAME WHERE game_id = 4;

-- ──────────────────────────────────────────────────────
-- 2.8  UPDATE — Payment status change (Pending → Completed)
-- ──────────────────────────────────────────────────────
UPDATE PAYMENT
SET    payment_status = 'Completed'
WHERE  payment_id = 5;

-- Verify
SELECT * FROM PAYMENT WHERE payment_id = 5;

-- ──────────────────────────────────────────────────────
-- 2.9  UPDATE — Library status change
-- ──────────────────────────────────────────────────────
UPDATE `LIBRARY`
SET    status = 'Refunded'
WHERE  library_id = 4;

-- Verify
SELECT * FROM `LIBRARY` WHERE library_id = 4;

-- Revert for remaining queries
UPDATE `LIBRARY` SET status = 'Owned' WHERE library_id = 4;

-- ──────────────────────────────────────────────────────
-- 2.10  DELETE — Safe delete (no FK violation)
-- ──────────────────────────────────────────────────────
-- Delete the review with review_id = 6 (no other table references REVIEW rows)
DELETE FROM REVIEW WHERE review_id = 6;

-- Verify
SELECT * FROM REVIEW;

-- Delete the failed payment (no other table references PAYMENT rows)
DELETE FROM PAYMENT WHERE payment_id = 6;

-- Verify
SELECT * FROM PAYMENT;


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 3 — DATA CLEANING & CONSTRAINT TESTING
-- ████████████████████████████████████████████████████████████████████████████

-- ──────────────────────────────────────────────────────
-- 3.1  Duplicate email prevention (UNIQUE constraint)
-- ──────────────────────────────────────────────────────
-- This INSERT will FAIL because 'john@gamerig.com' already exists:
-- INSERT INTO `USER` (name, email, password, phone, date_joined)
-- VALUES ('John Clone', 'john@gamerig.com', 'pass123', NULL, '2025-06-01');
-- ERROR: Duplicate entry 'john@gamerig.com' for key 'USER.email'

-- ──────────────────────────────────────────────────────
-- 3.2  NOT NULL constraint — required IDs will not be NULL
-- ──────────────────────────────────────────────────────
-- This INSERT will FAIL because user_id is NOT NULL:
-- INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
-- VALUES (NULL, 1, 5, 'Test', '2025-06-01');
-- ERROR: Column 'user_id' cannot be null

-- ──────────────────────────────────────────────────────
-- 3.3  CHECK constraint — rating restricted to 1-5
-- ──────────────────────────────────────────────────────
-- This INSERT will FAIL because rating = 6 violates CHECK:
-- INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
-- VALUES (1, 2, 6, 'Too high rating!', '2025-06-01');
-- ERROR: Check constraint 'review_chk_1' is violated

-- This INSERT will FAIL because rating = 0 violates CHECK:
-- INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
-- VALUES (1, 2, 0, 'Too low rating!', '2025-06-01');
-- ERROR: Check constraint 'review_chk_1' is violated

-- ──────────────────────────────────────────────────────
-- 3.4  CHECK constraint — negative price prevention
-- ──────────────────────────────────────────────────────
-- This INSERT will FAIL because price = -10.00 violates CHECK:
-- INSERT INTO GAME (title, description, genre, price, platform, release_date, admin_id)
-- VALUES ('Bad Game', 'Negative price test', 'Test', -10.00, 'PC', '2025-01-01', 1);
-- ERROR: Check constraint 'game_chk_1' is violated

-- ──────────────────────────────────────────────────────
-- 3.5  CHECK constraint — negative payment amount prevention
-- ──────────────────────────────────────────────────────
-- This INSERT will FAIL because amount = -5.00 violates CHECK:
-- INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date)
-- VALUES (1, 1, -5.00, 'Completed', 'Credit Card', '2025-06-01');
-- ERROR: Check constraint 'payment_chk_1' is violated


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 4 — NULL HANDLING: IS NULL / IS NOT NULL
-- ████████████████████████████████████████████████████████████████████████████

-- 4.1  Find games with NO description (NULL)
SELECT game_id, title, description
FROM   GAME
WHERE  description IS NULL;

-- 4.2  Find games WITH a description (NOT NULL)
SELECT game_id, title, LEFT(description, 60) AS description_preview
FROM   GAME
WHERE  description IS NOT NULL;

-- 4.3  Find users with NO phone number
SELECT user_id, name, phone
FROM   `USER`
WHERE  phone IS NULL;

-- 4.4  Find users WITH a phone number
SELECT user_id, name, phone
FROM   `USER`
WHERE  phone IS NOT NULL;

-- 4.5  Find reviews with NO review text (rating-only reviews)
SELECT review_id, user_id, game_id, rating, review_text
FROM   REVIEW
WHERE  review_text IS NULL;

-- 4.6  Find reviews WITH review text
SELECT review_id, user_id, game_id, rating, LEFT(review_text, 50) AS review_preview
FROM   REVIEW
WHERE  review_text IS NOT NULL;


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 5 — BASIC QUERIES: SELECT, WHERE, ORDER BY
-- ████████████████████████████████████████████████████████████████████████████

-- 5.1  Display games by genre (filter: Action RPG)
SELECT game_id, title, genre, price, platform
FROM   GAME
WHERE  genre = 'Action RPG'
ORDER BY title;

-- 5.2  Display all games ordered by price (cheapest first)
SELECT game_id, title, genre, price
FROM   GAME
ORDER BY price ASC;

-- 5.3  Display all games ordered by price (most expensive first)
SELECT game_id, title, genre, price
FROM   GAME
ORDER BY price DESC;

-- 5.4  Display free-to-play games
SELECT game_id, title, genre, price
FROM   GAME
WHERE  price = 0.00
ORDER BY title;

-- 5.5  Display games priced between 30 and 60
SELECT game_id, title, genre, price
FROM   GAME
WHERE  price BETWEEN 30.00 AND 60.00
ORDER BY price;

-- 5.6  Display all users ordered by date_joined
SELECT user_id, name, email, phone, date_joined
FROM   `USER`
ORDER BY date_joined;

-- 5.7  Display reviews ordered by rating (highest first)
SELECT r.review_id, u.name AS reviewer, g.title AS game, r.rating, r.review_date
FROM   REVIEW r
JOIN   `USER` u ON r.user_id = u.user_id
JOIN   GAME g   ON r.game_id = g.game_id
ORDER BY r.rating DESC;

-- 5.8  Display completed payments
SELECT p.payment_id, u.name AS user_name, g.title AS game,
       p.amount, p.payment_method, p.payment_date
FROM   PAYMENT p
JOIN   `USER` u ON p.user_id = u.user_id
JOIN   GAME g   ON p.game_id = g.game_id
WHERE  p.payment_status = 'Completed'
ORDER BY p.payment_date;

-- 5.9  Display all library records with game details
SELECT l.library_id, u.name AS owner, g.title AS game,
       l.purchase_date, l.status
FROM   `LIBRARY` l
JOIN   `USER` u ON l.user_id = u.user_id
JOIN   GAME g   ON l.game_id = g.game_id
ORDER BY l.purchase_date;

-- 5.10  Display games released in 2024
SELECT game_id, title, genre, release_date
FROM   GAME
WHERE  YEAR(release_date) = 2024
ORDER BY release_date;


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 6 — AGGREGATE FUNCTIONS: COUNT, AVG, SUM
-- ████████████████████████████████████████████████████████████████████████████

-- 6.1  COUNT — Total number of reviews per game
SELECT g.game_id, g.title, COUNT(r.review_id) AS total_reviews
FROM   GAME g
LEFT JOIN REVIEW r ON g.game_id = r.game_id
GROUP BY g.game_id, g.title
ORDER BY total_reviews DESC;

-- 6.2  COUNT — Total games owned per user (library)
SELECT u.user_id, u.name, COUNT(l.library_id) AS games_owned
FROM   `USER` u
LEFT JOIN `LIBRARY` l ON u.user_id = l.user_id
GROUP BY u.user_id, u.name
ORDER BY games_owned DESC;

-- 6.3  COUNT — Total number of users
SELECT COUNT(*) AS total_users FROM `USER`;

-- 6.4  COUNT — Total number of games
SELECT COUNT(*) AS total_games FROM GAME;

-- 6.5  AVG — Average rating per game
SELECT g.game_id, g.title,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.review_id)      AS review_count
FROM   GAME g
LEFT JOIN REVIEW r ON g.game_id = r.game_id
GROUP BY g.game_id, g.title
HAVING COUNT(r.review_id) > 0
ORDER BY avg_rating DESC;

-- 6.6  AVG — Overall average rating across all reviews
SELECT ROUND(AVG(rating), 2) AS overall_avg_rating
FROM   REVIEW;

-- 6.7  AVG — Average game price
SELECT ROUND(AVG(price), 2) AS avg_game_price FROM GAME;

-- 6.8  SUM — Total payment value (completed only)
SELECT SUM(amount) AS total_revenue
FROM   PAYMENT
WHERE  payment_status = 'Completed';

-- 6.9  SUM — Total spending per user
SELECT u.user_id, u.name,
       SUM(p.amount) AS total_spent,
       COUNT(p.payment_id) AS total_purchases
FROM   `USER` u
JOIN   PAYMENT p ON u.user_id = p.user_id
WHERE  p.payment_status = 'Completed'
GROUP BY u.user_id, u.name
ORDER BY total_spent DESC;

-- 6.10  SUM — Revenue per payment method
SELECT payment_method,
       COUNT(*)    AS transaction_count,
       SUM(amount) AS total_amount
FROM   PAYMENT
WHERE  payment_status = 'Completed'
GROUP BY payment_method
ORDER BY total_amount DESC;


-- ████████████████████████████████████████████████████████████████████████████
-- SECTION 7 — BONUS: COMBINED / USEFUL QUERIES
-- ████████████████████████████████████████████████████████████████████████████

-- 7.1  Dashboard summary (all stats in one query)
SELECT
    (SELECT COUNT(*) FROM `USER`)                                          AS total_users,
    (SELECT COUNT(*) FROM GAME)                                            AS total_games,
    (SELECT COUNT(*) FROM REVIEW)                                          AS total_reviews,
    (SELECT COUNT(*) FROM PAYMENT WHERE payment_status = 'Completed')      AS total_payments,
    (SELECT ROUND(SUM(amount), 2) FROM PAYMENT WHERE payment_status = 'Completed') AS total_revenue;

-- 7.2  Top-rated games (with at least 1 review)
SELECT g.title, ROUND(AVG(r.rating), 1) AS avg_rating, COUNT(r.review_id) AS reviews
FROM   GAME g
JOIN   REVIEW r ON g.game_id = r.game_id
GROUP BY g.game_id, g.title
HAVING COUNT(r.review_id) >= 1
ORDER BY avg_rating DESC, reviews DESC
LIMIT 5;

-- 7.3  Games not yet reviewed
SELECT g.game_id, g.title
FROM   GAME g
LEFT JOIN REVIEW r ON g.game_id = r.game_id
WHERE  r.review_id IS NULL
ORDER BY g.title;

-- 7.4  Users who have not made any purchase
SELECT u.user_id, u.name, u.email
FROM   `USER` u
LEFT JOIN PAYMENT p ON u.user_id = p.user_id
WHERE  p.payment_id IS NULL;


-- ============================================================================
-- END OF PHASE 2 SCRIPT
-- ============================================================================
-- To run the full script in MySQL CLI:
--   mysql -u root -p < GameRig_Phase2_Complete.sql
--
-- To run section by section in MySQL Workbench:
--   Highlight each section and press Ctrl+Shift+Enter
-- ============================================================================
