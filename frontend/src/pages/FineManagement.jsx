import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  IndianRupee,
  Search,
  CheckCircle,
  AlertCircle,
  Receipt,
  Printer,
  CreditCard,
} from 'lucide-react';

export default function FineManagement() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Payment Modal
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Receipt Modal
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchFines();
  }, [statusFilter]);

  const fetchFines = async () => {
    setLoading(true);
    try {
      let url = `/admin/fines?page=0&size=50`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&query=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.success && res.data) {
        setFines(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFines();
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');
    setPaymentLoading(true);

    try {
      const payload = {
        fineId: selectedFine.id,
        amountPaid: parseFloat(paymentAmount),
        paymentMethod: paymentMethod,
        notes: paymentNotes,
      };

      const res = await api.post('/admin/fines/pay', payload);
      if (res.success) {
        setPaymentSuccess('Payment recorded successfully!');
        const updated = res.data;
        setReceiptData({
          receiptNo: `REC-${Date.now()}-${updated.id}`,
          patronName: updated.userName,
          patronId: updated.userIdentifier,
          bookTitle: updated.bookTitle,
          amountPaid: parseFloat(paymentAmount).toFixed(2),
          method: paymentMethod,
          date: new Date().toLocaleString(),
          remainingBalance: Number(updated.balanceAmount).toFixed(2),
          status: updated.status,
        });
        setSelectedFine(null);
        fetchFines();
      }
    } catch (err) {
      setPaymentError(err.message || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fine & Fee Management Desk</h1>
          <p className="page-subtitle">
            Track assessed late penalties, process manual cash/UPI receipts, and review balances
          </p>
        </div>
      </div>

      {paymentSuccess && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{paymentSuccess}</span>
        </div>
      )}

      {/* Filter and Search */}
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
              placeholder="Search patron, registration number, book title..."
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
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Fines</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Fully Settled</option>
        </select>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fine #</th>
                <th>Patron Details</th>
                <th>Book Title</th>
                <th>Late Days</th>
                <th>Total Fine</th>
                <th>Paid Amount</th>
                <th>Outstanding Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#2563EB' }}>
                    Loading assessed fines...
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    No fines found matching your search.
                  </td>
                </tr>
              ) : (
                fines.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 700 }}>#{f.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#142D4E' }}>{f.userName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{f.userIdentifier}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.bookTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Returned: {f.returnDate}</div>
                    </td>
                    <td>
                      <span className="badge badge-warning">{f.overdueDays} days</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(f.fineAmount).toFixed(2)}</td>
                    <td style={{ color: '#0F9D8A', fontWeight: 600 }}>₹{Number(f.paidAmount).toFixed(2)}</td>
                    <td style={{ color: Number(f.balanceAmount) > 0 ? '#DC2626' : '#64748B', fontWeight: 700 }}>
                      ₹{Number(f.balanceAmount).toFixed(2)}
                    </td>
                    <td><Badge status={f.status} /></td>
                    <td>
                      {Number(f.balanceAmount) > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedFine(f);
                            setPaymentAmount(Number(f.balanceAmount).toFixed(2));
                            setPaymentError('');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <IndianRupee size={14} /> Record Payment
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptData({
                            receiptNo: `REC-SETTLED-${f.id}`,
                            patronName: f.userName,
                            patronId: f.userIdentifier,
                            bookTitle: f.bookTitle,
                            amountPaid: Number(f.paidAmount).toFixed(2),
                            method: 'CASH / DESK',
                            date: f.assessedDate || 'Completed',
                            remainingBalance: '0.00',
                            status: 'PAID',
                          })}
                          className="btn btn-secondary btn-sm"
                        >
                          <Receipt size={14} /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={!!selectedFine}
        onClose={() => setSelectedFine(null)}
        title="Record Fine Payment"
      >
        {selectedFine && (
          <form onSubmit={handleRecordPayment}>
            {paymentError && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
                {paymentError}
              </div>
            )}

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div>Patron: <strong>{selectedFine.userName}</strong> ({selectedFine.userIdentifier})</div>
              <div>Book: <strong>{selectedFine.bookTitle}</strong></div>
              <div>Total Assessed Fine: <strong>₹{Number(selectedFine.fineAmount).toFixed(2)}</strong></div>
              <div style={{ color: '#DC2626', fontWeight: 700, marginTop: '4px' }}>
                Outstanding Balance: ₹{Number(selectedFine.balanceAmount).toFixed(2)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={Number(selectedFine.balanceAmount)}
                className="form-input"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">Cash (Circulation Counter)</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="BANK_TRANSFER">College Accounts Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Remarks (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Transaction reference or cash receipt notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedFine(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Recording...' : 'Confirm & Generate Receipt'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Official Payment Receipt Modal */}
      <Modal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        title="Official Fine Settlement Statement"
      >
        {receiptData && (
          <div>
            <div
              style={{
                border: '2px dashed #CBD5E1',
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: '#FAFAFA',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: '#172033',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>CAMPUSNEST LIBRARY</h3>
                <div>Circulation Desk Fine Receipt</div>
                <div>Receipt ID: <strong>{receiptData.receiptNo}</strong></div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div>Date & Time : {receiptData.date}</div>
                <div>Patron Name : {receiptData.patronName}</div>
                <div>ID / Reg No : {receiptData.patronId}</div>
                <div>Book Title  : {receiptData.bookTitle}</div>
                <div>Payment Mode: {receiptData.method}</div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '8px 0', margin: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>AMOUNT PAID:</span>
                  <span>INR {receiptData.amountPaid}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>REMAINING BALANCE:</span>
                  <span>INR {receiptData.remainingBalance}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748B', marginTop: '10px' }}>
                Status: <strong>{receiptData.status}</strong><br />
                Thank you for keeping campus library collections accessible.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setReceiptData(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
