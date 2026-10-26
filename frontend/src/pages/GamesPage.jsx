import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Star, Gamepad2, AlertCircle, Tag } from 'lucide-react';

export default function GamesPage({ games, globalSearch, setGlobalSearch, onSelectGame }) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('genre_asc'); // genre_asc, genre_desc, rating, price_asc, price_desc, title, release
  const [localSearch, setLocalSearch] = useState('');

  // Extract all unique genres dynamically from the games dataset
  const uniqueGenres = useMemo(() => {
    const set = new Set();
    games.forEach(g => {
      if (g.genre) set.add(g.genre);
    });
    return ['All', ...Array.from(set).sort()];
  }, [games]);

  const platforms = ['All', 'PC', 'PlayStation', 'Xbox', 'Switch'];

  const filteredGames = useMemo(() => {
    let result = [...games];

    const searchQ = (localSearch || globalSearch).toLowerCase().trim();
    if (searchQ) {
      result = result.filter(g =>
        g.title.toLowerCase().includes(searchQ) ||
        (g.description && g.description.toLowerCase().includes(searchQ)) ||
        (g.genre && g.genre.toLowerCase().includes(searchQ)) ||
        (g.platform && g.platform.toLowerCase().includes(searchQ))
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter(g => g.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    if (selectedPlatform !== 'All') {
      result = result.filter(g => g.platform.toLowerCase().includes(selectedPlatform.toLowerCase()));
    }

    // Sorting logic including Genre (A-Z) and Genre (Z-A)
    if (sortBy === 'genre_asc') {
      result.sort((a, b) => a.genre.localeCompare(b.genre));
    } else if (sortBy === 'genre_desc') {
      result.sort((a, b) => b.genre.localeCompare(a.genre));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'release') {
      result.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    }

    return result;
  }, [games, globalSearch, localSearch, selectedGenre, selectedPlatform, sortBy]);

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          GAME <span className="gradient-text">CATALOG</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Browse and search our full digital game database ({filteredGames.length} of {games.length} titles)
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by title, genre, platform..."
              value={localSearch || globalSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setGlobalSearch(e.target.value);
              }}
              className="input-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Filter by Genre */}
          <div>
            <select
              className="input-control"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="All">Filter by Genre (All)</option>
              {uniqueGenres.filter(g => g !== 'All').map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Filter by Platform */}
          <div>
            <select
              className="input-control"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="All">Filter by Platform (All)</option>
              {platforms.filter(p => p !== 'All').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown including Genre Sorting */}
          <div>
            <select
              className="input-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ borderColor: sortBy.startsWith('genre') ? '#00ff88' : 'var(--border-color)' }}
            >
              <option value="genre_asc">🏷️ Sort by Genre (A - Z)</option>
              <option value="genre_desc">🏷️ Sort by Genre (Z - A)</option>
              <option value="rating">⭐ Sort by Rating (Highest First)</option>
              <option value="price_asc">💵 Sort by Price (Low to High)</option>
              <option value="price_desc">💵 Sort by Price (High to Low)</option>
              <option value="title">🔤 Sort by Title (A - Z)</option>
              <option value="release">📅 Sort by Release Date (Newest)</option>
            </select>
          </div>
        </div>

        {/* Quick Genre Pills Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
            <Tag size={14} /> QUICK GENRE:
          </span>
          {uniqueGenres.slice(0, 8).map(g => {
            const active = selectedGenre === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`badge ${active ? 'badge-green' : 'badge-gray'}`}
                style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Games Catalog Grid */}
      {filteredGames.length > 0 ? (
        <div className="games-grid">
          {filteredGames.map(game => (
            <div key={game.game_id} className="game-card">
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
                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.4rem' }}>
                  {game.title}
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  <span>{game.platform}</span>
                  <span>•</span>
                  <span>{game.release_date}</span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {game.description}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Star size={16} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 700, color: '#fff' }}>{game.avg_rating || '5.0'}</span>
                    </div>

                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
                      {game.price === 0 ? 'FREE' : `$${Number(game.price).toFixed(2)}`}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectGame(game)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>No games found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search query or genre filters.</p>
        </div>
      )}
    </div>
  );
}
