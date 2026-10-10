import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const res = await api.get('/admin/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ color: '#2563EB', fontWeight: 600 }}>Loading live SQL analytics...</div>
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

  const COLORS = ['#2563EB', '#0F9D8A', '#D97706', '#8B5CF6', '#EC4899', '#3B82F6'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Administration Dashboard</h1>
          <p className="page-subtitle">
            Live catalog statistics, circulation overview, and academic deadlines
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/issue-return')}
            className="btn btn-primary"
          >
            Issue / Return Book
          </button>
          <button
            onClick={() => navigate('/books')}
            className="btn btn-secondary"
          >
            Browse Catalogue
          </button>
        </div>
      </div>

      {/* Row 1: Key Circulation Metrics */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Book Titles"
          value={data.totalTitles}
          icon={BookOpen}
          color="navy"
          subtitle="Distinct catalogue entries"
          to="/books"
        />
        <StatCard
          title="Physical Copies"
          value={`${data.availableCopies} / ${data.totalCopies}`}
          icon={Copy}
          color="blue"
          subtitle="Available / Total copies"
          to="/books"
        />
        <StatCard
          title="Currently Borrowed"
          value={data.currentlyBorrowed}
          icon={Clock}
          color="amber"
          subtitle="Active circulation loans"
          to="/borrow-history"
        />
        <StatCard
          title="Overdue Books"
          value={data.overdueBooks}
          icon={AlertTriangle}
          color="rose"
          subtitle="Past agreed return deadline"
          to="/overdue"
        />
      </div>

      {/* Row 2: Patron & Financial Metrics */}
      <div className="grid-cols-4">
        <StatCard
          title="Active Students"
          value={data.activeStudents}
          icon={GraduationCap}
          color="teal"
          subtitle="Registered student patrons"
          to="/students"
        />
        <StatCard
          title="Active Faculty"
          value={data.activeFaculty}
          icon={Users}
          color="navy"
          subtitle="Faculty members & instructors"
          to="/faculty"
        />
        <StatCard
          title="Outstanding Fines"
          value={`₹${Number(data.outstandingFines).toFixed(2)}`}
          icon={IndianRupee}
          color="rose"
          subtitle="Uncollected overdue fines"
          to="/fines"
        />
        <StatCard
          title="Fines Collected"
          value={`₹${Number(data.finesCollected).toFixed(2)}`}
          icon={CheckCircle2}
          color="teal"
          subtitle="Settled circulation desk receipts"
          to="/fines"
        />
      </div>

      {/* Charts Section */}
      <div className="grid-cols-2">
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
              <BarChart data={data.monthlyBorrowingTrends}>
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
                  {data.categoryDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Upcoming Return Deadlines & Recent Issue Activity */}
      <div className="grid-cols-2">
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
                {data.upcomingReturnDeadlines?.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                      No immediate returns due in the next 7 days.
                    </td>
                  </tr>
                ) : (
                  data.upcomingReturnDeadlines?.map((t) => (
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

        {/* Recent Circulation Transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E' }}>
              Recent Issue & Return Activity
            </h3>
            <button onClick={() => navigate('/borrow-history')} className="btn btn-secondary btn-sm">
              History
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
                {data.recentTransactions?.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.bookTitle}</td>
                    <td>{t.userName}</td>
                    <td>{t.issueDate}</td>
                    <td>
                      <Badge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
