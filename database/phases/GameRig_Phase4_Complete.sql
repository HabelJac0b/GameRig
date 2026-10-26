-- ============================================================================
-- GAMERIG DATABASE — PHASE 4: DATA INTEGRITY & TRANSACTION HANDLING
-- ADBMS Project — Complete MySQL Script
-- ============================================================================
USE GameRig_DB;

-- ============================================================================
-- REQUIREMENT 1 & 2: TRANSACTION HANDLING & ATOMICITY
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 SUCCESSFUL PURCHASE TRANSACTION (Manual Step-by-Step Demonstration)
-- ----------------------------------------------------------------------------
-- Scenario: User 2 (Sarah Connor) buys Game 3 (God of War Ragnarok)
START TRANSACTION;

-- Step 1: Concurrency check & row-level locking
SELECT user_id, name FROM `USER` WHERE user_id = 2 FOR UPDATE;
SELECT game_id, title, price FROM GAME WHERE game_id = 3 FOR UPDATE;

-- Step 2: Insert the PAYMENT record
INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date)
VALUES (2, 3, 49.99, 'Completed', 'UPI', CURDATE());

-- Step 3: Establish SAVEPOINT before the library insertion
SAVEPOINT BeforeLibraryUpdate;

-- Step 4: Add the purchased game to LIBRARY
INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status)
VALUES (2, 3, CURDATE(), 'Owned');

-- Step 5: Both succeeded -> COMMIT the entire transaction
COMMIT;

-- Verify both records exist
SELECT * FROM PAYMENT WHERE user_id = 2 AND game_id = 3;
SELECT * FROM `LIBRARY` WHERE user_id = 2 AND game_id = 3;


-- ----------------------------------------------------------------------------
-- 1.2 FAILED TRANSACTION WITH ATOMIC ROLLBACK (Demonstrating All-or-Nothing)
-- ----------------------------------------------------------------------------
-- Scenario: User 1 tries to buy Game 1 which they ALREADY own.
-- The UNIQUE constraint on LIBRARY(user_id, game_id) will trigger an error.
START TRANSACTION;

-- Step 1: Insert payment
INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date)
VALUES (1, 1, 59.99, 'Completed', 'Credit Card', CURDATE());

-- Step 2: Savepoint before library update
SAVEPOINT BeforeLibraryUpdate;

-- Step 3: Attempt to insert duplicate into LIBRARY (WILL FAIL due to unique_user_game)
-- INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status) VALUES (1, 1, CURDATE(), 'Owned');

-- Step 4: Because an error occurred, ROLLBACK to restore state prior to transaction
ROLLBACK;

-- Verify: Ensure no orphaned payment was created for this failed attempt
SELECT * FROM PAYMENT WHERE user_id = 1 AND game_id = 1 AND payment_date = CURDATE();


-- ============================================================================
-- REQUIREMENT 3: CONCURRENCY-SAFE TRANSACTION PROCEDURE (Production Workflow)
-- ============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS ProcessGamePurchase$$

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

    -- Exit handler: automatically ROLLBACK if any SQL exception occurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Transaction Failed: Rolled back completely to maintain Atomicity.' AS status_message;
    END;

    START TRANSACTION;

    -- Concurrency Check 1: Verify and lock User row
    SELECT COUNT(*) INTO v_user_count 
    FROM `USER` 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    -- Concurrency Check 2: Verify and lock Game row
    SELECT COUNT(*) INTO v_game_count 
    FROM GAME 
    WHERE game_id = p_game_id 
    FOR UPDATE;

    -- Concurrency Check 3: Check if already owned in library
    SELECT COUNT(*) INTO v_already_owned 
    FROM `LIBRARY` 
    WHERE user_id = p_user_id AND game_id = p_game_id 
    FOR UPDATE;

    -- Validation assertions
    IF v_user_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase Aborted: User not found.';
    END IF;

    IF v_game_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase Aborted: Game not found.';
    END IF;

    IF v_already_owned > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase Aborted: Game already owned in Library.';
    END IF;

    -- 1. Insert Payment
    INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date)
    VALUES (p_user_id, p_game_id, p_amount, 'Completed', p_payment_method, CURDATE());

    -- 2. Savepoint before library update
    SAVEPOINT BeforeLibraryUpdate;

    -- 3. Insert into Library
    INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status)
    VALUES (p_user_id, p_game_id, CURDATE(), 'Owned');

    -- If all operations succeeded:
    COMMIT;

    SELECT 'Purchase completed successfully!' AS status_message,
           p_user_id AS user_id,
           p_game_id AS game_id,
           p_amount AS amount_paid;
END$$

DELIMITER ;

-- Test Procedure (Valid Purchase): User 3 buys Game 5
CALL ProcessGamePurchase(3, 5, 59.99, 'UPI');

