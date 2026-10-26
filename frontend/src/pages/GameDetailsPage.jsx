import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShoppingBag, CheckCircle2, MessageSquarePlus, Calendar, Monitor, Tag, User } from 'lucide-react';
import { api } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/ReviewModal';

export default function GameDetailsPage({ gameId, user, onBack, onNavigateToLibrary }) {
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getGame(gameId);
      setGame(data);
      setReviews(data.reviews || []);

      if (user) {
        const userLib = await api.getUserLibrary(user.id);
        const owned = userLib.some(item => item.game_id == gameId);
        setIsOwned(owned);
      }
    } catch (err) {
      console.error('Error fetching game details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gameId, user]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <p style={{ color: '#00ff88', fontSize: '1.2rem', fontWeight: 600 }}>Loading game parameters...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>Game Not Found</h2>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Hero Game Banner */}
      <div className="glass-panel" style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '2.5rem'
      }}>
        {/* Banner Overlay Image */}
        <div style={{
          position: 'relative',
          height: '340px',
          width: '100%',
          overflow: 'hidden'
        }}>
          <img
            src={game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'}
            alt={game.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.5)'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #0d111a 0%, transparent 100%)'
          }} />

          {/* Banner Title Details */}
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2.5rem',
            right: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-green">{game.genre}</span>
                <span className="badge badge-gray">{game.platform}</span>
              </div>
              <h1 style={{ fontSize: '3rem', color: '#fff', lineHeight: 1.1 }}>{game.title}</h1>
            </div>

            {/* Price & Primary CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>PRICE</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
                  {game.price === 0 ? 'FREE' : `$${Number(game.price).toFixed(2)}`}
                </span>
              </div>

              {isOwned ? (
                <button onClick={() => onNavigateToLibrary()} className="btn btn-secondary" style={{ padding: '0.9rem 1.75rem', fontSize: '1rem', borderColor: '#00ff88', color: '#00ff88' }}>
                  <CheckCircle2 size={20} color="#00ff88" /> In Your Library
                </button>
              ) : (
                <button onClick={() => setShowPayment(true)} className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                  <ShoppingBag size={20} /> Buy Game Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Specification Details */}
        <div style={{ padding: '2rem 2.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>ABOUT THE GAME</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '1rem' }}>
              {game.description || 'No detailed description available for this game.'}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{game.avg_rating || '5.0'} / 5.0</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Based on {reviews.length} reviews</span>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-color)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Calendar size={18} color="#00ff88" /> Release Date: <strong>{game.release_date}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Monitor size={18} color="#00ff88" /> Platforms: <strong>{game.platform}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Tag size={18} color="#00ff88" /> Genre: <strong>{game.genre}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>PLAYER REVIEWS & RATINGS</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Real feedback from verified GameRig community players</p>
          </div>

          <button
            onClick={() => setShowReview(true)}
            className="btn btn-secondary"
          >
            <MessageSquarePlus size={18} color="#00ff88" /> Write a Review
          </button>
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map((rev) => (
              <div
                key={rev.review_id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{rev.user_name}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.5rem' }}>{rev.review_date}</span>
                    </div>
                  </div>

                  {/* Star Score */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={s <= rev.rating ? '#00ff88' : 'transparent'}
                        color={s <= rev.rating ? '#00ff88' : '#475569'}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {rev.review_text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1rem' }}>
              No reviews have been written for this game yet.
            </p>
            <button onClick={() => setShowReview(true)} className="btn btn-primary btn-sm">
              Be the first to write a review
            </button>
          </div>
        )}
      </div>

      {/* Mock Payment Modal */}
      {showPayment && (
        <PaymentModal
          game={game}
          user={user}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            fetchData();
            onNavigateToLibrary();
          }}
        />
      )}

      {/* Review Modal */}
      {showReview && (
        <ReviewModal
          game={game}
          onClose={() => setShowReview(false)}
          onSuccess={() => {
            setShowReview(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
