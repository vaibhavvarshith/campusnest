import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  GraduationCap,
  Plus,
  Search,
  KeyRound,
  Power,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academicYear: '1st Year',
    dateOfBirth: '2006-05-15',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `/admin/students?page=${page}&size=10`;
      if (search) url += `&query=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.success && res.data) {
        setStudents(res.data.content || []);
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
    fetchStudents();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      const res = await api.post('/admin/students', formData);
      if (res.success) {
        setIsModalOpen(false);
        setToast(`Student ${res.data.fullName} registered! Initial password: DOB (${formData.dateOfBirth.replace(/-/g, '')}).`);
        fetchStudents();
      }
    } catch (err) {
      setModalError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, name) => {
    try {
      await api.patch(`/admin/students/${id}/toggle-status`);
      setToast(`Student account status updated.`);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (id, regNo) => {
    if (window.confirm(`Reset password for student ${regNo} to date of birth default?`)) {
      try {
        await api.post(`/admin/students/${id}/reset-password`);
        setToast(`Password reset for ${regNo}. User must change password on next login.`);
        fetchStudents();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Patron Registry</h1>
          <p className="page-subtitle">
            Manage student registrations, borrowing authorization, and credential resets
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Register Student
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
              placeholder="Search by registration number, name, department..."
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
                <th>Registration No.</th>
                <th>Full Name</th>
                <th>Department & Course</th>
                <th>Year</th>
                <th>Email / Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#2563EB' }}>
                    Loading students list...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    No students registered yet.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: '#142D4E' }}>{s.registrationNumber}</td>
                    <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                    <td>
                      <div>{s.department}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{s.course}</div>
                    </td>
                    <td>{s.academicYear}</td>
                    <td>
                      <div>{s.email}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{s.phone || '—'}</div>
                    </td>
                    <td>
                      <Badge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleResetPassword(s.studentId, s.registrationNumber)}
                          className="btn btn-secondary btn-sm"
                          title="Reset credentials to Date of Birth"
                        >
                          <KeyRound size={14} /> Reset
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s.studentId, s.fullName)}
                          className={`btn btn-sm ${s.isActive ? 'btn-danger' : 'btn-teal'}`}
                          title={s.isActive ? 'Deactivate account' : 'Activate account'}
                        >
                          <Power size={14} /> {s.isActive ? 'Suspend' : 'Activate'}
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

      {/* Register Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New College Student"
      >
        {modalError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Registration Number (Unique)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. STU2026006"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ananya Sen"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="ananya.sen@campusnest.edu"
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
                placeholder="+91 9876500006"
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
              <label className="form-label">Degree Course</label>
              <input
                type="text"
                className="form-input"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Date of Birth (Sets Initial Login Password)
            </label>
            <input
              type="date"
              className="form-input"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Student logs in using Registration Number + DOB format <code>DDMMYYYY</code>. A password update is mandated on first login.
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
              {submitting ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
