import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  FolderGit2,
  Plus,
  Calendar,
  Clock,
  Send,
  FileCheck2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  MessageSquare,
  Award,
  Link as LinkIcon,
  Filter,
  FileText,
  Users,
  Check,
} from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'ROLE_FACULTY';
  const isStudent = user?.role === 'ROLE_STUDENT';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Faculty / Admin
  const [filterYear, setFilterYear] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [filterSection, setFilterSection] = useState('All');

  // Create Project Modal (Faculty/Admin)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    department: user?.department || 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academicYear: 'Third Year',
    semester: 6,
    section: 'A',
    submissionFormat: 'GitHub Repository / PDF Report',
    instructions: '',
    attachmentUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  // Submit Modal (Student)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');

  // Submissions Review Modal (Faculty)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentSubmissions, setCurrentSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('A');
  const [feedback, setFeedback] = useState('');

  const [toast, setToast] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [user, filterYear, filterSem, filterSection]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let endpoint = '/student/projects?page=0&size=50';
      if (isFaculty || isAdmin) {
        let queryParams = new URLSearchParams({ page: 0, size: 50 });
        if (filterYear !== 'All') queryParams.append('academicYear', filterYear);
        if (filterSem !== 'All') queryParams.append('semester', filterSem);
        if (filterSection !== 'All') queryParams.append('section', filterSection);
        endpoint = `/faculty/projects?${queryParams.toString()}`;
      }

      const res = await api.get(endpoint);
      if (res.success && res.data) {
        setProjects(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      const payload = {
        ...projectForm,
        semester: projectForm.semester ? parseInt(projectForm.semester, 10) : null,
      };
      const res = await api.post('/faculty/projects', payload);
      if (res.success) {
        setIsCreateModalOpen(false);
        setToast('Academic project created successfully!');
        setProjectForm({
          title: '',
          description: '',
          department: user?.department || 'Computer Science & Engineering',
          course: 'B.Tech CSE',
          academicYear: 'Third Year',
          semester: 6,
          section: 'A',
          submissionFormat: 'GitHub Repository / PDF Report',
          instructions: '',
          attachmentUrl: '',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: '',
        });
        fetchProjects();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      const payload = {
        projectId: selectedProject.id,
        submissionText: submissionText,
        fileName: fileName || 'academic_submission_report.pdf',
        fileSize: 1024 * 512,
        fileUrl: '/uploads/submissions/sample.pdf',
      };

      const res = await api.post('/student/projects/submit', payload);
      if (res.success) {
        setIsSubmitModalOpen(false);
        setToast(`Submission for '${selectedProject.title}' uploaded successfully!`);
        setSubmissionText('');
        setFileName('');
        fetchProjects();
      }
    } catch (err) {
      setModalError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReviews = async (project) => {
    setSelectedProject(project);
    try {
      const res = await api.get(`/faculty/projects/${project.id}/submissions`);
      if (res.success && res.data) {
        setCurrentSubmissions(Array.isArray(res.data) ? res.data : (res.data.content || []));
        setIsReviewModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch submissions');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/faculty/projects/submissions/${selectedSubmission.id}/grade`, {
        grade: grade,
        feedback: feedback,
      });
      if (res.success) {
        setToast(`Grade ${grade} awarded to student ${selectedSubmission.studentName}!`);
        setSelectedSubmission(null);
        // Refresh submissions
        const refresh = await api.get(`/faculty/projects/${selectedProject.id}/submissions`);
        if (refresh.success && refresh.data) {
          setCurrentSubmissions(Array.isArray(refresh.data) ? refresh.data : (refresh.data.content || []));
        }
        fetchProjects();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit grade');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Projects & Assignment Deadlines</h1>
          <p className="page-subtitle">
            {isStudent
              ? 'View course assignments, track submission deadlines, and upload your academic deliverables'
              : 'Create course projects, target student academic groups, manage deadlines, and evaluate submissions'}
          </p>
        </div>

        {(isFaculty || isAdmin) && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Create New Project
          </button>
        )}
      </div>

      {toast && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{toast}</span>
        </div>
      )}

      {/* Faculty Group Filters */}
      {(isFaculty || isAdmin) && (
        <div className="card" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#142D4E', fontWeight: 600, fontSize: '0.9rem' }}>
            <Filter size={18} color="#2563EB" /> Filter by Target Group:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>Academic Year:</label>
            <select
              className="form-select"
              style={{ width: '150px', padding: '6px 10px', fontSize: '0.85rem' }}
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>Semester:</label>
            <select
              className="form-select"
              style={{ width: '120px', padding: '6px 10px', fontSize: '0.85rem' }}
              value={filterSem}
              onChange={(e) => setFilterSem(e.target.value)}
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>Section:</label>
            <select
              className="form-select"
              style={{ width: '120px', padding: '6px 10px', fontSize: '0.85rem' }}
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {(filterYear !== 'All' || filterSem !== 'All' || filterSection !== 'All') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilterYear('All');
                setFilterSem('All');
                setFilterSection('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#2563EB', fontWeight: 600 }}>
          Loading course projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <FolderGit2 size={48} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#142D4E', fontWeight: 700 }}>No projects found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            {isStudent ? 'No academic projects have been posted for your assigned academic group yet.' : 'Click "Create New Project" to assign an assignment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {projects.map((p) => {
            const isDueSoon = p.daysRemaining <= 2 && !p.isOverdue;
            const targetGroupDisplay = `${p.academicYear || 'All Years'} • Sem ${p.semester || 'All'} • Sec ${p.section || 'All'}`;

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isDueSoon ? '4px solid #D97706' : p.isOverdue ? '4px solid #DC2626' : '4px solid #2563EB',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>
                      {p.course} • {p.department}
                    </span>
                    <Badge status={p.status} />
                  </div>

                  {/* Academic Group Target Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '10px' }}>
                    <GraduationCap size={14} /> Target: {targetGroupDisplay}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E', lineHeight: 1.3, marginBottom: '6px' }}>
                    {p.title}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '12px' }}>
                    Instructor: <strong>Prof. {p.facultyName}</strong>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                    {p.description}
                  </p>

                  {p.submissionFormat && (
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>
                      <strong>Format:</strong> {p.submissionFormat}
                    </div>
                  )}

                  {p.instructions && (
                    <div style={{ fontSize: '0.8rem', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', color: '#334155', marginBottom: '12px' }}>
                      <strong>Guidelines:</strong> {p.instructions}
                    </div>
                  )}

                  {p.attachmentUrl && (
                    <div style={{ marginBottom: '12px' }}>
                      <a
                        href={p.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <LinkIcon size={14} /> Course Material / Reference Link
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                      <Calendar size={15} /> Due: <strong>{p.dueDate}</strong>
                    </div>

                    <div>
                      {p.isOverdue ? (
                        <span className="badge badge-danger">Past Deadline</span>
                      ) : (
                        <span className={`badge ${isDueSoon ? 'badge-warning' : 'badge-info'}`}>
                          {p.daysRemaining === 0 ? 'Due Today' : `${p.daysRemaining} days remaining`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student View Actions */}
                  {isStudent && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {p.studentSubmitted ? (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${p.studentSubmissionStatus === 'REVIEWED' ? 'badge-success' : p.studentSubmissionStatus === 'LATE' ? 'badge-warning' : 'badge-info'}`}>
                            ✓ {p.studentSubmissionStatus === 'REVIEWED' ? 'Graded & Reviewed' : p.studentSubmissionStatus === 'LATE' ? 'Submitted Late' : 'Submitted'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedProject(p);
                              setIsSubmitModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Update Submission
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedProject(p);
                            setIsSubmitModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                        >
                          <Send size={14} /> Submit Assignment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Faculty View Actions */}
                  {(isFaculty || isAdmin) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        <div><strong>{p.totalSubmissions || 0}</strong> of <strong>{p.assignedStudentCount || 0}</strong> submitted</div>
                        <div style={{ color: '#0F9D8A' }}>{p.reviewedSubmissions || 0} graded</div>
                      </div>
                      <button
                        onClick={() => handleOpenReviews(p)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FileCheck2 size={14} /> Review ({p.totalSubmissions || 0})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Faculty Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Academic Project / Assignment"
        maxWidth="650px"
      >
        {modalError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Key-Value Store Implementation"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Target Department</label>
              <input
                type="text"
                className="form-input"
                value={projectForm.department}
                onChange={(e) => setProjectForm({ ...projectForm, department: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Degree / Course</label>
              <input
                type="text"
                className="form-input"
                value={projectForm.course}
                onChange={(e) => setProjectForm({ ...projectForm, course: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Academic Group Targeting */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={projectForm.academicYear}
                onChange={(e) => setProjectForm({ ...projectForm, academicYear: e.target.value })}
                required
              >
                <option value="All">All Years</option>
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
                value={projectForm.semester}
                onChange={(e) => setProjectForm({ ...projectForm, semester: e.target.value })}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={projectForm.section}
                onChange={(e) => setProjectForm({ ...projectForm, section: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={projectForm.startDate}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Submission Due Date</label>
              <input
                type="date"
                className="form-input"
                value={projectForm.dueDate}
                onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Submission Format</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. GitHub Repository URL / PDF Report / ZIP Archive"
              value={projectForm.submissionFormat}
              onChange={(e) => setProjectForm({ ...projectForm, submissionFormat: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Instructions & Description</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Overview of project requirements and milestones..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Grading Criteria & Detailed Guidelines</label>
            <textarea
              rows="2"
              className="form-textarea"
              placeholder="Evaluation rubrics, code style requirements, bonus points..."
              value={projectForm.instructions}
              onChange={(e) => setProjectForm({ ...projectForm, instructions: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attachment / Reference URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/project_spec.pdf"
              value={projectForm.attachmentUrl}
              onChange={(e) => setProjectForm({ ...projectForm, attachmentUrl: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Submit Work Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit Work: ${selectedProject?.title}`}
      >
        {modalError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmitWork}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
            <div>Due Date: <strong>{selectedProject?.dueDate}</strong></div>
            <div style={{ color: '#64748B', marginTop: '4px' }}>{selectedProject?.description}</div>
            {selectedProject?.submissionFormat && (
              <div style={{ color: '#2563EB', marginTop: '4px', fontWeight: 600 }}>
                Format Required: {selectedProject.submissionFormat}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Submission Summary / Notes / Repository Link</label>
            <textarea
              rows="4"
              className="form-textarea"
              placeholder="Enter your implementation summary, GitHub repo URL, or documentation links here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deliverable File Name / Archive Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. project_report_final.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Upload & Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Faculty Submissions Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Student Submissions: ${selectedProject?.title}`}
        maxWidth="800px"
      >
        {currentSubmissions.length === 0 ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
            No students have submitted deliverables for this project yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentSubmissions.map((s) => (
              <div
                key={s.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#142D4E' }}>{s.studentName}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '8px' }}>
                      ({s.studentRegistrationNumber})
                    </span>
                  </div>
                  <Badge status={s.status} />
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '10px' }}>
                  Submitted on: {new Date(s.submissionDate).toLocaleString()} • File: <code>{s.fileName}</code>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#334155', marginBottom: '12px' }}>
                  {s.submissionText}
                </div>

                {s.grade && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', backgroundColor: '#EFF6FF', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#2563EB' }}>Awarded Grade: {s.grade}</span>
                    <span style={{ fontSize: '0.82rem', color: '#475569' }}>Feedback: {s.feedback}</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedSubmission(s);
                    setGrade(s.grade || 'A');
                    setFeedback(s.feedback || '');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <Award size={14} /> {s.grade ? 'Update Grade & Feedback' : 'Grade Deliverable'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grade sub-form */}
        {selectedSubmission && (
          <div style={{ marginTop: '20px', borderTop: '2px solid #E2E8F0', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142D4E', marginBottom: '12px' }}>
              Evaluate {selectedSubmission.studentName} ({selectedSubmission.studentRegistrationNumber})
            </h4>

            <form onSubmit={handleGradeSubmission}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select
                    className="form-select"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Instructor Feedback</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Constructive feedback or commendations..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal btn-sm">
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
