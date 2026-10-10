import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import { Search, History, ChevronLeft, ChevronRight, Inbox, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function BorrowHistory() {
  const { user } = useAuth();
  const isAdminOrLibrarian = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_LIBRARIAN';

  const [activeTab, setActiveTab] = useState('loans'); // 'loans' | 'requests'
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (activeTab === 'loans') {
      fetchHistory();
    } else {
      fetchMyRequests();
    }
  }, [page, statusFilter, activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = isAdminOrLibrarian
        ? `/borrow/transactions?page=${page}&size=12`
        : `/borrow/my-books?page=${page}&size=12`;

      if (statusFilter) url += `&status=${statusFilter}`;
      if (search && isAdminOrLibrarian) url += `&query=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.success && res.data) {
        setTransactions(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/borrow-requests/my?page=${page}&size=12`);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
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
    if (activeTab === 'loans') fetchHistory();
    else fetchMyRequests();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAdminOrLibrarian ? 'Circulation History & Audit Log' : 'My Library Borrowings & Requests'}
          </h1>
          <p className="page-subtitle">
            {isAdminOrLibrarian
              ? 'Complete historical record of all book issuances, returns, and overdue states across campus'
              : 'Track your borrowed books, upcoming due dates, and borrow request statuses'}
          </p>
        </div>
      </div>

      {/* Tabs for Patrons */}
      {!isAdminOrLibrarian && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => {
              setActiveTab('loans');
              setPage(0);
            }}
            className={`btn ${activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <History size={16} /> Borrowed Books
          </button>
          <button
            onClick={() => {
              setActiveTab('requests');
              setPage(0);
            }}
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Clock size={16} /> My Borrow Requests
          </button>
        </div>
      )}

      {/* Filter and Search Bar for Loans */}
      {activeTab === 'loans' && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {isAdminOrLibrarian ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Search borrower name, ID, book title or ISBN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary">
                Search
              </button>
            </form>
          ) : <div />}

          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="ISSUED">Currently Issued</option>
            <option value="RETURNED">Returned</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      )}

      {/* Content Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          {activeTab === 'loans' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trans ID</th>
                  <th>Book Title</th>
                  <th>Borrower</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Fine Assessed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                      Loading circulation records...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      <Inbox size={36} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                      No borrowing records found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>#{t.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#142D4E' }}>{t.bookTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ISBN: {t.isbn}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563EB' }}>{t.userIdentifier}</div>
                      </td>
                      <td>{t.issueDate}</td>
                      <td style={{ fontWeight: 600, color: t.status === 'OVERDUE' ? '#DC2626' : 'inherit' }}>
                        {t.dueDate}
                      </td>
                      <td>{t.returnDate || '—'}</td>
                      <td>
                        <Badge variant={t.status.toLowerCase()}>{t.status}</Badge>
                      </td>
                      <td style={{ fontWeight: 600, color: t.fineAmount > 0 ? '#DC2626' : '#0F9D8A' }}>
                        ₹{parseFloat(t.fineAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Book Title</th>
                  <th>Requested Date</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th>Admin Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                      Loading your borrow requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      <Inbox size={36} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                      You have not submitted any borrow requests yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>#{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#142D4E' }}>{r.bookTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>by {r.bookAuthor}</div>
                      </td>
                      <td>{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge ${r.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {r.availableCopies} available
                        </span>
                      </td>
                      <td>
                        {r.status === 'PENDING' && <span className="badge badge-warning"><Clock size={12} style={{ marginRight: 4 }} /> Pending Approval</span>}
                        {r.status === 'APPROVED' && <span className="badge badge-success"><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Approved & Issued</span>}
                        {r.status === 'REJECTED' && <span className="badge badge-danger"><XCircle size={12} style={{ marginRight: 4 }} /> Rejected</span>}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748B' }}>{r.adminNotes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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
              Page {page + 1} of {totalPages}
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
    </div>
  );
}
