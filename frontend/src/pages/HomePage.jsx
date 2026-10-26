import React from 'react';
import { Gamepad2, Library, Sparkles, Star, TrendingUp, ShieldCheck, ArrowRight, Compass } from 'lucide-react';

export default function HomePage({ user, games, onNavigate, onSelectGame }) {
  const featuredGames = games.slice(0, 4);
  const popularGames = [...games].sort((a, b) => (b.review_count || 0) - (a.review_count || 0)).slice(0, 4);
  const topRatedGames = [...games].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 4);

  return (
    <div>
      {/* HERO SECTION */}
      <div className="glass-panel" style={{
        padding: '4rem 3rem',
        borderRadius: '24px',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at top right, rgba(0, 255, 136, 0.15) 0%, rgba(13, 17, 26, 0.95) 70%)',
        border: '1px solid rgba(0, 255, 136, 0.2)'
      }}>
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
          <div className="badge badge-green" style={{ marginBottom: '1.25rem' }}>
            <Sparkles size={14} style={{ marginRight: '6px' }} /> NEXT-GEN GAMING PLATFORM
          </div>

          <h1 style={{
            fontSize: '3.8rem',
            lineHeight: 1.1,
            marginBottom: '1rem',
            letterSpacing: '1px',
            color: '#fff'
          }}>
            LEVEL UP YOUR <span className="gradient-text">LIBRARY</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#cbd5e1',
            marginBottom: '2.25rem',
            lineHeight: 1.6
          }}>
            Discover, explore and manage your favorite games. Build your ultimate digital gaming collection with instant payments and real-time community reviews.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('games')} className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              <Compass size={20} /> Explore Games
            </button>
            <button onClick={() => onNavigate('library')} className="btn btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              <Library size={20} /> My Library
            </button>
          </div>
        </div>

        {/* Hero Decorative Floating Game Controller */}
        <div className="desktop-only" style={{
          position: 'absolute',
          right: '4rem',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.15,
          pointerEvents: 'none'
        }}>
          <Gamepad2 size={320} color="#00ff88" />
        </div>
      </div>

      {/* PLATFORM STATS BAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3.5rem'
      }}>
        {[
          { label: 'CATALOG GAMES', value: games.length ? `${games.length}+` : '8+', color: '#00ff88' },
          { label: 'POPULAR GENRES', value: '12+', color: '#3b82f6' },
          { label: 'COMMUNITY REVIEWS', value: '150+', color: '#f59e0b' },
          { label: 'PLATFORM STATUS', value: 'ONLINE 99.9%', color: '#10b981' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, fontFamily: 'Rajdhani, sans-serif' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '1px', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* FEATURED GAMES SECTION */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: '#fff' }}>FEATURED TITLES</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Handpicked blockbuster AAA games and trending titles</p>
          </div>
          <button onClick={() => onNavigate('games')} className="btn btn-secondary btn-sm">
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="games-grid">
          {featuredGames.map(game => (
            <GameCard key={game.game_id} game={game} onSelectGame={onSelectGame} />
          ))}
        </div>
      </div>

      {/* TOP RATED GAMES SECTION */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={24} color="#f59e0b" fill="#f59e0b" /> TOP RATED BY PLAYERS
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Highest rated games based on user review scores</p>
          </div>
          <button onClick={() => onNavigate('games')} className="btn btn-secondary btn-sm">
            Explore Catalog <ArrowRight size={14} />
          </button>
        </div>

        <div className="games-grid">
          {topRatedGames.map(game => (
            <GameCard key={game.game_id} game={game} onSelectGame={onSelectGame} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, onSelectGame }) {
  return (
    <div className="game-card">
      <div
        className="card-img-container"
        onClick={() => onSelectGame(game)}
        style={{ cursor: 'pointer' }}
        title={`Click to view details for ${game.title}`}
      >
        <img
          src={game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'}
          alt={game.title}
          loading="lazy"
        />
        <span className="badge badge-green" style={{ position: 'absolute', top: '12px', right: '12px' }}>
          {game.genre}
        </span>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {game.title}
        </h3>

        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {game.description}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{game.avg_rating || '5.0'}</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({game.review_count || 0})</span>
            </div>

            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
              {game.price === 0 ? 'FREE' : `$${Number(game.price).toFixed(2)}`}
            </span>
          </div>

          <button
            onClick={() => onSelectGame(game)}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
