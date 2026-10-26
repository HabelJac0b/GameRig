import React, { useState, useEffect } from 'react';
import { Library, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ManageLibrary({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const data = await api.getAllLibrary();
      setItems(data || []);
    } catch (err) {
      showToast('Error loading library records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const filteredItems = items.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.user_name && item.user_name.toLowerCase().includes(q)) ||
      (item.game_title && item.game_title.toLowerCase().includes(q)) ||
      String(item.user_id).includes(q) ||
      String(item.game_id).includes(q)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>LIBRARY <span className="gradient-text">OWNERSHIP RECORDS</span></h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>System-wide user game entitlements from the LIBRARY database table ({items.length} records)</p>
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search ownership by user or game title..."
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
              <th>Library ID</th>
              <th>User Name</th>
              <th>User Email</th>
              <th>Owned Game Title</th>
              <th>Purchase Date</th>
              <th>Entitlement Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.library_id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{item.library_id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{item.user_name || `User #${item.user_id}`}</td>
                  <td style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>{item.user_email || '-'}</td>
                  <td style={{ color: '#00ff88', fontWeight: 600 }}>{item.game_title || `Game #${item.game_id}`}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{item.purchase_date}</td>
                  <td>
                    <span className="badge badge-green">
                      <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> {item.status || 'Owned'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  No library ownership records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
