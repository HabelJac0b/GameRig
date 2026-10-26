import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Star, Search, ThumbsUp, Flame, Heart, Gamepad2, Smile, Lightbulb, Filter, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewsPage({ onSelectGame }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Local state to store emoji reaction counts for each review
  const [reactions, setReactions] = useState(() => {
    const saved = localStorage.getItem('gamerig_review_reactions');
    return saved ? JSON.parse(saved) : {};
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching community reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReact = (reviewId, emojiType) => {
    setReactions(prev => {
      const currentReviewReactions = prev[reviewId] || {
        fire: 2,
        like: 5,
        heart: 3,
        gamer: 4,
        funny: 1,
        bulb: 2,
        userReacted: {}
      };

      const hasReacted = currentReviewReactions.userReacted?.[emojiType];
      const countChange = hasReacted ? -1 : 1;

      const updated = {
        ...prev,
        [reviewId]: {
          ...currentReviewReactions,
          [emojiType]: Math.max(0, (currentReviewReactions[emojiType] || 0) + countChange),
          userReacted: {
            ...(currentReviewReactions.userReacted || {}),
            [emojiType]: !hasReacted
          }
        }
      };

      localStorage.setItem('gamerig_review_reactions', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (ratingFilter !== 'All') {
      result = result.filter(r => Number(r.rating) === Number(ratingFilter));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(r =>
        (r.game_title && r.game_title.toLowerCase().includes(q)) ||
        (r.user_name && r.user_name.toLowerCase().includes(q)) ||
        (r.review_text && r.review_text.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    } else {
      // Newest first
      result.sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
    }

    return result;
  }, [reviews, ratingFilter, search, sortBy]);

  const emojiList = [
    { type: 'fire', icon: '🔥', label: 'Hot' },
    { type: 'like', icon: '👍', label: 'Helpful' },
    { type: 'heart', icon: '❤️', label: 'Love' },
    { type: 'gamer', icon: '🕹️', label: 'Gamer' },
    { type: 'funny', icon: '😂', label: 'Funny' },
    { type: 'bulb', icon: '💡', label: 'Insightful' }
  ];

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={36} color="#00ff88" /> COMMUNITY <span className="gradient-text">REVIEWS & FEEDBACK</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Read ratings and player reviews across all games, and react with emojis ({reviews.length} total reviews)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search reviews by game, user, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="input-control" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={{ width: '150px' }}>
            <option value="All">All Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>

          <select className="input-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '150px' }}>
            <option value="newest">Sort by Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading community reviews...</div>
      ) : filteredReviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReviews.map((r) => {
            const reviewId = r.review_id;
            const rState = reactions[reviewId] || {
              fire: 2 + (reviewId % 3),
              like: 4 + (reviewId % 5),
              heart: 1 + (reviewId % 2),
              gamer: 3,
              funny: reviewId % 2,
              bulb: 2,
              userReacted: {}
            };

            return (
              <div
                key={reviewId}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {/* User Avatar Badge */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(16,185,129,0.1) 100%)',
                      border: '1px solid #00ff88',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#00ff88',
                      fontSize: '1.1rem'
                    }}>
                      {(r.user_name || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.2rem' }}>
                        {r.user_name || 'Verified Gamer'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#00ff88', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Gamepad2 size={14} /> {r.game_title}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>• {r.review_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < r.rating ? '#00ff88' : 'none'}
                        color={i < r.rating ? '#00ff88' : '#475569'}
                      />
                    ))}
                    <span style={{ fontWeight: 700, color: '#fff', marginLeft: '0.35rem', fontSize: '0.9rem' }}>
                      {r.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
                  "{r.review_text || 'No comment provided.'}"
                </p>

                {/* Bottom Bar: Emoji Reactions & Game Details Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {/* Emoji Bar */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', marginRight: '0.25rem', fontWeight: 600 }}>REACT:</span>
                    {emojiList.map(e => {
                      const count = rState[e.type] || 0;
                      const active = rState.userReacted?.[e.type];
                      return (
                        <button
                          key={e.type}
                          onClick={() => handleReact(reviewId, e.type)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '20px',
                            background: active ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                            border: active ? '1px solid #00ff88' : '1px solid var(--border-color)',
                            color: active ? '#00ff88' : '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                          title={`React with ${e.label}`}
                        >
                          <span>{e.icon}</span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* View Game Link */}
                  {onSelectGame && (
                    <button
                      onClick={() => onSelectGame({ game_id: r.game_id, title: r.game_title })}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      View Game <ArrowUpRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <MessageSquare size={48} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>No Reviews Found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search query or rating filter.</p>
        </div>
      )}
    </div>
  );
}
