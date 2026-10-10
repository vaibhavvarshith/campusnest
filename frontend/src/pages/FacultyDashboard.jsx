import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  BookOpen,
  FolderGit2,
  FileCheck2,
  Clock,
  PlusCircle,
  Users,
} from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faculty/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load faculty dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ color: '#2563EB', fontWeight: 600 }}>Loading faculty portal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #142D4E 0%, #0F9D8A 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(20, 45, 78, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#A7F3D0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Faculty Portal • {data.employeeId}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
              {data.facultyName}
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '0.92rem', marginTop: '6px' }}>
              {data.designation} • Department of {data.department}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/projects')}
              className="btn btn-primary"
              style={{ backgroundColor: '#FFFFFF', color: '#142D4E', border: 'none', fontWeight: 700 }}
            >
              <PlusCircle size={18} /> Create Assignment
            </button>
            <button
              onClick={() => navigate('/books')}
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Library Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <StatCard
          title="Active Projects"
          value={data.totalProjectsCreated}
          icon={FolderGit2}
          color="navy"
          subtitle="Assignments created"
          to="/projects"
        />
        <StatCard
          title="Total Submissions"
          value={data.totalSubmissionsReceived}
          icon={FileCheck2}
          color="teal"
          subtitle="Received student submissions"
          to="/projects"
        />
        <StatCard
          title="Pending Evaluations"
          value={data.pendingSubmissionsCount}
          icon={Clock}
          color="amber"
          subtitle="Awaiting grade & feedback"
          to="/projects"
        />
        <StatCard
          title="Borrowed Books"
          value={data.currentlyBorrowedCount}
          icon={BookOpen}
          color="blue"
          subtitle="Research books on loan"
          to="/my-books"
        />
      </div>

      {/* Projects List & Upcoming Deadlines */}
      <div className="grid-cols-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
              My Created Assignments
            </h3>
            <Link to="/projects" style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
              Manage →
            </Link>
          </div>

          {data.myProjects?.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
              No projects created yet. Click "Create Assignment" to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.myProjects?.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    backgroundColor: '#FFFFFF',
                    borderLeft: '4px solid #2563EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#142D4E', fontSize: '0.95rem' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                      {p.course} • Due: {p.dueDate}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-info">
                      {p.totalSubmissions} Submissions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
              Faculty Borrowed Books
            </h3>
            <Link to="/my-books" style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
              Borrow History →
            </Link>
          </div>

          {data.currentlyBorrowed?.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
              You have no active book loans.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.currentlyBorrowed?.map((t) => (
                <div
                  key={t.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    backgroundColor: '#FFFFFF',
                    borderLeft: '4px solid #0F9D8A',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#142D4E', fontSize: '0.95rem' }}>
                      {t.bookTitle}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                      Due on <strong>{t.dueDate}</strong>
                    </div>
                  </div>
                  <span className="badge badge-success">
                    Active Loan
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
