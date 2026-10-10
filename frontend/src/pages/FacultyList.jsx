import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Power,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    joiningDate: new Date().toISOString().split('T')[0],
    initialPassword: 'Faculty@123',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, [page]);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      let url = `/admin/faculty?page=${page}&size=10`;
      if (search) url += `&query=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.success && res.data) {
        setFaculty(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchFaculty();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      const res = await api.post('/admin/faculty', formData);
      if (res.success) {
        setIsModalOpen(false);
        setToast(`Faculty ${res.data.fullName} registered successfully!`);
        fetchFaculty();
      }
    } catch (err) {
      setModalError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/faculty/${id}/toggle-status`);
      setToast('Faculty member status updated.');
      fetchFaculty();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (id, empId) => {
    if (window.confirm(`Reset password for faculty ${empId}?`)) {
      try {
        await api.post(`/admin/faculty/${id}/reset-password`);
        setToast(`Password reset for ${empId} to Faculty@123.`);
        fetchFaculty();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty & Instructor Directory</h1>
          <p className="page-subtitle">
            Manage academic instructors, research project ownership, and library privileges
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Register Faculty Member
        </button>
      </div>

      {toast && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{toast}</span>
        </div>
      )}

      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by employee ID, name, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Designation & Dept</th>
                <th>Email / Phone</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#2563EB' }}>
                    Loading faculty directory...
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    No faculty registered.
                  </td>
                </tr>
              ) : (
                faculty.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 700, color: '#142D4E' }}>{f.employeeId}</td>
                    <td style={{ fontWeight: 600 }}>{f.fullName}</td>
                    <td>
                      <div>{f.designation}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{f.department}</div>
                    </td>
                    <td>
                      <div>{f.email}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{f.phone || '—'}</div>
                    </td>
                    <td>{f.joiningDate || '—'}</td>
                    <td>
                      <Badge status={f.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleResetPassword(f.facultyId, f.employeeId)}
                          className="btn btn-secondary btn-sm"
                          title="Reset credentials"
                        >
                          <KeyRound size={14} /> Reset
                        </button>
                        <button
                          onClick={() => handleToggleStatus(f.facultyId)}
                          className={`btn btn-sm ${f.isActive ? 'btn-danger' : 'btn-teal'}`}
                        >
                          <Power size={14} /> {f.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
              Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Register Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Faculty Member"
      >
        {modalError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Employee ID (Unique)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. FAC2026003"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Vikram Sarabhai"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Institutional Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="vikram@campusnest.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 9876510003"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-input"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input
                type="text"
                className="form-input"
                value={formData.initialPassword}
                onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
