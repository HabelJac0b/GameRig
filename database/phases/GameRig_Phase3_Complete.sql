-- ============================================================================
-- GAMERIG DATABASE — PHASE 3: DATA QUERYING & ANALYTICAL OPERATIONS
-- ADBMS Project — Complete MySQL Script
-- ============================================================================
USE GameRig_DB;

-- ============================================================================
-- REQUIREMENT 1: COMPLEX JOINS
-- ============================================================================

-- 1.1 Review Details Report: USER + REVIEW + GAME
SELECT 
    r.review_id,
    u.name AS user_name,
    u.email AS user_email,
    g.title AS game_title,
    g.genre,
    r.rating,
    r.review_text,
    r.review_date
FROM REVIEW r
JOIN `USER` u ON r.user_id = u.user_id
JOIN GAME g   ON r.game_id = g.game_id
ORDER BY r.review_date DESC;

-- 1.2 Purchase Report: USER + PAYMENT + GAME
SELECT 
    p.payment_id,
    u.name AS customer_name,
    u.email AS customer_email,
    g.title AS purchased_game,
    p.amount,
    p.payment_status,
    p.payment_method,
    p.payment_date
FROM PAYMENT p
JOIN `USER` u ON p.user_id = u.user_id
JOIN GAME g   ON p.game_id = g.game_id
ORDER BY p.payment_date DESC;

-- 1.3 Personal Game Library Report: USER + LIBRARY + GAME
SELECT 
    l.library_id,
    u.user_id,
    u.name AS user_name,
    g.game_id,
    g.title AS game_title,
    g.genre,
    g.platform,
    l.purchase_date,
    l.status AS library_status
FROM `LIBRARY` l
JOIN `USER` u ON l.user_id = u.user_id
JOIN GAME g   ON l.game_id = g.game_id
ORDER BY u.name ASC, l.purchase_date DESC;


-- ============================================================================
-- REQUIREMENT 2: NESTED QUERIES AND SUBQUERIES
-- ============================================================================

-- 2.1 Games whose average rating is strictly above the overall average rating
SELECT 
    g.game_id,
    g.title,
    g.genre,
    ROUND(AVG(r.rating), 2) AS game_avg_rating,
    (SELECT ROUND(AVG(rating), 2) FROM REVIEW) AS overall_avg_rating
FROM GAME g
JOIN REVIEW r ON g.game_id = r.game_id
GROUP BY g.game_id, g.title, g.genre
HAVING AVG(r.rating) > (SELECT AVG(rating) FROM REVIEW)
ORDER BY game_avg_rating DESC;

-- 2.2 Users whose completed purchase count is above the average user purchase count
SELECT 
    u.user_id,
    u.name,
    u.email,
    COUNT(p.payment_id) AS user_purchase_count
FROM `USER` u
JOIN PAYMENT p ON u.user_id = p.user_id
WHERE p.payment_status = 'Completed'
GROUP BY u.user_id, u.name, u.email
HAVING COUNT(p.payment_id) > (
    SELECT AVG(user_purchases.total_orders)
    FROM (
        SELECT user_id, COUNT(payment_id) AS total_orders
        FROM PAYMENT
        WHERE payment_status = 'Completed'
        GROUP BY user_id
    ) AS user_purchases
)
ORDER BY user_purchase_count DESC;


-- ============================================================================
-- REQUIREMENT 3: VIEW CREATION (Game_Library_Summary)
-- ============================================================================

DROP VIEW IF EXISTS Game_Library_Summary;

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

-- Verify View execution:
SELECT * FROM Game_Library_Summary;


-- ============================================================================
-- REQUIREMENT 4: QUERY EXECUTION PLAN & INDEX OPTIMIZATION
-- ============================================================================

-- 4.1 Check query plan BEFORE adding explicit non-clustered indexes
EXPLAIN 
SELECT l.library_id, u.name, g.title, p.payment_status
FROM `LIBRARY` l
JOIN `USER` u ON l.user_id = u.user_id
JOIN GAME g ON l.game_id = g.game_id
LEFT JOIN PAYMENT p ON l.user_id = p.user_id AND l.game_id = p.game_id;

-- 4.2 Create indexes on foreign-key and search columns
CREATE INDEX idx_game_admin_id    ON GAME(admin_id);
CREATE INDEX idx_review_game_id   ON REVIEW(game_id);
CREATE INDEX idx_payment_user_id  ON PAYMENT(user_id);
CREATE INDEX idx_payment_game_id  ON PAYMENT(game_id);
CREATE INDEX idx_library_user_id  ON `LIBRARY`(user_id);
CREATE INDEX idx_library_game_id  ON `LIBRARY`(game_id);

-- 4.3 Check query plan AFTER index creation
EXPLAIN 
SELECT l.library_id, u.name, g.title, p.payment_status
FROM `LIBRARY` l
JOIN `USER` u ON l.user_id = u.user_id
JOIN GAME g ON l.game_id = g.game_id
LEFT JOIN PAYMENT p ON l.user_id = p.user_id AND l.game_id = p.game_id;


-- ============================================================================
-- REQUIREMENT 5: STORED FUNCTION (GetUserGameCount)
-- ============================================================================

DELIMITER $$

DROP FUNCTION IF EXISTS GetUserGameCount$$

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

-- Test the function for all registered users:
SELECT 
    user_id,
    name,
    email,
    GetUserGameCount(user_id) AS total_games_in_library
FROM `USER`;


-- ============================================================================
-- REQUIREMENT 6: STORED PROCEDURE (AddGameReview)
-- ============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS AddGameReview$$

CREATE PROCEDURE AddGameReview(
    IN p_user_id INT,
    IN p_game_id INT,
    IN p_rating INT,
    IN p_review_text TEXT
)
BEGIN
    -- Insert the new review record using current date
    INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
    VALUES (p_user_id, p_game_id, p_rating, p_review_text, CURDATE());
    
    -- Confirmation message
    SELECT 'Review submitted successfully!' AS status_message,
           LAST_INSERT_ID() AS new_review_id;
END$$

DELIMITER ;

-- Test the Stored Procedure:
CALL AddGameReview(1, 2, 5, 'Superb graphics, engaging storyline and smooth performance!');

-- Verify inserted review:
SELECT * FROM REVIEW WHERE user_id = 1 AND game_id = 2 ORDER BY review_id DESC LIMIT 1;
