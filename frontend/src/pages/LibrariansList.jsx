import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  BookOpen,
  Plus,
  Search,
  KeyRound,
  Power,
  CheckCircle,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

export default function LibrariansList() {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    initialPassword: 'LIB2026',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const fetchLibrarians = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/librarians');
      if (res.success && res.data) {
        setLibrarians(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch librarians');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      const res = await api.post('/admin/librarians', formData);
      if (res.success) {
        setToast('Librarian account created successfully with default password LIB2026');
        setIsModalOpen(false);
        setFormData({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          initialPassword: 'LIB2026',
        });
        fetchLibrarians();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to register librarian');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this librarian?`)) return;
    try {
      await api.patch(`/admin/librarians/${id}/toggle-status`);
      setToast('Librarian status updated');
      fetchLibrarians();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Reset password for ${name} to default development password (LIB2026)?`)) return;
    try {
      await api.post(`/admin/librarians/${id}/reset-password`);
      setToast(`Password for ${name} reset to LIB2026`);
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const filtered = librarians.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.username?.toLowerCase().includes(q) ||
      l.fullName?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Staff & Circulation Officers</h1>
          <p className="page-subtitle">
            Manage authorized librarians with access to circulation desk, approvals, and fine auditing
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Register Librarian
        </button>
      </div>

      {toast && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by name, username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Librarian</th>
                <th>Username</th>
                <th>Contact Details</th>
                <th>Role</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading library staff directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    No librarian records found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#F0FDF4',
                            color: '#0F9D8A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            border: '1px solid #BBF7D0',
                          }}
                        >
                          {l.fullName?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#142D4E' }}>{l.fullName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Circulation Desk</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{l.username}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#334155' }}>{l.email}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{l.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#F0FDF4', color: '#0F9D8A', border: '1px solid #BBF7D0' }}>
                        Librarian
                      </span>
                    </td>
                    <td>
                      <Badge status={l.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleResetPassword(l.id, l.fullName)}
                          className="btn btn-secondary btn-sm"
                          title="Reset password to default LIB2026"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(l.id, l.isActive)}
                          className={`btn btn-sm ${l.isActive ? 'btn-danger' : 'btn-success'}`}
                          title={l.isActive ? 'Deactivate account' : 'Activate account'}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Librarian Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Librarian"
      >
        {modalError && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Chief Librarian Mrs. Smith"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username or Employee ID *</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. librarian2 or LIB2026002"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="librarian@campusnest.edu"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password (Default: LIB2026)</label>
            <input
              type="text"
              className="form-input"
              value={formData.initialPassword}
              onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Register Librarian'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
