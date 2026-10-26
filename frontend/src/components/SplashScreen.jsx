import React, { useEffect, useState } from 'react';
import { Gamepad2, ShieldAlert, Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 600);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#07090e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease-in-out'
    }}>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        animation: 'pulse 2s infinite ease-in-out'
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        zIndex: 1
      }}>
        <div style={{
          padding: '1.25rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(16,185,129,0.1) 100%)',
          border: '1px solid rgba(0,255,136,0.4)',
          boxShadow: '0 0 30px rgba(0,255,136,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Gamepad2 size={56} color="#00ff88" style={{ filter: 'drop-shadow(0 0 10px #00ff88)' }} />
        </div>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          fontFamily: 'Rajdhani, sans-serif',
          background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px'
        }}>
          GAME<span style={{ color: '#00ff88' }}>RIG</span>
        </h1>
      </div>

      <p style={{
        fontSize: '1.2rem',
        color: '#94a3b8',
        fontFamily: 'Outfit, sans-serif',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '2rem',
        zIndex: 1
      }}>
        Your Games. Your Library.
      </p>

      {/* Loading Indicator */}
      <div style={{
        width: '180px',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #00ff88, #10b981)',
          animation: 'loadProgress 2s ease-in-out forwards'
        }} />
      </div>

      <style>{`
        @keyframes loadProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
