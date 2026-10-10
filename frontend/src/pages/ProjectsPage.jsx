import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import PdfUploader from '../components/PdfUploader';
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
  Download,
  Trophy,
  ExternalLink,
} from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'ROLE_FACULTY';
  const isStudent = user?.role === 'ROLE_STUDENT';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isSubjectHead = Boolean(user?.isSubjectHead);

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
    submissionFormat: 'PDF Report / Deliverable',
    instructions: '',
    attachmentUrl: '',
    pdfUrl: '',
    pdfFileName: '',
    pdfFileSize: 0,
    maxScore: 100,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  // Submit Modal (Student)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [studentPdfData, setStudentPdfData] = useState(null);

  // Submissions Review Modal (Faculty)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentSubmissions, setCurrentSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState(85);
  const [grade, setGrade] = useState('A');
  const [feedback, setFeedback] = useState('');
  const [rubricQuality, setRubricQuality] = useState(25);
  const [rubricDoc, setRubricDoc] = useState(25);
  const [rubricExecution, setRubricExecution] = useState(25);
  const [rubricPresentation, setRubricPresentation] = useState(10);
  const [isDraft, setIsDraft] = useState(false);

  // Student's personal submission details
  const [mySubmissionsMap, setMySubmissionsMap] = useState({});

  const [toast, setToast] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (isStudent) {
      fetchMySubmissions();
    }
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
      if (res.data?.success && res.data?.data) {
        setProjects(res.data.data.content || []);
      } else if (res.success && res.data) {
        setProjects(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/student/projects/my-submissions');
      const list = res.data?.data || res.data || [];
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((sub) => {
          map[sub.projectId] = sub;
        });
      }
      setMySubmissionsMap(map);
    } catch (err) {
      console.error('Failed to fetch personal submissions:', err);
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
        maxScore: projectForm.maxScore ? parseInt(projectForm.maxScore, 10) : 100,
      };
      const res = await api.post('/faculty/projects', payload);
      if (res.data?.success || res.success) {
        setIsCreateModalOpen(false);
        setToast('Academic project created and published successfully!');
        setProjectForm({
          title: '',
          description: '',
          department: user?.department || 'Computer Science & Engineering',
          course: 'B.Tech CSE',
          academicYear: 'Third Year',
          semester: 6,
          section: 'A',
          submissionFormat: 'PDF Report / Deliverable',
          instructions: '',
          attachmentUrl: '',
          pdfUrl: '',
          pdfFileName: '',
          pdfFileSize: 0,
          maxScore: 100,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: '',
        });
        fetchProjects();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to create project');
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
        fileName: studentPdfData?.originalFileName || studentPdfData?.fileName || 'submission.pdf',
        fileSize: studentPdfData?.fileSize || 1024,
        fileUrl: studentPdfData?.downloadUrl || '',
        pdfFilePath: studentPdfData?.downloadUrl || '',
      };

      const res = await api.post('/student/projects/submit', payload);
      if (res.data?.success || res.success) {
        setIsSubmitModalOpen(false);
        setToast(`Deliverable for '${selectedProject.title}' uploaded and confirmed!`);
        setSubmissionText('');
        setStudentPdfData(null);
        fetchProjects();
        fetchMySubmissions();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReviews = async (project) => {
    setSelectedProject(project);
    try {
      const res = await api.get(`/faculty/projects/${project.id}/submissions`);
      const list = res.data?.data || res.data || [];
      setCurrentSubmissions(Array.isArray(list) ? list : (list.content || []));
      setIsReviewModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to fetch submissions');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      const rubricStr = JSON.stringify({
        codeQuality: rubricQuality,
        documentation: rubricDoc,
        execution: rubricExecution,
        presentation: rubricPresentation,
      });

      const res = await api.post(`/faculty/projects/submissions/${selectedSubmission.id}/grade`, {
        grade: grade,
        score: parseFloat(score),
        feedback: feedback,
        rubricMarks: rubricStr,
        isDraft: isDraft,
      });

      if (res.data?.success || res.success) {
        setToast(`Evaluation saved & class ranks recalculated! Rank #${res.data?.data?.rankPosition || selectedSubmission.rankPosition || 1} assigned.`);
        setSelectedSubmission(null);
        // Refresh submissions
        const refresh = await api.get(`/faculty/projects/${selectedProject.id}/submissions`);
        const list = refresh.data?.data || refresh.data || [];
        setCurrentSubmissions(Array.isArray(list) ? list : (list.content || []));
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit grade');
    }
  };

  const getRankBadge = (rank) => {
    if (!rank) return null;
    if (rank === 1) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
          <Trophy size={12} color="#D97706" /> Rank #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
          <Award size={12} color="#64748B" /> Rank #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#FFEDD5', color: '#C2410C', border: '1px solid #FDBA74', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
          <Award size={12} color="#EA580C" /> Rank #3
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
        Rank #{rank}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Projects, Assignments & Evaluations</h1>
          <p className="page-subtitle">
            {isStudent
              ? 'View course assignments, download question paper PDFs, track deadlines, and submit deliverables directly from your device.'
              : 'Create course projects, manage Subject Head allocations, upload instruction PDFs, and grade student submissions with automated competition ranking.'}
          </p>
        </div>

        {(isFaculty || isAdmin) && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Create New Assignment
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
            <Filter size={18} color="#2563EB" /> Filter by Target Academic Group:
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
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.85rem' }}
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
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.85rem' }}
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
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
          Loading course projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <FolderGit2 size={48} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#142D4E', fontWeight: 700 }}>No projects found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            {isStudent ? 'No academic projects have been posted for your assigned academic group yet.' : 'Click "Create New Assignment" to post an assignment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {projects.map((p) => {
            const isDueSoon = p.daysRemaining <= 2 && !p.isOverdue;
            const targetGroupDisplay = `${p.academicYear || 'All Years'} • Sem ${p.semester || 'All'} • Sec ${p.section || 'All'}`;
            const mySubmission = mySubmissionsMap[p.id];

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
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>
                        {p.subjectName || p.course} &bull; {p.department}
                      </span>
                      {p.priority && (
                        <span style={{ marginLeft: '8px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '10px' }}>
                          Priority: {p.priority} #{p.priorityRank || 1}
                        </span>
                      )}
                    </div>
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
                    Instructor: <strong>Prof. {p.facultyName || 'Department Faculty'}</strong>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                    {p.description}
                  </p>

                  {/* Official Question Paper / Instruction PDF Download */}
                  {p.pdfUrl && (
                    <div style={{ marginBottom: '12px' }}>
                      <a
                        href={p.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#DC2626',
                          borderColor: '#FECACA',
                          backgroundColor: '#FEF2F2',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        <FileText size={14} /> Download Instructions (PDF)
                      </a>
                    </div>
                  )}

                  {/* Student's Personal Evaluation Result (Private) */}
                  {isStudent && mySubmission && mySubmission.score !== null && mySubmission.score !== undefined && (
                    <div
                      style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#15803D' }}>
                          Evaluated: {mySubmission.score} / {mySubmission.maxScore || 100} pts ({mySubmission.grade})
                        </div>
                        {getRankBadge(mySubmission.rankPosition)}
                      </div>
                      {mySubmission.feedback && (
                        <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '4px' }}>
                          <strong>Faculty Feedback:</strong> {mySubmission.feedback}
                        </div>
                      )}
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
                      {p.studentSubmitted || mySubmission ? (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${mySubmission?.score !== null && mySubmission?.score !== undefined ? 'badge-success' : 'badge-info'}`}>
                            ✓ {mySubmission?.score !== null && mySubmission?.score !== undefined ? 'Graded & Evaluated' : 'Deliverable Submitted'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedProject(p);
                              setIsSubmitModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Update Deliverable
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
                          <Send size={14} /> Submit Deliverable (PDF)
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
                        <FileCheck2 size={14} /> Review & Rank ({p.totalSubmissions || 0})
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
        title="Create New Academic Assignment"
        maxWidth="750px"
      >
        {modalError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project / Assignment Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Database Architecture Design"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={projectForm.startDate}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Submission Due Date</label>
              <input
                type="date"
                className="form-input"
                value={projectForm.dueDate}
                onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Maximum Score</label>
              <input
                type="number"
                min="10"
                max="500"
                className="form-input"
                value={projectForm.maxScore}
                onChange={(e) => setProjectForm({ ...projectForm, maxScore: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Project Description & Guidelines</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Overview of project requirements and deliverables..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              required
            />
          </div>

          {/* Genuine PDF Upload Component for Faculty */}
          <PdfUploader
            fileCategory="PROJECT_INSTRUCTION"
            label="Upload Instruction Paper / Question Specification PDF"
            helperText="Upload official problem statement PDF (Max 10 MB)"
            onUploadSuccess={(fileData) => {
              setProjectForm((prev) => ({
                ...prev,
                pdfUrl: fileData.downloadUrl,
                pdfFileName: fileData.originalFileName,
                pdfFileSize: fileData.fileSize,
              }));
            }}
            onRemove={() => {
              setProjectForm((prev) => ({
                ...prev,
                pdfUrl: '',
                pdfFileName: '',
                pdfFileSize: 0,
              }));
            }}
          />

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
        title={`Submit Deliverable: ${selectedProject?.title}`}
        maxWidth="650px"
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
            {selectedProject?.pdfUrl && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href={selectedProject.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <FileText size={14} /> Review Instruction PDF
                </a>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Submission Summary / Notes / Repository Link</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Implementation overview, GitHub repository URL, architecture summary..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              required
            />
          </div>

          {/* Genuine Student PDF Upload Component */}
          <PdfUploader
            fileCategory="STUDENT_SUBMISSION"
            entityId={selectedProject?.id}
            label="Upload Deliverable Document (PDF from Device)"
            helperText="Select your compiled PDF project report / assignment paper (Max 10 MB)"
            onUploadSuccess={(fileData) => {
              setStudentPdfData(fileData);
            }}
            onRemove={() => {
              setStudentPdfData(null);
            }}
          />

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
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Faculty Submissions Review & Ranking Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Student Submissions & Class Ranking: ${selectedProject?.title}`}
        maxWidth="900px"
      >
        {currentSubmissions.length === 0 ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
            No students have submitted deliverables for this project yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '0.86rem' }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Reg No</th>
                    <th>Submitted PDF</th>
                    <th>Score / Max</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubmissions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {getRankBadge(s.rankPosition) || <span style={{ color: '#94A3B8' }}>-</span>}
                      </td>
                      <td style={{ fontWeight: 600, color: '#142D4E' }}>{s.studentName}</td>
                      <td style={{ color: '#64748B' }}>{s.studentRegistrationNumber}</td>
                      <td>
                        {s.fileUrl || s.pdfFilePath ? (
                          <a
                            href={s.fileUrl || s.pdfFilePath}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                          >
                            <Download size={14} /> {s.fileName || 'Download PDF'}
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>No PDF attached</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: '#1E293B' }}>
                        {s.score !== null && s.score !== undefined ? `${s.score} / ${s.maxScore || 100}` : '-'}
                      </td>
                      <td>
                        {s.grade ? (
                          <span style={{ fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>
                            {s.grade}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Ungraded</span>
                        )}
                      </td>
                      <td>
                        <Badge status={s.status} />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedSubmission(s);
                            setScore(s.score !== null && s.score !== undefined ? s.score : 85);
                            setGrade(s.grade || 'A');
                            setFeedback(s.feedback || '');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          Evaluate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evaluation Sub-Form */}
        {selectedSubmission && (
          <div style={{ marginTop: '24px', borderTop: '2px solid #E2E8F0', paddingTop: '20px', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#2563EB" />
              Evaluate & Rank: {selectedSubmission.studentName} ({selectedSubmission.studentRegistrationNumber})
            </h4>

            {selectedSubmission.submissionText && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.84rem' }}>
                <strong>Student Submission Notes:</strong>
                <p style={{ marginTop: '4px', color: '#475569', marginBottom: 0 }}>{selectedSubmission.submissionText}</p>
              </div>
            )}

            <form onSubmit={handleGradeSubmission}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Numeric Score (0 - {selectedProject?.maxScore || 100})</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedProject?.maxScore || 100}
                    step="0.5"
                    className="form-input"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Letter Grade</label>
                  <select
                    className="form-select"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Satisfactory)</option>
                    <option value="D">D (Marginal)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Evaluation Mode</label>
                  <select
                    className="form-select"
                    value={isDraft ? 'draft' : 'publish'}
                    onChange={(e) => setIsDraft(e.target.value === 'draft')}
                  >
                    <option value="publish">Published to Student</option>
                    <option value="draft">Draft (Private to Faculty)</option>
                  </select>
                </div>
              </div>

              {/* Rubric Criteria Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Code Quality (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    className="form-input"
                    value={rubricQuality}
                    onChange={(e) => setRubricQuality(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Documentation (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    className="form-input"
                    value={rubricDoc}
                    onChange={(e) => setRubricDoc(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Execution (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    className="form-input"
                    value={rubricExecution}
                    onChange={(e) => setRubricExecution(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Presentation (/10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="form-input"
                    value={rubricPresentation}
                    onChange={(e) => setRubricPresentation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Qualitative Instructor Feedback</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Provide constructive assessment comments and improvement areas..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Evaluation & Recalculate Class Ranks
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
