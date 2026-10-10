import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Filter,
  Users,
  BookOpen,
} from 'lucide-react';

export default function StudentsList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Group Filters
  const [filterYear, setFilterYear] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterSec, setFilterSec] = useState('');

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academicYear: 'Third Year',
    semester: 6,
    section: 'A',
    dateOfBirth: '2006-08-15',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [page, filterYear, filterDept, filterSem, filterSec]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
      };
      if (search.trim()) params.query = search.trim();
      if (filterYear) params.academicYear = filterYear;
      if (filterDept) params.department = filterDept;
      if (filterSem) params.semester = parseInt(filterSem);
      if (filterSec) params.section = filterSec;

      const res = await api.get('/students', { params });
      if (res.success && res.data) {
        setStudents(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        semester: parseInt(formData.semester) || 1,
      };
      const res = await api.post('/students', payload);
      if (res.success) {
        setIsModalOpen(false);
        setToast(`Student ${formData.fullName} (${formData.registrationNumber}) registered successfully.`);
        setFormData({
          registrationNumber: '',
          fullName: '',
          email: '',
          phone: '',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CSE',
          academicYear: 'Third Year',
          semester: 6,
          section: 'A',
          dateOfBirth: '2006-08-15',
        });
        fetchStudents();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, name) => {
    if (!window.confirm(`Change active account status for ${name}? Historical borrowing records will be preserved.`)) return;

    try {
      const res = await api.patch(`/students/${id}/toggle-status`);
      if (res.success) {
        setToast(`Updated account status for ${name}.`);
        fetchStudents();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleResetPassword = async (id, name, reg) => {
    if (!window.confirm(`Reset password for ${name} (${reg}) to their Date of Birth (format: DDMMYYYY)?`)) return;

    try {
      const res = await api.post(`/students/${id}/reset-password`);
      if (res.success) {
        setToast(`Password reset for ${name} to their DOB. Mandatory change required upon next login.`);
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Academic Directory</h1>
          <p className="page-subtitle">
            Manage students organized by academic year, semester, section, and track borrowing eligibility
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Register Student
          </button>
        )}
      </div>

      {toast && (
        <div
          style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search by registration number, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Academic Year Filter */}
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Years</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>

            {/* Semester Filter */}
            <select
              className="form-select"
              style={{ width: '130px' }}
              value={filterSem}
              onChange={(e) => {
                setFilterSem(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Sem {sem}
                </option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              className="form-select"
              style={{ width: '120px' }}
              value={filterSec}
              onChange={(e) => {
                setFilterSec(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>

            {/* Department Filter */}
            <select
              className="form-select"
              style={{ width: '170px' }}
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication">ECE</option>
              <option value="Mechanical Engineering">ME</option>
              <option value="Artificial Intelligence & Data Science">AI & DS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration No.</th>
                <th>Student Name & Contact</th>
                <th>Department & Course</th>
                <th>Academic Group</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '50px', color: '#64748B' }}>
                    <Users size={36} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                    No students match the selected academic group criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const isActive = s.isActive ?? true;
                  const groupText = `${s.academicYear || 'Year'} — Sem ${s.semester || '—'} — Sec ${s.section || 'A'}`;

                  return (
                    <tr key={s.id} style={{ opacity: isActive ? 1 : 0.65 }}>
                      <td style={{ fontWeight: 700, color: '#142D4E' }}>{s.registrationNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#142D4E' }}>{s.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{s.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{s.department}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{s.course}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #DBEAFE',
                          }}
                        >
                          {groupText}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleResetPassword(s.id, s.fullName, s.registrationNumber)}
                              className="btn btn-secondary btn-sm"
                              title="Reset Password to Date of Birth"
                            >
                              <KeyRound size={14} /> Reset Pass
                            </button>
                            <button
                              onClick={() => handleToggleStatus(s.id, s.fullName)}
                              className={`btn ${isActive ? 'btn-danger' : 'btn-success'} btn-sm`}
                              title={isActive ? 'Deactivate Student Account' : 'Reactivate Student Account'}
                            >
                              <Power size={14} /> {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Showing Page {page + 1} of {totalPages} ({totalElements} registered students)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Register Student Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register New College Student"
        >
          {modalError && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}
            >
              {modalError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
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
                  placeholder="e.g. Vikramaditya Rao"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
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
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Course Degree</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B.Tech CSE"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Academic Group Specifiers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select
                  className="form-select"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  required
                >
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Fourth Year">Fourth Year</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  className="form-select"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <select
                  className="form-select"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth (Initial Password: DDMMYYYY)</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                On first login, the student must change their initial DOB password before accessing the dashboard.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
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
      )}
    </div>
  );
}