-- Test Procedure (Duplicate Purchase Prevention): User 3 tries to buy Game 5 again
-- (Will rollback and return failure message)
CALL ProcessGamePurchase(3, 5, 59.99, 'UPI');


-- ============================================================================
-- REQUIREMENT 4: FOREIGN KEY INTEGRITY CONSTRAINT TESTS
-- ============================================================================
-- These queries verify that MySQL rejects invalid foreign-key references.
-- Uncomment each query one at a time to observe constraint rejection.

-- 4.1 Test REVIEW Foreign Key on non-existent user_id (9999)
-- Expected Result: Error 1452: Cannot add or update a child row: a foreign key constraint fails
-- INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
-- VALUES (9999, 1, 5, 'Invalid user test', CURDATE());

-- 4.2 Test REVIEW Foreign Key on non-existent game_id (9999)
-- Expected Result: Error 1452: Cannot add or update a child row: a foreign key constraint fails
-- INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date)
-- VALUES (1, 9999, 5, 'Invalid game test', CURDATE());

-- 4.3 Test PAYMENT Foreign Key on non-existent user_id (9999)
-- Expected Result: Error 1452: Cannot add or update a child row: a foreign key constraint fails
-- INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date)
-- VALUES (9999, 1, 59.99, 'Completed', 'UPI', CURDATE());

-- 4.4 Test LIBRARY Foreign Key on non-existent game_id (9999)
-- Expected Result: Error 1452: Cannot add or update a child row: a foreign key constraint fails
-- INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status)
-- VALUES (1, 9999, CURDATE(), 'Owned');

-- 4.5 Test GAME Foreign Key on non-existent admin_id (9999)
-- Expected Result: Error 1452: Cannot add or update a child row: a foreign key constraint fails
-- INSERT INTO GAME (title, description, genre, price, platform, release_date, admin_id)
-- VALUES ('Orphan Game', 'Testing FK', 'Action', 29.99, 'PC', CURDATE(), 9999);


-- ============================================================================
-- REQUIREMENT 5: FINAL VALIDATION & RECONCILIATION SUITE
-- ============================================================================

-- 5.1 Reconciliation: Verify that every Completed payment has a corresponding Library record
SELECT 
    p.payment_id,
    p.user_id,
    u.name AS user_name,
    p.game_id,
    g.title AS game_title,
    p.amount,
    p.payment_status,
    l.library_id,
    l.status AS library_status,
    CASE 
        WHEN l.library_id IS NOT NULL THEN 'MATCHED (Consistent)'
        ELSE 'MISMATCH (Missing Library Record)'
    END AS audit_status
FROM PAYMENT p
JOIN `USER` u ON p.user_id = u.user_id
JOIN GAME g   ON p.game_id = g.game_id
LEFT JOIN `LIBRARY` l ON p.user_id = l.user_id AND p.game_id = l.game_id
WHERE p.payment_status = 'Completed';

-- 5.2 Check for Orphaned Records in REVIEW
SELECT r.review_id, r.user_id, r.game_id
FROM REVIEW r
LEFT JOIN `USER` u ON r.user_id = u.user_id
LEFT JOIN GAME g   ON r.game_id = g.game_id
WHERE u.user_id IS NULL OR g.game_id IS NULL;

-- 5.3 Check for Orphaned Records in PAYMENT
SELECT p.payment_id, p.user_id, p.game_id
FROM PAYMENT p
LEFT JOIN `USER` u ON p.user_id = u.user_id
LEFT JOIN GAME g   ON p.game_id = g.game_id
WHERE u.user_id IS NULL OR g.game_id IS NULL;

-- 5.4 Check for Orphaned Records in LIBRARY
SELECT l.library_id, l.user_id, l.game_id
FROM `LIBRARY` l
LEFT JOIN `USER` u ON l.user_id = u.user_id
LEFT JOIN GAME g   ON l.game_id = g.game_id
WHERE u.user_id IS NULL OR g.game_id IS NULL;

-- 5.5 Validate View (Game_Library_Summary)
SELECT * FROM Game_Library_Summary;

-- 5.6 Validate Function (GetUserGameCount)
SELECT user_id, name, GetUserGameCount(user_id) AS total_games_owned
FROM `USER`;

-- 5.7 Final Database Summary Metrics
SELECT 
    (SELECT COUNT(*) FROM `USER`) AS total_users,
    (SELECT COUNT(*) FROM GAME) AS total_games,
    (SELECT COUNT(*) FROM REVIEW) AS total_reviews,
    (SELECT COUNT(*) FROM `LIBRARY`) AS total_library_records,
    (SELECT COUNT(*) FROM PAYMENT WHERE payment_status = 'Completed') AS total_completed_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM PAYMENT WHERE payment_status = 'Completed') AS total_revenue;
