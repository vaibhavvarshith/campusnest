import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  BookOpen,
  Copy,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  GraduationCap,
  Users,
  IndianRupee,
  Calendar,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FolderGit2,
  ArrowRightLeft,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboard() {
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
      setError(err.message || 'Failed to load dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto' }} />
        </div>
        <div style={{ color: '#142D4E', fontSize: '1.1rem', fontWeight: 700 }}>
          Loading CampusNest Analytics...
        </div>
        <div style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '6px' }}>
          Retrieving live catalog metrics, circulation statistics, and academic deadlines
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div
          className="card"
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
              Dashboard Synchronization Error
            </div>
            <div style={{ fontSize: '0.88rem' }}>{error}</div>
          </div>
          <button
            onClick={fetchDashboard}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#2563EB', '#0F9D8A', '#D97706', '#8B5CF6', '#EC4899', '#3B82F6'];

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <ShieldCheck size={14} /> System Administrator Portal
          </div>
          <h1 className="page-title">
            Welcome back, {user?.fullName || 'System Administrator'}
          </h1>
          <p className="page-subtitle">
            Live catalog statistics, circulation loan overview, fine recovery, and academic project deadlines
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/issue-return')} className="btn btn-primary">
            <ArrowRightLeft size={16} /> Issue / Return Book
          </button>
          <button onClick={() => navigate('/borrow-requests')} className="btn btn-secondary">
            Borrow Requests ({data?.pendingBorrowRequests ?? 0})
          </button>
        </div>
      </div>

      {/* Row 1: Key Circulation & Inventory Metrics */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Book Titles"
          value={data?.totalTitles ?? 0}
          icon={BookOpen}
          color="navy"
          subtitle="Distinct catalogue titles"
          to="/books"
        />
        <StatCard
          title="Physical Copies"
          value={`${data?.availableCopies ?? 0} / ${data?.totalCopies ?? 0}`}
          icon={Copy}
          color="blue"
          subtitle="Available / Total copies"
          to="/books"
        />
        <StatCard
          title="Currently Borrowed"
          value={data?.currentlyBorrowed ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Active circulation loans"
          to="/borrow-history"
        />
        <StatCard
          title="Returned Books"
          value={data?.booksReturned ?? 0}
          icon={RotateCcw}
          color="teal"
          subtitle="Successfully returned loans"
          to="/borrow-history"
        />
      </div>

      {/* Row 2: Overdue, Requests, Patrons & Financials */}
      <div className="grid-cols-4" style={{ marginTop: '20px' }}>
        <StatCard
          title="Overdue Books"
          value={data?.overdueBooks ?? 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Past agreed return date"
          to="/overdue"
        />
        <StatCard
          title="Pending Borrow Requests"
          value={data?.pendingBorrowRequests ?? 0}
          icon={ArrowRightLeft}
          color="amber"
          subtitle="Awaiting desk approval"
          to="/borrow-requests"
        />
        <StatCard
          title="Active Students"
          value={data?.activeStudents ?? 0}
          icon={GraduationCap}
          color="blue"
          subtitle="Registered student patrons"
          to="/students"
        />
        <StatCard
          title="Active Faculty"
          value={data?.activeFaculty ?? 0}
          icon={Users}
          color="navy"
          subtitle="Faculty members & staff"
          to="/faculty"
        />
      </div>

      {/* Row 3: Financial Overview */}
      <div className="grid-cols-2" style={{ marginTop: '20px' }}>
        <StatCard
          title="Outstanding Fines"
          value={`₹${Number(data?.outstandingFines || 0).toFixed(2)}`}
          icon={IndianRupee}
          color="rose"
          subtitle="Uncollected overdue fines"
          to="/fines"
        />
        <StatCard
          title="Fines Collected"
          value={`₹${Number(data?.finesCollected || 0).toFixed(2)}`}
          icon={CheckCircle2}
          color="teal"
          subtitle="Settled circulation receipts"
          to="/fines"
        />
      </div>

      {/* Charts Section */}
      <div className="grid-cols-2" style={{ marginTop: '20px' }}>
        {/* Monthly Borrowing vs Returning */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Circulation Activity: Borrowed vs Returned
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Past 5 Months</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data?.monthlyBorrowingTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="borrowed" fill="#2563EB" name="Books Borrowed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" fill="#0F9D8A" name="Books Returned" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Borrowing by Academic Category
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Category Loans</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            {(!data?.categoryDistribution || data.categoryDistribution.length === 0) ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                No category circulation data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Upcoming Deadlines & Recent Issue Activity */}
      <div className="grid-cols-2" style={{ marginTop: '20px' }}>
        {/* Upcoming Return Deadlines */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Upcoming Return Deadlines (Next 7 Days)
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
                  <th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {!data?.upcomingReturnDeadlines || data.upcomingReturnDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                      No immediate returns due in the next 7 days.
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
                          {t.daysRemaining === 0 ? 'Due Today' : `${t.daysRemaining} days`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Academic Project Deadlines */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Upcoming Project Deadlines
            </h3>
            <button onClick={() => navigate('/projects')} className="btn btn-secondary btn-sm">
              All Projects
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project / Assignment</th>
                  <th>Department</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!data?.upcomingProjectDeadlines || data.upcomingProjectDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                      No upcoming project deadlines.
                    </td>
                  </tr>
                ) : (
                  data.upcomingProjectDeadlines.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td>{p.department || 'All Departments'}</td>
                      <td>{p.dueDate}</td>
                      <td>
                        <span className={`badge ${p.daysRemaining <= 3 ? 'badge-warning' : 'badge-info'}`}>
                          {p.daysRemaining === 0 ? 'Due Today' : `${p.daysRemaining} days left`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 6: Recent Activity */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
            Recent Issue & Return Activity
          </h3>
          <button onClick={() => navigate('/borrow-history')} className="btn btn-secondary btn-sm">
            View History
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Patron</th>
                <th>Identifier</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!data?.recentTransactions || data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                    No recent circulation transactions.
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.bookTitle}</td>
                    <td>{t.userName}</td>
                    <td>
                      <span className="badge badge-info">{t.userIdentifier || t.userRole}</span>
                    </td>
                    <td>{t.issueDate}</td>
                    <td>{t.dueDate || 'N/A'}</td>
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
  );
}
