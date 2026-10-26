-- ============================================================================
-- GAMERIG: COMPLETE MASTER RELATIONAL DATABASE
-- Digital Game Library Management System (ADBMS Project)
-- ============================================================================
-- Single import command:
--   mysql -u root -p < database/GameRig.sql
-- Or in MySQL shell / Workbench:
--   SOURCE database/GameRig.sql;
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DATABASE CREATION
-- ----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS GameRig;
USE GameRig;

-- ----------------------------------------------------------------------------
-- 2. DROP EXISTING OBJECTS (Reverse FK Dependency Order)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS Game_Library_Summary;
DROP PROCEDURE IF EXISTS ProcessGamePurchase;
DROP PROCEDURE IF EXISTS AddGameReview;
DROP FUNCTION IF EXISTS GetUserGameCount;

DROP TABLE IF EXISTS `LIBRARY`;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS REVIEW;
DROP TABLE IF EXISTS GAME;
DROP TABLE IF EXISTS `USER`;
DROP TABLE IF EXISTS ADMIN;

-- ----------------------------------------------------------------------------
-- 3. DDL: TABLE DEFINITIONS & CONSTRAINTS
-- ----------------------------------------------------------------------------

-- 3.1 ADMIN TABLE
CREATE TABLE ADMIN (
    admin_id    INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(50)     DEFAULT 'Admin'
);

-- 3.2 USER TABLE (`USER` is a MySQL keyword -> enclosed in backticks)
CREATE TABLE `USER` (
    user_id     INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    phone       VARCHAR(15),
    date_joined DATE            NOT NULL
);

-- 3.3 GAME TABLE
CREATE TABLE GAME (
    game_id      INT             PRIMARY KEY AUTO_INCREMENT,
    title        VARCHAR(150)    NOT NULL,
    description  TEXT,
    genre        VARCHAR(50)     NOT NULL,
    price        DECIMAL(10,2)   NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    platform     VARCHAR(50)     NOT NULL,
    release_date DATE,
    image        VARCHAR(500),
    admin_id     INT,
    FOREIGN KEY (admin_id) REFERENCES ADMIN(admin_id) ON DELETE SET NULL
);

-- 3.4 REVIEW TABLE
CREATE TABLE REVIEW (
    review_id    INT             PRIMARY KEY AUTO_INCREMENT,
    user_id      INT             NOT NULL,
    game_id      INT             NOT NULL,
    rating       INT             NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text  TEXT,
    review_date  DATE            NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)   ON DELETE CASCADE
);

-- 3.5 PAYMENT TABLE
CREATE TABLE PAYMENT (
    payment_id      INT             PRIMARY KEY AUTO_INCREMENT,
    user_id         INT             NOT NULL,
    game_id         INT             NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL CHECK (amount >= 0),
    payment_status  VARCHAR(30)     NOT NULL DEFAULT 'Completed',
    payment_method  VARCHAR(50)     NOT NULL,
    payment_date    DATE            NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)   ON DELETE CASCADE
);

-- 3.6 LIBRARY TABLE (`LIBRARY` keyword -> enclosed in backticks)
CREATE TABLE `LIBRARY` (
    library_id     INT          PRIMARY KEY AUTO_INCREMENT,
    user_id        INT          NOT NULL,
    game_id        INT          NOT NULL,
    purchase_date  DATE         NOT NULL,
    status         VARCHAR(30)  DEFAULT 'Owned',
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id)   ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_id)
);

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE & FOREIGN KEY INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_game_admin_id   ON GAME(admin_id);
CREATE INDEX idx_review_game_id  ON REVIEW(game_id);
CREATE INDEX idx_payment_user_id ON PAYMENT(user_id);
CREATE INDEX idx_payment_game_id ON PAYMENT(game_id);
CREATE INDEX idx_library_user_id ON `LIBRARY`(user_id);
CREATE INDEX idx_library_game_id ON `LIBRARY`(game_id);

-- ----------------------------------------------------------------------------
-- 5. DML: SEED DATA
-- Default password for all seed accounts is: password123
-- ----------------------------------------------------------------------------

-- 5.1 SEED ADMINS
INSERT INTO ADMIN (name, email, password, role) VALUES
('System Admin',  'admin@gamerig.com',      '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', 'Super Admin'),
('Alex Mercer',   'alex.admin@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', 'Game Moderator');

-- 5.2 SEED USERS
INSERT INTO `USER` (name, email, password, phone, date_joined) VALUES
('John Doe',     'john@gamerig.com',  '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543210', '2025-01-15'),
('Sarah Connor', 'sarah@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543211', '2025-02-01'),
('Gamer Pro',    'gamer@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', NULL,           '2025-03-10');

