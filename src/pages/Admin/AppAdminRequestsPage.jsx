import React, { useState, useEffect } from 'react';
import { UserCheck, Send, Check, X, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import './AppAdminRequestsPage.css';

export const AppAdminRequestsPage = () => {
  const { user } = useAuth();
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await adminRequestService.getPendingRequests('PENDING');
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      setAlert({ type: 'error', message: 'Please provide a reason for your admin request.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      await adminRequestService.submitRequest(requestReason);
      setAlert({ type: 'success', message: 'App-Admin request submitted successfully!' });
      setRequestReason('');
      fetchPendingRequests();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id, studentName) => {
    try {
      await adminRequestService.approveRequest(id);
      setAlert({ type: 'success', message: `Approved request #${id} (${studentName || 'User'})!` });
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to approve request.' });
    }
  };

  const handleReject = async (id, studentName) => {
    try {
      await adminRequestService.rejectRequest(id, 'Not enough justification');
      setAlert({ type: 'info', message: `Rejected request #${id}.` });
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to reject request.' });
    }
  };

  return (
    <div className="admin-requests-page">
      <div className="page-header">
        <div>
          <h1>App-Admin Request Management</h1>
          <p>Submit privilege requests or approve/reject pending student requests.</p>
        </div>
      </div>

      {alert && (
        <div className={`auth-alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="requests-page-grid">
        {/* Submit Request (Student Side) */}
        <div className="card request-form-card">
          <div className="card-header">
            <h2>Submit App-Admin Request</h2>
          </div>

          <form onSubmit={handleStudentSubmit} className="request-form">
            <div className="form-group">
              <label>Request Reason / Justification *</label>
              <textarea
                rows={5}
                placeholder="Enter request reason (API: POST /api/app-admin-requests)..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                required
              />
            </div>

            <div className="info-box">
              <ShieldAlert size={18} className="info-icon" />
              <p>API Endpoint: <code>POST /api/app-admin-requests</code>. Once approved by an Application Admin, your account gains administrative privileges.</p>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Submitting Request...' : <><Send size={16} /> Submit App-Admin Request</>}
            </button>
          </form>
        </div>

        {/* Review Pending Requests (Admin Side) */}
        <div className="card admin-review-card">
          <div className="card-header">
            <h2>Pending App-Admin Requests</h2>
            <span className="badge badge-warning">{pendingRequests.length} Pending</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            APIs: <code>GET /api/admin/app-admin-requests?status=PENDING</code>, <code>POST .../approve</code>, <code>POST .../reject</code>
          </p>

          {loadingRequests ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading pending requests...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="no-requests">No pending requests found.</p>
          ) : (
            <div className="requests-review-list">
              {pendingRequests.map((req) => (
                <div key={req.id} className="review-card-item">
                  <div className="review-header">
                    <div>
                      <h4 className="req-name">{req.fullName || req.studentName || `Request #${req.id}`}</h4>
                      <span className="req-reg">Reg No: {req.registrationNumber || req.userId || 'N/A'}</span>
                    </div>
                    <span className="badge badge-warning">{req.status || 'PENDING'}</span>
                  </div>

                  <p className="req-reason">"{req.requestReason}"</p>

                  <div className="req-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id, req.fullName || req.studentName)}>
                      <Check size={14} /> Approve
                    </button>
                    <button className="btn btn-secondary btn-sm btn-reject" onClick={() => handleReject(req.id, req.fullName || req.studentName)}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
