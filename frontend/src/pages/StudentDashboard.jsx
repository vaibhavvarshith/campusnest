import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  FolderGit2,
  Receipt,
  ArrowRight,
  Bell,
  CheckCircle,
} from 'lucide-react';

export default function StudentDashboard() {
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
      const res = await api.get('/student/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ color: '#2563EB', fontWeight: 600 }}>Loading academic and borrowing profile...</div>
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
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #142D4E 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(20, 45, 78, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Student Portal • {data.registrationNumber}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>
              Welcome back, {data.studentName}!
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '0.92rem', marginTop: '6px' }}>
              {data.course} • {data.department} ({data.academicYear})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/books')}
              className="btn btn-primary"
              style={{ backgroundColor: '#2563EB', color: '#fff', border: 'none' }}
            >
              Browse Library
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              My Assignments
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <StatCard
          title="Currently Borrowed"
          value={data.currentlyBorrowedCount}
          icon={BookOpen}
          color="blue"
          subtitle="Books in your possession"
          to="/my-books"
        />
        <StatCard
          title="Books Returned"
          value={data.returnedBooksCount}
          icon={CheckCircle}
          color="teal"
          subtitle="Total books completed"
          to="/my-books"
        />
        <StatCard
          title="Overdue Books"
          value={data.overdueBooksCount}
          icon={AlertTriangle}
          color="rose"
          subtitle={data.overdueBooksCount > 0 ? `Est. Fine: ₹${Number(data.currentEstimatedFine).toFixed(2)}` : 'No overdue items'}
          to="/my-deadlines"
        />
        <StatCard
          title="Outstanding Fines"
          value={`₹${Number(data.outstandingFineBalance).toFixed(2)}`}
          icon={Receipt}
          color={data.outstandingFineBalance > 0 ? 'amber' : 'teal'}
          subtitle={data.outstandingFineBalance > 0 ? 'Payable at circulation counter' : 'All fines cleared'}
          to="/my-fines"
        />
      </div>

      {/* Two Column Section: Book Return Deadlines & Academic Projects */}
      <div className="grid-cols-2">
        {/* Book Return Deadlines */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
              Book Return Deadlines
            </h3>
            <Link to="/my-books" style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {data.currentlyBorrowed?.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
              You currently have no borrowed books.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.currentlyBorrowed?.map((t) => {
                const isOverdue = t.isOverdue;
                const isDueSoon = !isOverdue && t.daysRemaining <= 2;

                return (
                  <div
                    key={t.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      backgroundColor: isOverdue ? '#FFF5F5' : isDueSoon ? '#FFFBEB' : '#FFFFFF',
                      borderLeft: isOverdue
                        ? '4px solid #DC2626'
                        : isDueSoon
                        ? '4px solid #D97706'
                        : '4px solid #2563EB',
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
                        by {t.bookAuthor} • Due on <strong>{t.dueDate}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {isOverdue ? (
                        <div>
                          <span className="badge badge-danger">
                            Overdue {t.overdueDays}d
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600, marginTop: '4px' }}>
                            Est. Fine: ₹{Number(t.fineAmount).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className={`badge ${isDueSoon ? 'badge-warning' : 'badge-info'}`}>
                          {t.daysRemaining === 0 ? 'Due Today' : `${t.daysRemaining} days left`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Academic Project Deadlines */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
              Academic Projects & Assignments
            </h3>
            <Link to="/projects" style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
              Submit Work →
            </Link>
          </div>

          {data.upcomingProjects?.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94A3B8' }}>
              No active academic projects for your course right now.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.upcomingProjects?.map((p) => (
                <div
                  key={p.id}
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
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#142D4E', fontSize: '0.95rem' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                      Prof. {p.facultyName} • Due on <strong>{p.dueDate}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {p.studentSubmitted ? (
                      <span className="badge badge-success">
                        Submitted ({p.studentSubmissionStatus})
                      </span>
                    ) : (
                      <span className={`badge ${p.daysRemaining <= 2 ? 'badge-warning' : 'badge-info'}`}>
                        {p.daysRemaining === 0 ? 'Due Today' : `${p.daysRemaining} days left`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
