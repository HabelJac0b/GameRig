import React, { useState } from 'react';
import { X, Star, MessageSquarePlus, Send } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewModal({ game, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Please write a review comment.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5 stars.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.submitReview({
        game_id: game.game_id,
        rating,
        review_text: reviewText
      });
      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error submitting review.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <MessageSquarePlus size={24} color="#00ff88" />
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>WRITE A REVIEW</h2>
        </div>

        <p style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
          Reviewing: <span style={{ color: '#00ff88' }}>{game.title}</span>
        </p>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
            <label style={{ marginBottom: '0.5rem' }}>YOUR RATING (1-5 STARS)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <Star
                      size={32}
                      fill={active ? '#00ff88' : 'transparent'}
                      color={active ? '#00ff88' : '#475569'}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '0.9rem', color: '#00ff88', fontWeight: 600, marginTop: '0.25rem' }}>
              {rating === 5 ? '5 / 5 — Masterpiece' :
               rating === 4 ? '4 / 5 — Great' :
               rating === 3 ? '3 / 5 — Average' :
               rating === 2 ? '2 / 5 — Mediocre' : '1 / 5 — Poor'}
            </span>
          </div>

          {/* Review Text Area */}
          <div className="form-group">
            <label>YOUR REVIEW COMMENTS</label>
            <textarea
              className="input-control"
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you love or dislike about this game?"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Send size={16} /> {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
