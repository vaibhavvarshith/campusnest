import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import { BarChart3, Download, Printer } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('issued'); // 'issued' | 'returned' | 'overdue' | 'fines'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports/${reportType}`);
      if (res.success && res.data) {
        setData(res.data);
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
          <h1 className="page-title">Library Audit & Administrative Reports</h1>
          <p className="page-subtitle">
            Generate and export circulation, collection reconciliation, and fine settlement statements
          </p>
        </div>

        <button onClick={() => window.print()} className="btn btn-secondary">
          <Printer size={18} /> Print Statement
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${reportType === 'issued' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('issued')}
        >
          Currently Issued Report
        </button>
        <button
          className={`btn ${reportType === 'returned' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('returned')}
        >
          Returned Transactions Log
        </button>
        <button
          className={`btn ${reportType === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('overdue')}
        >
          Overdue Delinquency Report
        </button>
        <button
          className={`btn ${reportType === 'fines' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('fines')}
        >
          Fines & Settlements Report
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              {reportType === 'fines' ? (
                <tr>
                  <th>Fine #</th>
                  <th>Patron</th>
                  <th>Book Title</th>
                  <th>Assessed Date</th>
                  <th>Overdue Days</th>
                  <th>Fine Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th>Txn #</th>
                  <th>Book Title</th>
                  <th>Patron</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#2563EB' }}>
                    Compiling report dataset...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    No records found for this report criteria.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    {reportType === 'fines' ? (
                      <>
                        <td style={{ fontWeight: 700 }}>#{item.id}</td>
                        <td>{item.userName} ({item.userIdentifier})</td>
                        <td style={{ fontWeight: 600 }}>{item.bookTitle}</td>
                        <td>{item.assessedDate}</td>
                        <td>{item.overdueDays} days</td>
                        <td>₹{Number(item.fineAmount).toFixed(2)}</td>
                        <td style={{ color: '#0F9D8A', fontWeight: 600 }}>₹{Number(item.paidAmount).toFixed(2)}</td>
                        <td style={{ color: Number(item.balanceAmount) > 0 ? '#DC2626' : '#64748B', fontWeight: 700 }}>
                          ₹{Number(item.balanceAmount).toFixed(2)}
                        </td>
                        <td><Badge status={item.status} /></td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 700 }}>#{item.id}</td>
                        <td style={{ fontWeight: 600 }}>{item.bookTitle}</td>
                        <td>{item.userName} ({item.userIdentifier || item.userRole})</td>
                        <td>{item.issueDate}</td>
                        <td style={{ color: item.isOverdue ? '#DC2626' : 'inherit', fontWeight: item.isOverdue ? 700 : 'normal' }}>
                          {item.dueDate}
                        </td>
                        <td>{item.returnDate || '—'}</td>
                        <td><Badge status={item.status} /></td>
                        <td>₹{Number(item.fineAmount || 0).toFixed(2)}</td>
                      </>
                    )}
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
