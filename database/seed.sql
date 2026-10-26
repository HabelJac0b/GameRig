-- GameRig Seed Data
USE GameRig;

-- Default password for all seed accounts is: password123
-- Bcrypt hash for 'password123': $2b$10$e.Y3QjT.Y7x9jQJg6Zq57.rK.Gq/O8p4hE/U2m4Z.4QZ.1qZ.1qZ.

-- Seed ADMIN
INSERT INTO ADMIN (name, email, password, role) VALUES
('System Admin', 'admin@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', 'Super Admin'),
('Alex Mercer', 'alex.admin@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', 'Game Moderator');

-- Seed USER
INSERT INTO `USER` (name, email, password, phone, date_joined) VALUES
('John Doe', 'john@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543210', '2025-01-15'),
('Sarah Connor', 'sarah@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543211', '2025-02-01'),
('Gamer Pro', 'gamer@gamerig.com', '$2b$10$89F7SgG7kK7mQWfX7uY0ueJ.k9yK5R8h5H.N1m4Z.4QZ.1qZ.1qZ.', '+19876543212', '2025-03-10');

-- Seed GAME
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

-- Seed REVIEW
INSERT INTO REVIEW (user_id, game_id, rating, review_text, review_date) VALUES
(1, 1, 5, 'Absolute masterpiece after all the updates! Phantom Liberty story is incredible.', '2025-02-10'),
(2, 2, 5, 'The hardest and most rewarding boss fights in gaming history. 10/10!', '2025-02-15'),
(1, 3, 4, 'Graphically stunning and emotionally rich storyline. Combat feels punchy.', '2025-03-01'),
(3, 4, 5, 'Classic game. Online mode still has endless replayability.', '2025-03-12');

-- Seed PAYMENT
INSERT INTO PAYMENT (user_id, game_id, amount, payment_status, payment_method, payment_date) VALUES
(1, 1, 59.99, 'Completed', 'Credit Card', '2025-02-10'),
(2, 2, 39.99, 'Completed', 'UPI', '2025-02-15'),
(1, 3, 49.99, 'Completed', 'Net Banking', '2025-03-01'),
(3, 4, 29.99, 'Completed', 'Debit Card', '2025-03-12');

-- Seed LIBRARY
INSERT INTO `LIBRARY` (user_id, game_id, purchase_date, status) VALUES
(1, 1, '2025-02-10', 'Owned'),
(2, 2, '2025-02-15', 'Owned'),
(1, 3, '2025-03-01', 'Owned'),
(3, 4, '2025-03-12', 'Owned');
