import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, DollarSign, Filter, Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';

export default function ManagePayments({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments();
      setPayments(data || []);
    } catch (err) {
      showToast('Error loading payment transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (statusFilter !== 'All') {
      result = result.filter(p => p.payment_status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        (p.user_name && p.user_name.toLowerCase().includes(q)) ||
        (p.game_title && p.game_title.toLowerCase().includes(q)) ||
        (p.payment_method && p.payment_method.toLowerCase().includes(q))
      );
    }

    return result;
  }, [payments, statusFilter, search]);

  const totalRevenue = useMemo(() => {
    return payments
      .filter(p => p.payment_status === 'Completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [payments]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>FINANCIAL <span className="gradient-text">PAYMENTS</span></h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Transaction records from the PAYMENT database table</p>
        </div>

        {/* Total Revenue Summary Box */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(0, 255, 136, 0.3)' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,255,136,0.15)' }}>
            <DollarSign size={24} color="#00ff88" />
          </div>
          <div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Rajdhani, sans-serif' }}>
              ${totalRevenue.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>TOTAL COMPLETED REVENUE</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search payments by user or game..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <select
          className="input-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="All">All Payment Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Game Title</th>
              <th>Amount ($)</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map(p => (
                <tr key={p.payment_id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{p.payment_id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{p.user_name || `User #${p.user_id}`}</td>
                  <td style={{ color: '#00ff88', fontWeight: 600 }}>{p.game_title || `Game #${p.game_id}`}</td>
                  <td style={{ fontWeight: 700, color: '#fff' }}>${Number(p.amount).toFixed(2)}</td>
                  <td style={{ color: '#cbd5e1' }}>{p.payment_method}</td>
                  <td>
                    <span className={`badge ${
                      p.payment_status === 'Completed' ? 'badge-green' :
                      p.payment_status === 'Pending' ? 'badge-gray' : 'badge-gray'
                    }`} style={{
                      borderColor: p.payment_status === 'Failed' ? 'rgba(239,68,68,0.3)' : undefined,
                      color: p.payment_status === 'Failed' ? '#ef4444' : undefined,
                      background: p.payment_status === 'Failed' ? 'rgba(239,68,68,0.1)' : undefined
                    }}>
                      {p.payment_status === 'Completed' && <CheckCircle2 size={12} style={{ marginRight: '4px' }} />}
                      {p.payment_status === 'Pending' && <Clock size={12} style={{ marginRight: '4px' }} />}
                      {p.payment_status === 'Failed' && <AlertCircle size={12} style={{ marginRight: '4px' }} />}
                      {p.payment_status}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.payment_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  No payment records found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
