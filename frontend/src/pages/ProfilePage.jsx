import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Key, Save, Library, MessageSquare, CreditCard, Shield } from 'lucide-react';
import { api, setSavedUser } from '../services/api';

export default function ProfilePage({ user, onUpdateUser, showToast }) {
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUser(user.id);
      setProfileData(data);
      setName(data.name || '');
      setPhone(data.phone || '');
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateUser(user.id, { name, phone, password });
      const updatedUser = { ...user, name, phone };
      setSavedUser(updatedUser);
      onUpdateUser(updatedUser);
      setPassword('');
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <p style={{ color: '#00ff88' }}>Loading profile parameters...</p>
      </div>
    );
  }

  const stats = profileData?.stats || { games_owned: 0, total_reviews: 0, total_payments: 0, total_spent: 0 };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontSize: '2.8rem',
          fontWeight: 800,
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
        }}>
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>{profileData?.name}</h1>
            <span className="badge badge-green">
              <Shield size={12} style={{ marginRight: '4px' }} /> {profileData?.role || 'Verified Gamer'}
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{profileData?.email}</p>
          <span style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', display: 'inline-block' }}>
            Member since {profileData?.date_joined}
          </span>
        </div>
      </div>

      {/* User Activity Stats Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(0, 255, 136, 0.12)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
            <Library size={24} color="#00ff88" />
          </div>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>
              {stats.games_owned}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>GAMES OWNED</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <MessageSquare size={24} color="#3b82f6" />
          </div>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>
              {stats.total_reviews}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>REVIEWS WRITTEN</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <CreditCard size={24} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>
              {stats.total_payments}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>TRANSACTIONS</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>EDIT ACCOUNT SETTINGS</h2>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>FULL NAME</label>
            <input
              type="text"
              className="input-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>EMAIL ADDRESS (READ-ONLY)</label>
            <input
              type="email"
              className="input-control"
              value={profileData?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>PHONE NUMBER</label>
            <input
              type="text"
              className="input-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-group">
            <label>NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)</label>
            <input
              type="password"
              className="input-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ marginTop: '1rem', padding: '0.85rem 2rem' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
