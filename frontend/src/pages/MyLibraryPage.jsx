import React, { useState, useEffect, useMemo } from 'react';
import { Library, Search, Play, Calendar, Tag, Monitor, CheckCircle2, Compass } from 'lucide-react';
import { api } from '../services/api';

export default function MyLibraryPage({ user, onNavigateToCatalog, onSelectGame }) {
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, title

  const fetchLibrary = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUserLibrary(user.id);
      setLibraryItems(data || []);
    } catch (err) {
      console.error('Error fetching library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [user]);

  const filteredItems = useMemo(() => {
    let result = [...libraryItems];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(item =>
        item.game_title.toLowerCase().includes(q) ||
        (item.genre && item.genre.toLowerCase().includes(q)) ||
        (item.platform && item.platform.toLowerCase().includes(q))
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter(item => item.genre && item.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
    } else if (sortOrder === 'title') {
      result.sort((a, b) => a.game_title.localeCompare(b.game_title));
    }

    return result;
  }, [libraryItems, search, selectedGenre, sortOrder]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Library size={36} color="#00ff88" /> MY GAME <span className="gradient-text">LIBRARY</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Your personal collection of owned digital games ({libraryItems.length} titles owned)
        </p>
      </div>

      {libraryItems.length > 0 ? (
        <>
          {/* Library Search & Filter Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search your library..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>

              <select className="input-control" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                <option value="All">All Genres</option>
                <option value="Action">Action</option>
                <option value="RPG">RPG</option>
                <option value="FPS">FPS / Shooter</option>
                <option value="Adventure">Adventure</option>
              </select>

              <select className="input-control" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Sort by Purchase Date (Newest)</option>
                <option value="oldest">Sort by Purchase Date (Oldest)</option>
                <option value="title">Sort by Game Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Library Cards Grid */}
          <div className="games-grid">
            {filteredItems.map((item) => (
              <div key={item.library_id} className="game-card">
                <div className="card-img-container">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                    alt={item.game_title}
                  />
                  <span className="badge badge-green" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> {item.status || 'Owned'}
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.4rem' }}>
                    {item.game_title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={14} color="#00ff88" /> {item.genre || 'Action'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Monitor size={14} color="#00ff88" /> {item.platform || 'PC'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="#00ff88" /> Acquired: {item.purchase_date}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => alert(`Launching ${item.game_title}... (Mock Game Launcher)`)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Play size={14} fill="#052e16" /> Launch Game
                    </button>

                    <button
                      onClick={() => onSelectGame({ game_id: item.game_id, title: item.game_title })}
                      className="btn btn-secondary btn-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Library size={40} color="#64748b" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Your library is empty</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>
            Explore games in our digital catalog and start building your collection.
          </p>
          <button onClick={onNavigateToCatalog} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
            <Compass size={18} /> Browse Games Catalog
          </button>
        </div>
      )}
    </div>
  );
}
