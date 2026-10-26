import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, DollarSign, Search, CheckCircle2, AlertCircle, Clock, Download, Printer, ShieldCheck, Gamepad2, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function MyPaymentsPage({ user, onNavigateToCatalog }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchUserPayments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUserPayments(user.id);
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching user payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPayments();
  }, [user]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (statusFilter !== 'All') {
      result = result.filter(p => p.payment_status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        (p.game_title && p.game_title.toLowerCase().includes(q)) ||
        (p.payment_method && p.payment_method.toLowerCase().includes(q))
      );
    }

    return result;
  }, [payments, statusFilter, search]);

  const totalSpent = useMemo(() => {
    return payments
      .filter(p => p.payment_status === 'Completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [payments]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard size={36} color="#00ff88" /> MY PAYMENT <span className="gradient-text">TRANSACTIONS</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Inspect your purchase payment history, receipts, and payment method logs ({payments.length} transactions)
          </p>
        </div>

        {/* Total Spent Badge */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(0,255,136,0.3)' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0, 255, 136, 0.15)' }}>
            <DollarSign size={24} color="#00ff88" />
          </div>
          <div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
              ${totalSpent.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>TOTAL AMOUNT SPENT</span>
          </div>
        </div>
      </div>

      {payments.length > 0 ? (
        <>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search transactions by game or method..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <select className="input-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Game Title</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.payment_id}>
                    <td style={{ color: '#64748b', fontWeight: 600 }}>#{p.payment_id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.game_title}</td>
                    <td style={{ fontWeight: 700, color: '#00ff88' }}>${Number(p.amount).toFixed(2)}</td>
                    <td style={{ color: '#cbd5e1' }}>{p.payment_method}</td>
                    <td>
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> {p.payment_status}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.payment_date}</td>
                    <td>
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="btn btn-secondary btn-sm"
                        title="View Purchase Invoice"
                      >
                        <FileText size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '550px', margin: '0 auto' }}>
          <CreditCard size={48} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem' }}>No Payment History</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>You haven't made any game purchases yet.</p>
          <button onClick={onNavigateToCatalog} className="btn btn-primary">
            Explore Games Catalog
          </button>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gamepad2 size={24} color="#00ff88" />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>
                  GAME<span style={{ color: '#00ff88' }}>RIG</span> INVOICE
                </span>
              </div>
              <span className="badge badge-green">PAID & VERIFIED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>INVOICE ID</span>
                <strong style={{ color: '#fff' }}>INV-2025-{selectedInvoice.payment_id}88</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>TRANSACTION DATE</span>
                <strong style={{ color: '#fff' }}>{selectedInvoice.payment_date}</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Item Description</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{selectedInvoice.game_title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Payment Method</span>
                <span style={{ color: '#cbd5e1' }}>{selectedInvoice.payment_method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Customer</span>
                <span style={{ color: '#cbd5e1' }}>{user.name} ({user.email})</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Total Amount</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
                  ${Number(selectedInvoice.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>
                <Printer size={16} /> Print Receipt
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="btn btn-primary" style={{ flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
