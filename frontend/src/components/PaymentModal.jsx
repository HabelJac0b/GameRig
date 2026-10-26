import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, Wallet, Clock, Gift, ShieldCheck, CheckCircle2, Loader2, Tag } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentModal({ game, user, onClose, onSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  // Payment field states
  const [upiId, setUpiId] = useState('gamer@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [bank, setBank] = useState('HDFC Bank');
  const [walletApp, setWalletApp] = useState('Paytm Wallet');
  const [payLaterProvider, setPayLaterProvider] = useState('LazyPay');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'GAMERIG10') {
      setDiscount(10);
      setPromoApplied(true);
      setError('');
    } else if (promoCode.toUpperCase() === 'FIRSTGAME' && game.price > 15) {
      setDiscount(15);
      setPromoApplied(true);
      setError('');
    } else {
      setError('Invalid promo code. Try "GAMERIG10" for $10 off.');
    }
  };

  const finalAmount = Math.max(0, game.price - discount);

  const handlePay = async () => {
    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentData = {
        game_id: game.game_id,
        amount: finalAmount,
        payment_method: method,
        payment_status: 'Completed'
      };

      await api.processPayment(paymentData);
      setProcessing(false);
      setCompleted(true);

      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Payment transaction failed. Please try again.');
    }
  };

  const paymentOptions = [
    { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'GPay, PhonePe, Paytm, BHIM' },
    { id: 'Credit Card', label: 'Credit Card', icon: CreditCard, desc: 'Visa, MasterCard, Amex' },
    { id: 'Debit Card', label: 'Debit Card', icon: CreditCard, desc: 'All major bank debit cards' },
    { id: 'Net Banking', label: 'Net Banking', icon: Building2, desc: 'Instant bank transfer' },
    { id: 'Wallet', label: 'Mobile Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay, PhonePe' },
    { id: 'Pay Later', label: 'Pay Later / EMI', icon: Clock, desc: 'LazyPay, ZestMoney, ICICI Pay Later' },
    { id: 'Gift Card', label: 'Gift Card / Voucher', icon: Gift, desc: 'GameRig Gift Card' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
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

        {!completed ? (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>CHECKOUT PAYMENT GATEWAY</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Secure ADBMS College Demo Transaction Interface</p>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            {/* Purchase Summary Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Selected Game</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{game.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Account</span>
                <span style={{ color: '#cbd5e1' }}>{user.name} ({user.email})</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#00ff88' }}>
                  <span>Discount Applied</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.65rem 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Total Amount Payable</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
                  {finalAmount === 0 ? 'FREE' : `$${Number(finalAmount).toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Promo Code Coupon Box */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Promo Code (e.g. GAMERIG10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="input-control"
                  style={{ textTransform: 'uppercase', fontSize: '0.88rem' }}
                  disabled={promoApplied}
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="btn btn-secondary btn-sm"
                  disabled={promoApplied}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Tag size={14} /> {promoApplied ? 'Applied' : 'Apply Code'}
                </button>
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.65rem', fontWeight: 600 }}>
                SELECT PAYMENT METHOD
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {paymentOptions.map(item => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        background: active ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: active ? '1px solid #00ff88' : '1px solid var(--border-color)',
                        color: active ? '#00ff88' : '#cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        <Icon size={16} color={active ? '#00ff88' : '#94a3b8'} /> {item.label}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual Input Fields for Selected Method */}
            {method === 'UPI' && (
              <div className="form-group">
                <label>VPA / UPI ID</label>
                <input
                  type="text"
                  className="input-control"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@gpay / username@paytm"
                />
              </div>
            )}

            {(method === 'Credit Card' || method === 'Debit Card') && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    className="input-control"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    className="input-control"
                    maxLength={3}
                    defaultValue="888"
                  />
                </div>
              </div>
            )}

            {method === 'Net Banking' && (
              <div className="form-group">
                <label>Select Bank Account</label>
                <select className="input-control" value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {method === 'Wallet' && (
              <div className="form-group">
                <label>Select Mobile Wallet</label>
                <select className="input-control" value={walletApp} onChange={(e) => setWalletApp(e.target.value)}>
                  <option value="Paytm Wallet">Paytm Wallet</option>
                  <option value="Amazon Pay Balance">Amazon Pay Balance</option>
                  <option value="PhonePe Wallet">PhonePe Wallet</option>
                  <option value="MobiKwik">MobiKwik</option>
                </select>
              </div>
            )}

            {method === 'Pay Later' && (
              <div className="form-group">
                <label>Select Pay Later / EMI Provider</label>
                <select className="input-control" value={payLaterProvider} onChange={(e) => setPayLaterProvider(e.target.value)}>
                  <option value="LazyPay">LazyPay (0% Interest)</option>
                  <option value="ZestMoney EMI">ZestMoney 3-Month EMI</option>
                  <option value="ICICI Pay Later">ICICI Pay Later</option>
                  <option value="Flipkart Pay Later">Flipkart Pay Later</option>
                </select>
              </div>
            )}

            {method === 'Gift Card' && (
              <div className="form-group">
                <label>GameRig Gift Voucher Pin</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="GR-XXXX-XXXX-XXXX"
                  defaultValue="GR-9981-8821-5541"
                />
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}
            >
              {processing ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Authorizing Payment...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Pay {finalAmount === 0 ? 'Free' : `$${Number(finalAmount).toFixed(2)}`} via {method}
                </>
              )}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 136, 0.15)',
              border: '2px solid #00ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={42} color="#00ff88" />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Purchase Completed!</h2>
            <p style={{ color: '#00ff88', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              "{game.title}" is now permanently in your library.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Payment Method: <strong>{method}</strong> • Amount: <strong>${finalAmount.toFixed(2)}</strong>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
