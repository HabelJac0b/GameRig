import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, Search, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export default function ManageReviews({ showToast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data || []);
    } catch (err) {
      showToast('Error loading reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r =>
    (r.user_name && r.user_name.toLowerCase().includes(search.toLowerCase())) ||
    (r.game_title && r.game_title.toLowerCase().includes(search.toLowerCase())) ||
    (r.review_text && r.review_text.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (reviewId) => {
    try {
      await api.deleteReview(reviewId);
      setDeleteConfirmId(null);
      showToast('Review removed from system', 'success');
      fetchReviews();
    } catch (err) {
      showToast(err.message || 'Error deleting review', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>MODERATE <span className="gradient-text">REVIEWS</span></h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Review moderation table for REVIEW database records ({reviews.length} total reviews)</p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Filter reviews by game or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Game Title</th>
              <th>Rating</th>
              <th>Review Comment</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map(r => (
                <tr key={r.review_id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{r.review_id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{r.user_name || `User #${r.user_id}`}</td>
                  <td style={{ color: '#00ff88', fontWeight: 600 }}>{r.game_title || `Game #${r.game_id}`}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 700, color: '#fff' }}>{r.rating} / 5</span>
                    </div>
                  </td>
                  <td style={{ color: '#cbd5e1', fontSize: '0.88rem', maxWidth: '300px' }}>{r.review_text}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{r.review_date}</td>
                  <td>
                    <button
                      onClick={() => setDeleteConfirmId(r.review_id)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Remove Review</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete Review ID #{deleteConfirmId}?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger" style={{ flex: 1 }}>
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
