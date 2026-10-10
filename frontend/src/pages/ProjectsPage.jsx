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
} from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'ROLE_FACULTY';
  const isStudent = user?.role === 'ROLE_STUDENT';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Project Modal (Faculty/Admin)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    department: user?.department || 'Computer Science & Engineering',
    course: 'B.Tech CSE',
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
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let endpoint = '/student/projects?page=0&size=50';
      if (isFaculty) {
        endpoint = '/faculty/projects?page=0&size=50';
      } else if (isAdmin) {
        endpoint = '/faculty/projects?page=0&size=50';
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
      const res = await api.post('/faculty/projects', projectForm);
      if (res.success) {
        setIsCreateModalOpen(false);
        setToast('Academic project created successfully!');
        setProjectForm({
          title: '',
          description: '',
          department: user?.department || 'Computer Science & Engineering',
          course: 'B.Tech CSE',
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
        setCurrentSubmissions(res.data.content || []);
        setIsReviewModalOpen(true);
      }
    } catch (err) {
      alert(err.message);
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
          setCurrentSubmissions(refresh.data.content || []);
        }
        fetchProjects();
      }
    } catch (err) {
      alert(err.message);
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
              : 'Create course projects, manage submission deadlines, and review student deliverables'}
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#2563EB', fontWeight: 600 }}>
          Loading course projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <FolderGit2 size={48} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#142D4E', fontWeight: 700 }}>No projects found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            {isStudent ? 'No academic projects have been posted for your course yet.' : 'Click "Create New Project" to assign an assignment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {projects.map((p) => {
            const isDueSoon = p.daysRemaining <= 2 && !p.isOverdue;
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

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E', lineHeight: 1.3, marginBottom: '6px' }}>
                    {p.title}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '12px' }}>
                    Instructor: <strong>Prof. {p.facultyName}</strong>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                    {p.description}
                  </p>
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

                  {/* Role Specific Actions */}
                  {isStudent && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {p.studentSubmitted ? (
                        <span className="badge badge-success">
                          ✓ Submitted ({p.studentSubmissionStatus})
                        </span>
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

                  {(isFaculty || isAdmin) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {p.totalSubmissions} submitted ({p.reviewedSubmissions} graded)
                      </span>
                      <button
                        onClick={() => handleOpenReviews(p)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FileCheck2 size={14} /> Review Work
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
            <label className="form-label">Instructions & Deliverables</label>
            <textarea
              rows="4"
              className="form-textarea"
              placeholder="Detailed guidelines, grading criteria, acceptable file formats..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              required
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
          </div>

          <div className="form-group">
            <label className="form-label">Submission Summary / Notes / Repository Link</label>
            <textarea
              rows="4"
              className="form-textarea"
              placeholder="Enter your implementation summary, GitHub repo URL, or answers here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deliverable File Name / Archive</label>
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
