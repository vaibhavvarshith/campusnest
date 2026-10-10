import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import PdfUploader from '../components/PdfUploader';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Send,
  FileText,
  CheckCircle,
  AlertCircle,
  Award,
  ArrowRight,
  TrendingUp,
  Download,
  UserCheck,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

export default function SubjectHeadDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Allocate Project Form State
  const [allocateForm, setAllocateForm] = useState({
    title: '',
    description: '',
    subjectName: 'Advanced Data Structures & Algorithms',
    academicYear: 'Third Year',
    semester: 5,
    section: 'A',
    allocatedFacultyId: '',
    priority: 'HIGH',
    priorityRank: 1,
    maxScore: 100,
    dueDate: '',
    allocationNotes: '',
    pdfUrl: '',
    pdfFileName: '',
    pdfFileSize: 0,
  });

  // Reassign Form State
  const [reassignFacultyId, setReassignFacultyId] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subject-head/dashboard');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
        if (res.data.data.departmentFaculty?.length > 0 && !allocateForm.allocatedFacultyId) {
          setAllocateForm((prev) => ({
            ...prev,
            allocatedFacultyId: res.data.data.departmentFaculty[0].id,
          }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load Subject Head dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...allocateForm,
        semester: parseInt(allocateForm.semester, 10),
        priorityRank: parseInt(allocateForm.priorityRank, 10),
        maxScore: parseInt(allocateForm.maxScore, 10),
        allocatedFacultyId: parseInt(allocateForm.allocatedFacultyId, 10),
      };

      const res = await api.post('/subject-head/allocate', payload);
      if (res.data?.success) {
        setToast('Academic project successfully allocated to faculty member!');
        setIsAllocateModalOpen(false);
        fetchDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Allocation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !reassignFacultyId) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/subject-head/reassign/${selectedProject.id}`, {
        newFacultyId: parseInt(reassignFacultyId, 10),
        allocationNotes: reassignNotes,
      });

      if (res.data?.success) {
        setToast(`Project '${selectedProject.title}' reassigned successfully.`);
        setIsReassignModalOpen(false);
        setSelectedProject(null);
        fetchDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reassignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const res = await api.put(`/subject-head/update-status/${projectId}?status=${newStatus}`);
      if (res.data?.success) {
        setToast(`Project status updated to ${newStatus}`);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Status update failed');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <RefreshCw size={32} className="spin" color="#2563EB" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontWeight: 600 }}>Loading Subject Head Governance Dashboard...</div>
      </div>
    );
  }

  const priorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'HIGH':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' };
      default:
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '16px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
            <Award size={14} /> Subject Head Desk &bull; {data?.department}
          </div>
          <h1 className="page-title">Subject Head Curriculum & Project Governance</h1>
          <p className="page-subtitle">
            Oversee department subject portfolios, allocate academic assignments to faculty, set priority ranking, and monitor student evaluations.
          </p>
        </div>

        <button
          onClick={() => setIsAllocateModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Allocate New Subject Project
        </button>
      </div>

      {toast && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Department Projects</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#142D4E', marginTop: '4px' }}>
            {data?.totalDepartmentProjects || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '4px' }}>
            {data?.managedSubjects?.length || 0} Managed Subject Portfolios
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Assigned to Faculty</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            {data?.assignedCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Pending faculty syllabus publishing
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #16A34A' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Live for Students</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
            {(data?.readyForStudentsCount || 0) + (data?.publishedCount || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '4px' }}>
            Active student submission windows
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #0F9D8A' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Evaluated & Completed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F9D8A', marginTop: '4px' }}>
            {data?.completedCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Finalized faculty rankings
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Managed Projects Table */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E', margin: 0 }}>
              Curriculum Assignments & Faculty Allocations
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {data?.departmentProjects?.length || 0} total assignments
            </span>
          </div>

          {data?.departmentProjects?.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
              No projects allocated yet under this subject portfolio.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '0.86rem' }}>
                <thead>
                  <tr>
                    <th>Assignment & Subject</th>
                    <th>Target Group</th>
                    <th>Assigned Faculty</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.departmentProjects?.map((proj) => {
                    const pStyle = priorityBadgeStyle(proj.priority);
                    return (
                      <tr key={proj.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#142D4E' }}>{proj.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#2563EB' }}>
                            {proj.subjectName || proj.department}
                          </div>
                          {proj.pdfUrl && (
                            <a
                              href={proj.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#DC2626', marginTop: '2px', textDecoration: 'none' }}
                            >
                              <FileText size={12} /> Instructions PDF ({proj.pdfFileName || 'Download'})
                            </a>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{proj.academicYear || 'All Years'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Sem {proj.semester || '-'}, Sec {proj.section || 'All'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#334155' }}>
                            {proj.facultyName || 'Unassigned'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {proj.facultyEmployeeId}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: pStyle.bg,
                              color: pStyle.text,
                              border: `1px solid ${pStyle.border}`,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {proj.priority || 'MEDIUM'} (#{proj.priorityRank || 1})
                          </span>
                        </td>
                        <td>
                          <Badge status={proj.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setSelectedProject(proj);
                                setReassignFacultyId(proj.facultyId || '');
                                setReassignNotes(proj.allocationNotes || '');
                                setIsReassignModalOpen(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              title="Reassign to another faculty member"
                            >
                              Reassign
                            </button>

                            {proj.status === 'ASSIGNED_TO_FACULTY' && (
                              <button
                                onClick={() => handleUpdateStatus(proj.id, 'PUBLISHED')}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                title="Publish directly to students"
                              >
                                Publish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Department Faculty Workload & Managed Subjects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Managed Subjects Card */}
          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#142D4E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#2563EB" /> Managed Subject Portfolio
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data?.managedSubjects?.map((subj, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1D4ED8',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {subj}
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Workload Table */}
          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#142D4E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#D97706" /> Department Faculty Workload
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data?.departmentFaculty?.map((fac) => (
                <div
                  key={fac.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#1E293B' }}>{fac.fullName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      {fac.employeeId} &bull; {fac.designation}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: fac.activeAssignmentsCount > 2 ? '#FEF3C7' : '#DCFCE7',
                      color: fac.activeAssignmentsCount > 2 ? '#B45309' : '#15803D',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                    }}
                  >
                    {fac.activeAssignmentsCount} Assigned
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Allocate Project Modal */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Subject Head Project Allocation Desk"
        maxWidth="750px"
      >
        <form onSubmit={handleAllocateSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject Portfolio</label>
              <select
                className="form-select"
                value={allocateForm.subjectName}
                onChange={(e) => setAllocateForm({ ...allocateForm, subjectName: e.target.value })}
                required
              >
                {data?.managedSubjects?.map((subj, idx) => (
                  <option key={idx} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assign to Faculty Member</label>
              <select
                className="form-select"
                value={allocateForm.allocatedFacultyId}
                onChange={(e) => setAllocateForm({ ...allocateForm, allocatedFacultyId: e.target.value })}
                required
              >
                <option value="">Select Department Faculty...</option>
                {data?.departmentFaculty?.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.fullName} ({fac.employeeId} - {fac.activeAssignmentsCount} current tasks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Project / Assignment Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Scalable Distributed Cache System Implementation"
              value={allocateForm.title}
              onChange={(e) => setAllocateForm({ ...allocateForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Academic Year</label>
              <select
                className="form-select"
                value={allocateForm.academicYear}
                onChange={(e) => setAllocateForm({ ...allocateForm, academicYear: e.target.value })}
                required
              >
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Fourth Year">Fourth Year</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Semester</label>
              <select
                className="form-select"
                value={allocateForm.semester}
                onChange={(e) => setAllocateForm({ ...allocateForm, semester: e.target.value })}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Section</label>
              <select
                className="form-select"
                value={allocateForm.section}
                onChange={(e) => setAllocateForm({ ...allocateForm, section: e.target.value })}
                required
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={allocateForm.priority}
                onChange={(e) => setAllocateForm({ ...allocateForm, priority: e.target.value })}
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Priority Rank</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={allocateForm.priorityRank}
                onChange={(e) => setAllocateForm({ ...allocateForm, priorityRank: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Submission Due Date</label>
              <input
                type="date"
                className="form-input"
                value={allocateForm.dueDate}
                onChange={(e) => setAllocateForm({ ...allocateForm, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Syllabus Overview & Detailed Instructions</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Outline project expectations, milestones, and grading rubrics..."
              value={allocateForm.description}
              onChange={(e) => setAllocateForm({ ...allocateForm, description: e.target.value })}
              required
            />
          </div>

          {/* Genuine PDF Upload Component */}
          <PdfUploader
            fileCategory="PROJECT_INSTRUCTION"
            label="Upload Assignment Instruction / Question Paper PDF"
            helperText="Upload official question paper or specifications PDF (Max 10 MB)"
            onUploadSuccess={(fileData) => {
              setAllocateForm((prev) => ({
                ...prev,
                pdfUrl: fileData.downloadUrl,
                pdfFileName: fileData.originalFileName,
                pdfFileSize: fileData.fileSize,
              }));
            }}
            onRemove={() => {
              setAllocateForm((prev) => ({
                ...prev,
                pdfUrl: '',
                pdfFileName: '',
                pdfFileSize: 0,
              }));
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAllocateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Allocating...' : 'Allocate Assignment to Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reassign Faculty Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title={`Reassign Faculty: ${selectedProject?.title}`}
      >
        <form onSubmit={handleReassignSubmit}>
          <div className="form-group">
            <label className="form-label">Select New Faculty Member</label>
            <select
              className="form-select"
              value={reassignFacultyId}
              onChange={(e) => setReassignFacultyId(e.target.value)}
              required
            >
              <option value="">Select Faculty...</option>
              {data?.departmentFaculty?.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.fullName} ({fac.employeeId} - {fac.activeAssignmentsCount} current tasks)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reassignment Notes & Reason</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Workload redistribution, specialized domain expertise required..."
              value={reassignNotes}
              onChange={(e) => setReassignNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsReassignModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
