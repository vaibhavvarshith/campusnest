import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import { AlertTriangle, Clock, RotateCcw } from 'lucide-react';

export default function OverdueBooks() {
  const [overdues, setOverdues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverdues();
  }, []);

  const fetchOverdues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/overdue');
      if (res.success && res.data) {
        setOverdues(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overdue Books & Delinquent Loans</h1>
          <p className="page-subtitle">
            Unreturned physical books past their official return deadline with daily penalty calculations
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', padding: '12px 16px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={20} color="#D97706" />
          <div style={{ fontSize: '0.88rem', color: '#92400E' }}>
            All unreturned books accumulate a daily fine rate of <strong>₹5.00 per day</strong> past the return due date. Automated notification reminders are dispatched daily at 8:00 AM IST.
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn #</th>
                <th>Book Title</th>
                <th>Patron</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Daily Rate</th>
                <th>Est. Fine Accumulation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#2563EB' }}>
                    Scanning overdue transactions...
                  </td>
                </tr>
              ) : overdues.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#0F9D8A' }}>
                    No overdue books! All currently issued loans are within their return deadlines.
                  </td>
                </tr>
              ) : (
                overdues.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700 }}>#{t.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#142D4E' }}>{t.bookTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>ISBN: {t.bookIsbn}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.userName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{t.userIdentifier}</div>
                    </td>
                    <td style={{ color: '#DC2626', fontWeight: 600 }}>{t.dueDate}</td>
                    <td>
                      <span className="badge badge-danger">
                        {t.overdueDays} days late
                      </span>
                    </td>
                    <td>₹5.00/day</td>
                    <td style={{ fontWeight: 700, color: '#DC2626' }}>
                      ₹{Number(t.fineAmount).toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate('/issue-return')}
                        className="btn btn-primary btn-sm"
                      >
                        <RotateCcw size={14} /> Receive Return
                      </button>
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
