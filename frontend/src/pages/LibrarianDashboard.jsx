import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  BookOpen,
  Copy,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Receipt,
  CheckCircle2,
  Calendar,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load circulation dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ color: '#0F9D8A', fontWeight: 600 }}>Loading circulation desk overview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Circulation Desk & Library Operations</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.fullName || 'Chief Librarian'}</strong>. Monitor circulation flow, borrow approvals, and fine reconciliation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/issue-return')} className="btn btn-primary">
            <ArrowRightLeft size={16} /> Issue / Return Desk
          </button>
          <button onClick={() => navigate('/borrow-requests')} className="btn btn-secondary">
            Review Borrow Requests
          </button>
        </div>
      </div>

      {/* Circulation Metric Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Catalogue"
          value={data?.totalTitles ?? 0}
          icon={BookOpen}
          color="navy"
          subtitle="Registered book titles"
          to="/books"
        />
        <StatCard
          title="Copies Available"
          value={`${data?.availableCopies ?? 0} / ${data?.totalCopies ?? 0}`}
          icon={Copy}
          color="teal"
          subtitle="On-shelf physical copies"
          to="/books"
        />
        <StatCard
          title="Currently Borrowed"
          value={data?.currentlyBorrowed ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Active student/faculty loans"
          to="/borrow-history"
        />
        <StatCard
          title="Overdue Books"
          value={data?.overdueBooks ?? 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Books past return due date"
          to="/overdue"
        />
      </div>

      <div className="grid-cols-2" style={{ marginTop: '20px' }}>
        {/* Upcoming Return Deadlines */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Immediate Return Due Dates (Next 7 Days)
            </h3>
            <button onClick={() => navigate('/overdue')} className="btn btn-secondary btn-sm">
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Patron</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!data?.upcomingReturnDeadlines || data.upcomingReturnDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                      No book loans due within the next 7 days.
                    </td>
                  </tr>
                ) : (
                  data.upcomingReturnDeadlines.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.bookTitle}</td>
                      <td>{t.userName} ({t.userIdentifier || t.userRole})</td>
                      <td>{t.dueDate}</td>
                      <td>
                        <span className={`badge ${t.daysRemaining <= 2 ? 'badge-warning' : 'badge-info'}`}>
                          {t.daysRemaining === 0 ? 'Due Today' : `${t.daysRemaining} days left`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Circulation Transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Recent Circulation Desk Activity
            </h3>
            <button onClick={() => navigate('/borrow-history')} className="btn btn-secondary btn-sm">
              Full History
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Patron</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!data?.recentTransactions || data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                      No recent circulation transactions.
                    </td>
                  </tr>
                ) : (
                  data.recentTransactions.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.bookTitle}</td>
                      <td>{t.userName}</td>
                      <td>{t.issueDate}</td>
                      <td>
                        <Badge status={t.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
