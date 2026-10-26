import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export default function ManageUsers({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err) {
      showToast('Error loading user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const handleDelete = async (userId) => {
    try {
      await api.deleteUser(userId);
      setDeleteConfirmId(null);
      showToast('User account deleted', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Error deleting user', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>MANAGE <span className="gradient-text">USERS</span></h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Registered player accounts in the USER database table ({users.length} registered)</p>
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* User Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.user_id}>
                  <td style={{ color: '#64748b', fontWeight: 600 }}>#{user.user_id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{user.email}</td>
                  <td style={{ color: '#94a3b8' }}>{user.phone || 'N/A'}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{user.date_joined}</td>
                  <td>
                    <button
                      onClick={() => setDeleteConfirmId(user.user_id)}
                      className="btn btn-danger btn-sm"
                      title="Delete User"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  No users found matching your search.
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
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Remove User Account</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete User #{deleteConfirmId}? All associated reviews, library items and payments will be removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger" style={{ flex: 1 }}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