-- 5.3 SEED GAMES
INSERT INTO GAME (title, description, genre, price, platform, release_date, image, admin_id) VALUES
('Cyberpunk 2077: Phantom Liberty', 'An open-world action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.', 'RPG', 59.99, 'PC / PS5 / Xbox Series X', '2023-09-26', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', 1),
('Elden Ring: Shadow of the Erdtree', 'The Lands Between are waiting for a new Lord. Discover hidden secrets in a dark fantasy action-RPG from Hidetaka Miyazaki.', 'Action RPG', 39.99, 'PC / PlayStation / Xbox', '2024-06-21', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', 1),
('God of War Ragnarök', 'Join Kratos and Atreus on a mythic journey for answers before Ragnarök arrives.', 'Action / Adventure', 49.99, 'PC / PS5', '2024-09-19', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/header.jpg', 2),
('Grand Theft Auto V', 'Explore the world of Los Santos and Blaine County in the ultimate open-world experience.', 'Action', 29.99, 'PC / Console', '2015-04-14', 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg', 1),
('Red Dead Redemption 2', 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run in an epic tale of honor and loyalty.', 'Open World Action', 59.99, 'PC / PS4 / Xbox One', '2019-12-05', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg', 1),
('Black Myth: Wukong', 'An action RPG rooted in Chinese mythology. Set out as the Destined One to venture into the challenges and marvels ahead.', 'Action RPG', 59.99, 'PC / PS5', '2024-08-20', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg', 2),
('Starfield', 'In this next-generation role-playing game set amongst the stars, create any character you want and explore with unparalleled freedom.', 'Sci-Fi RPG', 69.99, 'PC / Xbox Series X', '2023-09-06', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg', 2),
('The Witcher 3: Wild Hunt', 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent.', 'Open World RPG', 39.99, 'PC / PlayStation / Xbox / Switch', '2015-05-18', 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg', 1),
('Forza Horizon 5', 'Your Ultimate Horizon Adventure awaits! Explore the vibrant and ever-evolving open world landscapes of Mexico.', 'Racing / Sports', 59.99, 'PC / Xbox Series X', '2021-11-09', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg', 2),
('Hollow Knight: Silksong', 'Play as Hornet, princess-protector of Hallownest, and adventure through a whole new kingdom ruled by silk and song.', 'Metroidvania', 19.99, 'PC / Switch / Console', '2025-05-10', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg', 2),
('Baldur\'s Gate 3', 'Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal, and the lure of absolute power.', 'Turn-Based RPG', 59.99, 'PC / PS5 / Xbox Series X', '2023-08-03', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg', 1),
('Marvel\'s Spider-Man Remastered', 'In Marvel\'s Spider-Man Remastered, the worlds of Peter Parker and Spider-Man collide in an original action-packed story.', 'Action / Open World', 59.99, 'PC / PS5', '2022-08-12', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg', 2),
('Call of Duty: Black Ops 6', 'Forced to go rogue. Hunted from within. This is Black Ops 6 featuring a mind-bending narrative campaign and best-in-class multiplayer.', 'FPS / Action', 69.99, 'PC / PS5 / Xbox Series X', '2024-10-25', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2933620/header.jpg', 1),
('EA SPORTS FC 25', 'EA SPORTS FC 25 gives you more ways to win for the club. Team up with friends in your favorite modes with 5v5 Rush.', 'Sports / Simulation', 69.99, 'PC / PS5 / Xbox Series X', '2024-09-27', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2669320/header.jpg', 2),
('Ghost of Tsushima DIRECTOR\'S CUT', 'Forge a new path and wage an unconventional war for the freedom of Tsushima as Jin Sakai.', 'Action RPG', 59.99, 'PC / PS5', '2024-05-16', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg', 1),
('Resident Evil 4 Remake', 'Survival is only the beginning. Six years have passed since the biological disaster in Raccoon City.', 'Survival Horror', 39.99, 'PC / PS5 / Xbox Series X', '2023-03-24', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg', 2),
('Counter-Strike 2', 'For over two decades, Counter-Strike has offered an elite competitive experience. CS2 marks the largest technical leap forward.', 'Tactical FPS', 0.00, 'PC', '2023-09-27', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 1),
('Apex Legends', 'Master an ever-growing roster of powerful Legends with tactical abilities in a strategic Battle Royale.', 'Battle Royale', 0.00, 'PC / Console', '2020-11-04', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg', 2),
('Palworld', 'Fight, farm, build and work alongside mysterious creatures called Pals in a seamless multiplayer open-world game.', 'Monster Survival', 29.99, 'PC / Xbox / PS5', '2024-01-19', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg', 1),
('Minecraft: Java & Bedrock Edition', 'Explore infinite worlds and build everything from the simplest of homes to the grandest of castles.', 'Sandbox / Survival', 29.99, 'PC / Console / Mobile', '2011-11-18', 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80', 2);

-- 5.4 SEED REVIEWS
INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date) VALUES
(1, 1, 5, 'Absolute masterpiece after all the updates! Phantom Liberty story is incredible.', '2025-02-10'),
(2, 2, 5, 'The hardest and most rewarding boss fights in gaming history. 10/10!', '2025-02-15'),
(1, 3, 4, 'Graphically stunning and emotionally rich storyline. Combat feels punchy.', '2025-03-01'),
(3, 4, 5, 'Classic game. Online mode still has endless replayability.', '2025-03-12'),
(2, 5, 4, 'One of the greatest narrative achievements in modern gaming.', '2025-04-01'),
(3, 1, 3, 'Good game but a bit overhyped. Still worth trying.', '2025-04-05');

-- 5.5 SEED PAYMENTS
INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date) VALUES
(1, 1, 59.99, 'Completed', 'Credit Card', '2025-02-10'),
(2, 2, 39.99, 'Completed', 'UPI',         '2025-02-15'),
(1, 3, 49.99, 'Completed', 'Net Banking', '2025-03-01'),
(3, 4, 29.99, 'Completed', 'Debit Card',  '2025-03-12'),
(2, 5, 59.99, 'Completed', 'Credit Card', '2025-04-01');

-- 5.6 SEED LIBRARY
INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status) VALUES
(1, 1, '2025-02-10', 'Owned'),
(2, 2, '2025-02-15', 'Owned'),
(1, 3, '2025-03-01', 'Owned'),
(3, 4, '2025-03-12', 'Owned'),
(2, 5, '2025-04-01', 'Owned');

-- ----------------------------------------------------------------------------
-- 6. VIEWS
-- ----------------------------------------------------------------------------
CREATE VIEW Game_Library_Summary AS
SELECT 
    u.name AS user_name,
    u.email AS user_email,
    g.title AS game_title,
    g.genre,
    l.purchase_date,
    COALESCE(p.payment_status, 'N/A') AS payment_status,
    l.status AS library_status
FROM `LIBRARY` l
JOIN `USER` u ON l.user_id = u.user_id
JOIN GAME g   ON l.game_id = g.game_id
LEFT JOIN PAYMENT p ON l.user_id = p.user_id AND l.game_id = p.game_id;

-- ----------------------------------------------------------------------------
-- 7. STORED FUNCTIONS
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE FUNCTION GetUserGameCount(p_user_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE game_count INT;
    SELECT COUNT(*) INTO game_count
    FROM `LIBRARY`
    WHERE user_id = p_user_id;
    RETURN game_count;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 8. STORED PROCEDURES
-- ----------------------------------------------------------------------------
DELIMITER $$

-- 8.1 Transaction-Safe Game Purchase Procedure (ACID atomicity with locks)
CREATE PROCEDURE ProcessGamePurchase(
    IN p_user_id INT,
    IN p_game_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50)
)
BEGIN
    DECLARE v_user_count INT DEFAULT 0;
    DECLARE v_game_count INT DEFAULT 0;
    DECLARE v_already_owned INT DEFAULT 0;

    -- Rollback automatically on any SQL error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Transaction Failed: Rolled back completely to maintain Atomicity.' AS status_message;
    END;

    START TRANSACTION;

    -- Concurrency Row Locks
    SELECT COUNT(*) INTO v_user_count FROM `USER` WHERE user_id = p_user_id FOR UPDATE;
    SELECT COUNT(*) INTO v_game_count FROM GAME WHERE game_id = p_game_id FOR UPDATE;
    SELECT COUNT(*) INTO v_already_owned FROM `LIBRARY` WHERE user_id = p_user_id AND game_id = p_game_id FOR UPDATE;

    IF v_user_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase Aborted: User not found.';
    END IF;

    IF v_game_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase Aborted: Game not found.';
    END IF;

    IF v_already_owned > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase Aborted: Game already owned in Library.';
    END IF;

    -- Step 1: Record payment
    INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date)
    VALUES (p_user_id, p_game_id, p_amount, 'Completed', p_payment_method, CURDATE());

    -- Step 2: Establish savepoint
    SAVEPOINT BeforeLibraryUpdate;

    -- Step 3: Insert library record
    INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status)
    VALUES (p_user_id, p_game_id, CURDATE(), 'Owned');

    COMMIT;

    SELECT 'Purchase completed successfully!' AS status_message,
           p_user_id AS user_id,
           p_game_id AS game_id,
           p_amount AS amount_paid;
END$$

-- 8.2 Add Game Review Procedure
CREATE PROCEDURE AddGameReview(
    IN p_user_id INT,
    IN p_game_id INT,
    IN p_rating INT,
    IN p_review_text TEXT
)
BEGIN
    INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
    VALUES (p_user_id, p_game_id, p_rating, p_review_text, CURDATE());

    SELECT 'Review submitted successfully!' AS status_message,
           LAST_INSERT_ID() AS new_review_id;
END$$

DELIMITER ;

-- ============================================================================
-- VERIFICATION METRICS
-- ============================================================================
SELECT 
    (SELECT COUNT(*) FROM `USER`) AS total_users,
    (SELECT COUNT(*) FROM GAME) AS total_games,
    (SELECT COUNT(*) FROM REVIEW) AS total_reviews,
    (SELECT COUNT(*) FROM `LIBRARY`) AS total_library_records,
    (SELECT COUNT(*) FROM PAYMENT WHERE payment_status = 'Completed') AS total_completed_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM PAYMENT WHERE payment_status = 'Completed') AS total_revenue;
