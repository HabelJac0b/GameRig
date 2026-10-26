import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit3, Trash2, Search, Gamepad2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import GameFormModal from '../../components/GameFormModal';

export default function ManageGames({ showToast }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await api.getGames();
      setGames(data || []);
    } catch (err) {
      showToast('Error loading games', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    if (!search.trim()) return games;
    const q = search.toLowerCase().trim();
    return games.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.platform.toLowerCase().includes(q)
    );
  }, [games, search]);

  const handleDelete = async (gameId) => {
    try {
      await api.deleteGame(gameId);
      setDeleteConfirmId(null);
      showToast('Game deleted successfully!', 'success');
      fetchGames();
    } catch (err) {
      showToast(err.message || 'Error deleting game', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>MANAGE <span className="gradient-text">GAMES</span></h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Add, update, or remove entries in the GAME database table</p>
        </div>

        <button
          onClick={() => {
            setSelectedGame(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={18} /> Add New Game
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Games Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Game Title</th>
              <th>Genre</th>
              <th>Platform</th>
              <th>Price ($)</th>
              <th>Release Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.length > 0 ? (
              filteredGames.map(game => (
                <tr key={game.game_id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{game.game_id}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{game.title}</span>
                  </td>
                  <td><span className="badge badge-green">{game.genre}</span></td>
                  <td style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>{game.platform}</td>
                  <td style={{ color: '#00ff88', fontWeight: 700 }}>
                    {game.price === 0 ? 'FREE' : `$${Number(game.price).toFixed(2)}`}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{game.release_date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedGame(game);
                          setShowForm(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Edit Game"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(game.game_id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Game"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  No games found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Game Add/Edit Modal */}
      {showForm && (
        <GameFormModal
          game={selectedGame}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            showToast(selectedGame ? 'Game updated!' : 'Game added!', 'success');
            fetchGames();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Confirm Deletion</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete Game ID #{deleteConfirmId}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger" style={{ flex: 1 }}>
                Delete Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
