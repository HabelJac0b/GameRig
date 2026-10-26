-- GameRig Database Schema
-- ADBMS Project

CREATE DATABASE IF NOT EXISTS GameRig;
USE GameRig;

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS `LIBRARY`;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS REVIEW;
DROP TABLE IF EXISTS GAME;
DROP TABLE IF EXISTS `USER`;
DROP TABLE IF EXISTS ADMIN;

-- 1. ADMIN TABLE
CREATE TABLE ADMIN (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Admin'
);

-- 2. USER TABLE (`USER` is a MySQL reserved word, so backticks are used)
CREATE TABLE `USER` (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    date_joined DATE NOT NULL
);

-- 3. GAME TABLE
CREATE TABLE GAME (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    platform VARCHAR(50) NOT NULL,
    release_date DATE,
    image VARCHAR(500),
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES ADMIN(admin_id) ON DELETE SET NULL
);

-- 4. REVIEW TABLE
CREATE TABLE REVIEW (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE
);

-- 5. PAYMENT TABLE
CREATE TABLE PAYMENT (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Completed',
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE
);

-- 6. LIBRARY TABLE (`LIBRARY` is a MySQL keyword in some contexts, backticks used)
CREATE TABLE `LIBRARY` (
    library_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Owned',
    FOREIGN KEY (user_id) REFERENCES `USER`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES GAME(game_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_id)
);
