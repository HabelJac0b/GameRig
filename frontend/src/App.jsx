import React, { useState, useEffect } from 'react';
import './styles/theme.css';
import { api, getSavedUser, setAuthToken, setSavedUser } from './services/api';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GameDetailsPage from './pages/GameDetailsPage';
import MyLibraryPage from './pages/MyLibraryPage';
import MyPaymentsPage from './pages/MyPaymentsPage';
import ReviewsPage from './pages/ReviewsPage';
import ProfilePage from './pages/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageGames from './pages/admin/ManageGames';
import ManageUsers from './pages/admin/ManageUsers';
import ManageReviews from './pages/admin/ManageReviews';
import ManagePayments from './pages/admin/ManagePayments';
import ManageLibrary from './pages/admin/ManageLibrary';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(() => getSavedUser());
  const [activePage, setActivePage] = useState('home');
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [games, setGames] = useState([]);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('gamerig_theme') || 'dark');

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('gamerig_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fetch games catalog on initial load
  const loadGames = async () => {
    try {
      const data = await api.getGames();
      setGames(data || []);
    } catch (err) {
      console.error('Error fetching games catalog:', err);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setActivePage('admin-dashboard');
    } else {
      setActivePage('home');
    }
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setSavedUser(null);
    setUser(null);
    setActivePage('home');
    showToast('Logged out successfully.', 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSelectGame = (game) => {
    setSelectedGameId(game.game_id);
    setActivePage('game-details');
  };

  // If splash screen is active, show animation
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // If user is not authenticated, render Login/Register Screen
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="app-container">
      <Navbar
        user={user}
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          if (page === 'games') loadGames();
        }}
        onLogout={handleLogout}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {/* Normal User Screens */}
        {!isAdmin && activePage === 'home' && (
          <HomePage
            user={user}
            games={games}
            onNavigate={(page) => setActivePage(page)}
            onSelectGame={handleSelectGame}
          />
        )}

        {!isAdmin && activePage === 'games' && (
          <GamesPage
            games={games}
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            onSelectGame={handleSelectGame}
          />
        )}

        {!isAdmin && activePage === 'game-details' && (
          <GameDetailsPage
            gameId={selectedGameId}
            user={user}
            onBack={() => setActivePage('games')}
            onNavigateToLibrary={() => setActivePage('library')}
          />
        )}

        {!isAdmin && activePage === 'library' && (
          <MyLibraryPage
            user={user}
            onNavigateToCatalog={() => setActivePage('games')}
            onSelectGame={handleSelectGame}
          />
        )}

        {!isAdmin && activePage === 'payments' && (
          <MyPaymentsPage
            user={user}
            onNavigateToCatalog={() => setActivePage('games')}
          />
        )}

        {!isAdmin && activePage === 'reviews' && (
          <ReviewsPage
            onSelectGame={handleSelectGame}
          />
        )}

        {!isAdmin && activePage === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            showToast={showToast}
          />
        )}

        {/* Admin Screens */}
        {isAdmin && activePage === 'admin-dashboard' && (
          <AdminDashboard onNavigate={(page) => setActivePage(page)} />
        )}

        {isAdmin && activePage === 'admin-games' && (
          <ManageGames showToast={showToast} />
        )}

        {isAdmin && activePage === 'admin-users' && (
          <ManageUsers showToast={showToast} />
        )}

        {isAdmin && activePage === 'admin-reviews' && (
          <ManageReviews showToast={showToast} />
        )}

        {isAdmin && activePage === 'admin-payments' && (
          <ManagePayments showToast={showToast} />
        )}

        {isAdmin && activePage === 'admin-library' && (
          <ManageLibrary showToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem',
        marginTop: 'auto'
      }}>
        GameRig — ADBMS College Project System © 2025. Built with React, Express REST API & MySQL Relational Engine.
      </footer>

      {/* Toast Overlay */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
