import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Gamepad2 } from 'lucide-react';
import { api } from '../services/api';

export default function GameFormModal({ game, onClose, onSuccess }) {
  const [title, setTitle] = useState(game?.title || '');
  const [description, setDescription] = useState(game?.description || '');
  const [genre, setGenre] = useState(game?.genre || 'Action');
  const [price, setPrice] = useState(game?.price !== undefined ? game.price : 29.99);
  const [platform, setPlatform] = useState(game?.platform || 'PC');
  const [releaseDate, setReleaseDate] = useState(game?.release_date || new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(game?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!game;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !genre || price === undefined || !platform) {
      setError('Title, genre, price, and platform are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        title,
        description,
        genre,
        price: parseFloat(price),
        platform,
        release_date: releaseDate,
        image: image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
      };

      if (isEdit) {
        await api.updateGame(game.game_id, data);
      } else {
        await api.createGame(data);
      }

      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error saving game details.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Gamepad2 size={24} color="#00ff88" />
          <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>
            {isEdit ? 'EDIT GAME ENTRY' : 'ADD NEW GAME'}
          </h2>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>GAME TITLE *</label>
            <input
              type="text"
              className="input-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cyberpunk 2077"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>GENRE *</label>
              <select className="input-control" value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option value="Action">Action</option>
                <option value="Action RPG">Action RPG</option>
                <option value="RPG">RPG</option>
                <option value="FPS / Shooter">FPS / Shooter</option>
                <option value="Metroidvania">Metroidvania</option>
                <option value="Sci-Fi RPG">Sci-Fi RPG</option>
                <option value="Open World RPG">Open World RPG</option>
                <option value="Strategy">Strategy</option>
                <option value="Racing">Racing</option>
              </select>
            </div>

            <div className="form-group">
              <label>PRICE ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>PLATFORM *</label>
              <input
                type="text"
                className="input-control"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. PC / PS5 / Xbox"
                required
              />
            </div>

            <div className="form-group">
              <label>RELEASE DATE</label>
              <input
                type="date"
                className="input-control"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>IMAGE POSTER URL (OPTIONAL)</label>
            <input
              type="text"
              className="input-control"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>GAME DESCRIPTION</label>
            <textarea
              className="input-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of game storyline, mechanics and key features..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {isEdit ? <Save size={16} /> : <PlusCircle size={16} />}
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
