import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  BookOpen,
  User,
  Check,
  X,
  FileText
} from 'lucide-react';

export default function BorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Reject modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const params = {
        page,
        size: 12,
      };
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }

      const res = await api.get('/borrow-requests', { params });
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load borrow requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchRequests();
  };

  const handleApprove = async (req) => {
    if (!window.confirm(`Approve and issue "${req.bookTitle}" to ${req.userName} (${req.userIdentifier})?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/borrow-requests/${req.id}/approve`);
      if (res.success) {
        setToastMessage(`Request #${req.id} approved! 1 physical copy issued to ${req.userName}.`);
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Failed to approve borrow request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const res = await api.post(`/borrow-requests/${selectedRequest.id}/reject`, {
        reason: rejectReason.trim() || 'Request declined by librarian.',
      });
      if (res.success) {
        setToastMessage(`Request #${selectedRequest.id} has been rejected.`);
        setSelectedRequest(null);
        setRejectReason('');
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} style={{ marginRight: 4 }} /> Pending Approval</span>;
      case 'APPROVED':
        return <span className="badge badge-success"><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Approved & Issued</span>;
      case 'REJECTED':
        return <span className="badge badge-danger"><XCircle size={12} style={{ marginRight: 4 }} /> Rejected</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Borrow Requests Desk</h1>
          <p className="page-subtitle">
            Review student and faculty book loan requests, verify available copies, and authorize book issuance
          </p>
        </div>
        <button onClick={fetchRequests} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Queue
        </button>
      </div>

      {toastMessage && (
        <div
          style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803D' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by book title, author, borrower name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} color="#64748B" />
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved & Issued</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Book Title & Details</th>
                <th>Borrower</th>
                <th>Requested Date</th>
                <th>Live Inventory</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Circulation Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: '#2563EB', fontWeight: 600 }}>
                    Loading borrow requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
                    <Inbox size={40} style={{ margin: '0 auto 10px', color: '#CBD5E1' }} />
                    <div style={{ fontWeight: 600, color: '#142D4E' }}>No requests match the selected criteria</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      {statusFilter === 'PENDING' ? 'All pending requests have been processed.' : 'Try adjusting your filters.'}
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isAvailable = req.availableCopies > 0;
                  const isPending = req.status === 'PENDING';

                  return (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 700, color: '#142D4E' }}>#{req.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#142D4E' }}>{req.bookTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          by {req.bookAuthor} &bull; ISBN: {req.bookIsbn}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#142D4E' }}>{req.userName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#2563EB' }}>
                          {req.userIdentifier} &bull; {req.userRole === 'ROLE_FACULTY' ? 'Faculty' : 'Student'}
                        </div>
                        {req.userDepartment && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{req.userDepartment}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {req.requestDate ? new Date(req.requestDate).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
                          {req.availableCopies} / {req.totalCopies} available
                        </span>
                      </td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApprove(req)}
                              className="btn btn-success btn-sm"
                              disabled={actionLoading || !isAvailable}
                              title={!isAvailable ? 'No copies available to issue' : 'Approve & Issue Book'}
                            >
                              <Check size={14} /> Approve & Issue
                            </button>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                            {req.processedByName ? `Processed by ${req.processedByName}` : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Showing Page {page + 1} of {totalPages} ({totalElements} total requests)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            setRejectReason('');
          }}
          title={`Reject Borrow Request #${selectedRequest.id}`}
        >
          <form onSubmit={handleRejectSubmit}>
            <div style={{ marginBottom: '16px', fontSize: '0.88rem', color: '#1E293B' }}>
              You are about to decline the borrow request for:
              <div style={{ fontWeight: 700, marginTop: '4px', color: '#142D4E' }}>
                {selectedRequest.bookTitle}
              </div>
              <div style={{ color: '#64748B', fontSize: '0.82rem' }}>
                Requested by: {selectedRequest.userName} ({selectedRequest.userIdentifier})
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Decline Reason (shared with borrower)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Physical copy reserved for course exams, or borrower has unpaid fine balance."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
