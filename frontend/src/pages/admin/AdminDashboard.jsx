import React, { useState, useEffect } from 'react';
import { Users, Gamepad2, MessageSquare, CreditCard, DollarSign, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <p style={{ color: '#00ff88', fontSize: '1.1rem' }}>Calculating database metrics...</p>
      </div>
    );
  }

  const cards = [
    { title: 'TOTAL USERS', value: stats?.total_users || 0, icon: Users, color: '#3b82f6', link: 'admin-users' },
    { title: 'TOTAL GAMES', value: stats?.total_games || 0, icon: Gamepad2, color: '#00ff88', link: 'admin-games' },
    { title: 'TOTAL REVIEWS', value: stats?.total_reviews || 0, icon: MessageSquare, color: '#f59e0b', link: 'admin-reviews' },
    { title: 'TOTAL PAYMENTS', value: stats?.total_payments || 0, icon: CreditCard, color: '#8b5cf6', link: 'admin-payments' },
    { title: 'TOTAL REVENUE', value: `$${Number(stats?.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: '#10b981', link: 'admin-payments' }
  ];

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>
          ADMIN <span className="gradient-text">SYSTEM DASHBOARD</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Real-time analytics and management control center for GameRig MySQL database.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel"
              onClick={() => onNavigate(card.link)}
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.25 ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}40`
                }}>
                  <Icon size={24} color={card.color} />
                </div>
                <ArrowUpRight size={18} color="#64748b" />
              </div>

              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif', marginBottom: '0.2rem' }}>
                {card.value}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px' }}>
                {card.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Admin Links */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>DATABASE MANAGEMENT MODULES</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {[
            { label: 'Manage Games Catalog', desc: 'Add, Edit, and Delete Game entries', target: 'admin-games' },
            { label: 'User Account Roster', desc: 'Inspect and manage registered users', target: 'admin-users' },
            { label: 'Review Moderation', desc: 'Review and remove user comments', target: 'admin-reviews' },
            { label: 'Financial Records', desc: 'Track payment transactions and revenue', target: 'admin-payments' },
            { label: 'Library Ownership Logs', desc: 'View user game ownership records', target: 'admin-library' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(item.target)}
              className="btn btn-secondary"
              style={{
                padding: '1.25rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                borderRadius: '14px',
                borderColor: 'var(--border-color)'
              }}
            >
              <span style={{ color: '#00ff88', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                {item.label}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 400 }}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
