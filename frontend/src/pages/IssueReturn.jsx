import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  ArrowRightLeft,
  BookOpen,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  IndianRupee,
} from 'lucide-react';

export default function IssueReturn() {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue' | 'return'

  // Issue Form State
  const [books, setBooks] = useState([]);
  const [patrons, setPatrons] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [issueNotes, setIssueNotes] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState('');
  const [issueError, setIssueError] = useState('');

  // Return Form State
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [selectedTransId, setSelectedTransId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnError, setReturnError] = useState('');

  useEffect(() => {
    fetchIssueDropdowns();
    fetchActiveTransactions();
  }, []);

  const fetchIssueDropdowns = async () => {
    try {
      const [booksRes, studentsRes, facultyRes] = await Promise.all([
        api.get('/books?page=0&size=100&availableOnly=true'),
        api.get('/admin/students?page=0&size=100'),
        api.get('/admin/faculty?page=0&size=100'),
      ]);

      if (booksRes.success && booksRes.data) {
        setBooks(booksRes.data.content || []);
      }

      let allPatrons = [];
      if (studentsRes.success && studentsRes.data) {
        allPatrons = allPatrons.concat(studentsRes.data.content.map(s => ({
          id: s.id,
          name: s.fullName,
          ident: s.registrationNumber,
          role: 'Student',
        })));
      }
      if (facultyRes.success && facultyRes.data) {
        allPatrons = allPatrons.concat(facultyRes.data.content.map(f => ({
          id: f.id,
          name: f.fullName,
          ident: f.employeeId,
          role: 'Faculty',
        })));
      }
      setPatrons(allPatrons);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveTransactions = async () => {
    try {
      const res = await api.get('/admin/borrow/transactions?status=ISSUED&page=0&size=100');
      if (res.success && res.data) {
        setActiveTransactions(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssueError('');
    setIssueSuccess('');
    setIssueLoading(true);

    try {
      const payload = {
        bookId: parseInt(selectedBookId),
        userId: parseInt(selectedUserId),
        issueDate: issueDate,
        dueDate: dueDate || undefined,
        notes: issueNotes,
      };

      const res = await api.post('/admin/borrow/issue', payload);
      if (res.success) {
        setIssueSuccess(`Book issued successfully! Due date: ${res.data.dueDate}`);
        setSelectedBookId('');
        setSelectedUserId('');
        setIssueNotes('');
        fetchIssueDropdowns();
        fetchActiveTransactions();
      }
    } catch (err) {
      setIssueError(err.message || 'Failed to issue book');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnError('');
    setReturnSuccess('');
    setReturnLoading(true);

    try {
      const payload = {
        returnDate: returnDate,
        notes: returnNotes,
      };

      const res = await api.post(`/admin/borrow/return/${selectedTransId}`, payload);
      if (res.success) {
        const t = res.data;
        let msg = `Book '${t.bookTitle}' marked RETURNED.`;
        if (t.overdueDays > 0) {
          msg += ` Returned ${t.overdueDays} day(s) late. Late fine of ₹${Number(t.fineAmount).toFixed(2)} assessed.`;
        } else {
          msg += ` Returned on time. Fine: ₹0.00.`;
        }
        setReturnSuccess(msg);
        setSelectedTransId('');
        setReturnNotes('');
        fetchActiveTransactions();
        fetchIssueDropdowns();
      }
    } catch (err) {
      setReturnError(err.message || 'Failed to return book');
    } finally {
      setReturnLoading(false);
    }
  };

  // Calculate live return preview
  const selectedTrans = activeTransactions.find(t => String(t.id) === String(selectedTransId));
  let calculatedOverdueDays = 0;
  let estimatedLateFine = 0;
  if (selectedTrans && returnDate) {
    const due = new Date(selectedTrans.dueDate);
    const ret = new Date(returnDate);
    const diffTime = ret - due;
    calculatedOverdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    estimatedLateFine = calculatedOverdueDays * 5; // standard ₹5/day
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Circulation: Issue & Return Desk</h1>
          <p className="page-subtitle">
            Manage physical book circulation, due dates, and real-time return fine settlements
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'issue' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('issue')}
          style={{ padding: '10px 24px', fontWeight: 600 }}
        >
          <BookOpen size={18} /> Issue Book to Patron
        </button>
        <button
          className={`btn ${activeTab === 'return' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('return')}
          style={{ padding: '10px 24px', fontWeight: 600 }}
        >
          <RotateCcw size={18} /> Process Book Return
        </button>
      </div>

      {/* ISSUE TAB */}
      {activeTab === 'issue' && (
        <div className="card" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#142D4E', marginBottom: '18px' }}>
            Issue a Book
          </h2>

          {issueSuccess && (
            <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} />
              <span>{issueSuccess}</span>
            </div>
          )}

          {issueError && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{issueError}</span>
            </div>
          )}

          <form onSubmit={handleIssueSubmit}>
            <div className="form-group">
              <label className="form-label">Select Book Title (Available copies in stock)</label>
              <select
                className="form-select"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
              >
                <option value="">-- Choose Book from Catalogue --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author} ({b.availableCopies} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Patron (Student or Faculty)</label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  const p = patrons.find(pat => String(pat.id) === String(e.target.value));
                  if (p) {
                    const days = p.role === 'Faculty' ? 30 : 14;
                    const d = new Date(issueDate);
                    d.setDate(d.getDate() + days);
                    setDueDate(d.toISOString().split('T')[0]);
                  }
                }}
                required
              >
                <option value="">-- Choose Patron --</option>
                {patrons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.ident}] ({p.role})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date (Auto-calculated or custom)</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Circulation Notes (Optional)</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Condition remarks or special faculty extension..."
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              disabled={issueLoading}
            >
              {issueLoading ? 'Recording Issue...' : 'Confirm Book Issuance'}
            </button>
          </form>
        </div>
      )}

      {/* RETURN TAB */}
      {activeTab === 'return' && (
        <div className="card" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#142D4E', marginBottom: '18px' }}>
            Process a Book Return
          </h2>

          {returnSuccess && (
            <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} />
              <span>{returnSuccess}</span>
            </div>
          )}

          {returnError && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{returnError}</span>
            </div>
          )}

          <form onSubmit={handleReturnSubmit}>
            <div className="form-group">
              <label className="form-label">Select Active Borrow Transaction</label>
              <select
                className="form-select"
                value={selectedTransId}
                onChange={(e) => setSelectedTransId(e.target.value)}
                required
              >
                <option value="">-- Choose Active Loan ({activeTransactions.length} pending) --</option>
                {activeTransactions.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} — "{t.bookTitle}" borrowed by {t.userName} (Due: {t.dueDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Return Date</label>
              <input
                type="date"
                className="form-input"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>

            {/* Real-time Return Assessment Calculation Box */}
            {selectedTrans && (
              <div
                style={{
                  backgroundColor: calculatedOverdueDays > 0 ? '#FFFBEB' : '#F0FDF4',
                  border: calculatedOverdueDays > 0 ? '1px solid #FDE68A' : '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#142D4E', marginBottom: '8px' }}>
                  Return Assessment Summary
                </div>
                <div style={{ fontSize: '0.86rem', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>Book: <strong>{selectedTrans.bookTitle}</strong></div>
                  <div>Patron: <strong>{selectedTrans.userName}</strong></div>
                  <div>Agreed Due Date: <strong>{selectedTrans.dueDate}</strong></div>
                  <div>Actual Return Date: <strong>{returnDate}</strong></div>
                  <div>Overdue Days: <strong style={{ color: calculatedOverdueDays > 0 ? '#DC2626' : '#0F9D8A' }}>{calculatedOverdueDays} days</strong></div>
                  <div>
                    Assessed Fine: <strong style={{ color: calculatedOverdueDays > 0 ? '#DC2626' : '#0F9D8A' }}>
                      ₹{estimatedLateFine.toFixed(2)}
                    </strong> (@ ₹5.00/day)
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Return Notes (Optional)</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Condition verification or receipt notes..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-teal"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              disabled={returnLoading || !selectedTransId}
            >
              {returnLoading ? 'Processing Return...' : 'Confirm Return & Restore Copy'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
