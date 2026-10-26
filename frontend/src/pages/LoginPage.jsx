import React, { useState } from 'react';
import { Gamepad2, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { api, setAuthToken, setSavedUser } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('john@gamerig.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await api.register({ name, email, password, phone });
      } else {
        response = await api.login({ email, password });
      }

      setAuthToken(response.token);
      setSavedUser(response.user);
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = async (demoEmail, demoPass) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      const response = await api.login({ email: demoEmail, password: demoPass });
      setAuthToken(response.token);
      setSavedUser(response.user);
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(0,255,136,0.3)'
          }}>
            <Gamepad2 size={32} color="#052e16" />
          </div>

          <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.25rem' }}>
            GAME<span className="gradient-text">RIG</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isRegister ? 'Create your new player account' : 'Sign in to access your digital game library'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* 1-Click Instant Demo Login Section */}
        <div style={{
          marginBottom: '1.5rem',
          background: 'rgba(0, 255, 136, 0.06)',
          border: '1px dashed rgba(0, 255, 136, 0.3)',
          borderRadius: '14px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.78rem', color: '#00ff88', fontWeight: 700, letterSpacing: '1px', marginBottom: '0.65rem' }}>
            ⚡ 1-CLICK INSTANT DEMO LOGIN
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleInstantDemo('john@gamerig.com', 'password123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
              disabled={loading}
            >
              ⚡ User Demo (John)
            </button>
            <button
              type="button"
              onClick={() => handleInstantDemo('admin@gamerig.com', 'password123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', borderColor: '#00ff88', color: '#00ff88' }}
              disabled={loading}
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{ background: 'none', border: 'none', color: '#00ff88', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
