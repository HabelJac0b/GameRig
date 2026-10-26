# GameRig — Digital Game Library Management System (ADBMS Project)

**GameRig** is a digital gaming platform and library management system developed for an Advanced Database Management System (ADBMS) college course. The application strictly follows a 6-table relational MySQL database model with dark gaming UI theme (green accent, glassmorphism, responsive cards) built with **React 18 + Vite** and a **Node.js Express REST API**.

---

## 🗄️ Database Architecture & Schema

The MySQL database is named **`GameRig`** and includes 6 core entities with strict foreign key constraints:

1. **`ADMIN`**: Admin management accounts (`admin_id`, `name`, `email`, `password`, `role`).
2. **`USER`**: Registered user player accounts (`user_id`, `name`, `email`, `password`, `phone`, `date_joined`).
3. **`GAME`**: Digital games catalog (`game_id`, `title`, `description`, `genre`, `price`, `platform`, `release_date`, `admin_id`).
4. **`REVIEW`**: Ratings & review logs (`review_id`, `user_id`, `game_id`, `rating`, `review_text`, `review_date`).
5. **`PAYMENT`**: Financial checkout records (`payment_id`, `user_id`, `game_id`, `amount`, `payment_status`, `payment_method`, `payment_date`).
6. **`LIBRARY`**: User game ownership mapping (`library_id`, `user_id`, `game_id`, `purchase_date`, `status`).

---

## 🚀 Quick Start Instructions

### 1. Database Setup (MySQL)
Run the all-in-one SQL script in your MySQL Workbench or terminal:
```sql
SOURCE database/GameRig.sql;
```
*(Alternatively, you can run `SOURCE database/schema.sql;` followed by `SOURCE database/seed.sql;`)*

### 2. Backend API Setup
```bash
cd backend
npm install
npm run dev
```
The Express REST API server will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React + Vite app will open at `http://localhost:3000`.

---

## 🔑 Default Accounts (For College Evaluation)

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **User** | `john@gamerig.com` | `password123` | Home, Catalog, Details, Buy Game, Library, Write Reviews, Profile |
| **Admin** | `admin@gamerig.com` | `password123` | Admin Dashboard, Manage Games, Manage Users, Moderate Reviews, Financial Records, Library Ownership Logs |

---

## ⚙️ Environment Variables (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=GameRig
DB_PORT=3306
JWT_SECRET=gamerig_super_secret_jwt_key_2025_adbms
```
