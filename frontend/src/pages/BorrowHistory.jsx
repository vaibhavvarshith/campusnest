import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import { Search, History, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BorrowHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = `/admin/borrow/transactions?page=${page}&size=12`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&query=${encodeURIComponent(search)}`;

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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchHistory();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Circulation History & Audit Log</h1>
          <p className="page-subtitle">
            Complete historical log of all library book loans, returns, and overdue states
          </p>
        </div>
      </div>

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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by patron name, ID, book title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All Statuses</option>
          <option value="ISSUED">Currently Issued</option>
          <option value="RETURNED">Completed Returns</option>
          <option value="OVERDUE">Overdue Loans</option>
        </select>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn #</th>
                <th>Book Details</th>
                <th>Patron</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine Assessed</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#2563EB' }}>
                    Loading transaction records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    No circulation transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: '#64748B' }}>#{t.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#142D4E' }}>{t.bookTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>ISBN: {t.bookIsbn}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.userName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {t.userIdentifier || t.userRole}
                      </div>
                    </td>
                    <td>{t.issueDate}</td>
                    <td>{t.dueDate}</td>
                    <td>{t.returnDate || '—'}</td>
                    <td><Badge status={t.status} /></td>
                    <td>
                      {t.fineAmount > 0 ? (
                        <span style={{ color: '#DC2626', fontWeight: 600 }}>
                          ₹{Number(t.fineAmount).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: '#0F9D8A' }}>₹0.00</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '200px' }}>
                      {t.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
              Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
