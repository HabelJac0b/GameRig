import React, { useState } from 'react';
import { Gamepad2, Search, User, LogOut, Menu, X, Library, LayoutDashboard, Shield, Star, Sun, Moon } from 'lucide-react';

export default function Navbar({ user, activePage, setActivePage, onLogout, globalSearch, setGlobalSearch, theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user && user.role === 'admin';

  const userNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'games', label: 'Games' },
    { id: 'library', label: 'My Library' },
    { id: 'reviews', label: 'Community Reviews' },
    { id: 'payments', label: 'My Payments' },
    { id: 'profile', label: 'Profile' }
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-games', label: 'Manage Games' },
    { id: 'admin-users', label: 'Manage Users' },
    { id: 'admin-reviews', label: 'Manage Reviews' },
    { id: 'admin-payments', label: 'Payments' },
    { id: 'admin-library', label: 'Library Records' }
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        {/* Logo */}
        <div 
          onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            padding: '0.5rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(16,185,129,0.1) 100%)',
            border: '1px solid rgba(0,255,136,0.3)'
          }}>
            <Gamepad2 size={24} color="#00ff88" />
          </div>
          <span style={{
            fontSize: '1.75rem',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 800,
            letterSpacing: '1px',
            color: '#fff'
          }}>
            GAME<span style={{ color: '#00ff88' }}>RIG</span>
          </span>
          {isAdmin && (
            <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>
              <Shield size={12} style={{ marginRight: '4px' }} /> ADMIN
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-only" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: activePage === item.id ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                color: activePage === item.id ? '#00ff88' : '#cbd5e1',
                border: activePage === item.id ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.92rem'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Global Search & Profile Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isAdmin && (
            <div style={{
              position: 'relative',
              width: '220px'
            }} className="desktop-only">
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search games..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activePage !== 'games' && e.target.value) {
                    setActivePage('games');
                  }
                }}
                className="input-control"
                style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.75rem 0.45rem 2.2rem', fontSize: '0.88rem' }}
              />
            </div>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="desktop-only" style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e2e8f0' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* Modern Theme Toggle Switch */}
              <div
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  width: '54px',
                  height: '28px',
                  borderRadius: '14px',
                  background: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : '#94a3b8'}`,
                  padding: '2px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  userSelect: 'none'
                }}
              >
                <span style={{ position: 'absolute', left: '5px', fontSize: '11px', lineHeight: 1 }}>☀️</span>
                <span style={{ position: 'absolute', right: '5px', fontSize: '11px', lineHeight: 1 }}>🌙</span>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: theme === 'dark' ? '#00ff88' : '#059669',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    transform: theme === 'dark' ? 'translateX(26px)' : 'translateX(0px)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
                    zIndex: 2
                  }}
                />
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Hamburger Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'none'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1rem 1.5rem 1.5rem 1.5rem',
          background: '#0d111a',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {!isAdmin && (
            <input
              type="text"
              placeholder="Search games..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activePage !== 'games') setActivePage('games');
              }}
              className="input-control"
            />
          )}

          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: activePage === item.id ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                color: activePage === item.id ? '#00ff88' : '#cbd5e1',
                border: 'none',
                fontWeight: 600
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-only { display: none !important; }
          .mobile-only-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
