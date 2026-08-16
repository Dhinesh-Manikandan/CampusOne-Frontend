import React, { useState, useEffect } from 'react';
import { UserCheck, Check, X, ShieldAlert, AlertCircle, CheckCircle2, Filter, MessageSquare, Clock, Shield } from 'lucide-react';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import './AppAdminRequestsPage.css';

export const AppAdminRequestsPage = () => {
  const userRole = (user?.role || '').toUpperCase();
  const isAppAdmin = userRole === 'APP_ADMIN' || (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_APP_ADMIN' || r === 'APP_ADMIN'));

  const [roleTypeTab, setRoleTypeTab] = useState(() => (isAppAdmin ? 'APP_ADMIN' : 'EVENT_ADMIN')); // 'APP_ADMIN' or 'EVENT_ADMIN'
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING', 'APPROVED', 'REJECTED'
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [alert, setAlert] = useState(null);
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  useEffect(() => {
    fetchRequests(roleTypeTab, statusFilter);
  }, [roleTypeTab, statusFilter]);

  const fetchRequests = async (roleType, status) => {
    setLoadingRequests(true);
    try {
      let data = [];
      if (roleType === 'EVENT_ADMIN') {
        data = await adminRequestService.getPendingEventAdminRequests(status);
      } else {
        data = await adminRequestService.getPendingRequests(status);
      }
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApprove = async (id, studentName) => {
    try {
      if (roleTypeTab === 'EVENT_ADMIN') {
        await adminRequestService.approveEventAdminRequest(id);
        setAlert({ type: 'success', message: `Approved Event Admin request for ${studentName || 'User'}!` });
      } else {
        await adminRequestService.approveRequest(id);
        setAlert({ type: 'success', message: `Approved App Admin request for ${studentName || 'User'}!` });
      }
      fetchRequests(roleTypeTab, statusFilter);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to approve request.' });
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalId) return;

    try {
      if (roleTypeTab === 'EVENT_ADMIN') {
        await adminRequestService.rejectEventAdminRequest(rejectModalId, rejectRemarks || 'Not enough justification at this time');
      } else {
        await adminRequestService.rejectRequest(rejectModalId, rejectRemarks || 'Not enough justification at this time');
      }
      setAlert({ type: 'info', message: `Rejected request.` });
      setRejectModalId(null);
      setRejectRemarks('');
      fetchRequests(roleTypeTab, statusFilter);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to reject request.' });
    }
  };

  return (
    <div className="admin-requests-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Administrative Role Requests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review, approve, or reject Application Admin and Event Admin privilege requests submitted by users.
          </p>
        </div>
      </div>

      {alert && (
        <div className={`auth-alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Role Type Selector Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
        <button
          className={`tab-btn ${roleTypeTab === 'APP_ADMIN' ? 'active' : ''}`}
          onClick={() => setRoleTypeTab('APP_ADMIN')}
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '8px 16px',
            borderRadius: '6px',
            background: roleTypeTab === 'APP_ADMIN' ? '#3b82f6' : 'transparent',
            color: roleTypeTab === 'APP_ADMIN' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Shield size={16} style={{ display: 'inline', marginRight: '6px' }} /> Application Admin Requests
        </button>
        <button
          className={`tab-btn ${roleTypeTab === 'EVENT_ADMIN' ? 'active' : ''}`}
          onClick={() => setRoleTypeTab('EVENT_ADMIN')}
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '8px 16px',
            borderRadius: '6px',
            background: roleTypeTab === 'EVENT_ADMIN' ? '#3b82f6' : 'transparent',
            color: roleTypeTab === 'EVENT_ADMIN' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px' }} /> Event Admin Requests
        </button>
      </div>

      {/* Filter Status Tabs */}
      <div className="profile-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <button
          className={`tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setStatusFilter('PENDING')}
        >
          <Clock size={16} /> Pending Requests
        </button>
        <button
          className={`tab-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('APPROVED')}
        >
          <CheckCircle2 size={16} /> Approved Requests
        </button>
        <button
          className={`tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('REJECTED')}
        >
          <X size={16} /> Rejected Requests
        </button>
      </div>

      {/* Review Card */}
      <div className="card admin-review-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{roleTypeTab === 'EVENT_ADMIN' ? 'Event Admin' : 'App Admin'} • {statusFilter} Requests</h2>
          <span className={`badge ${statusFilter === 'PENDING' ? 'badge-warning' : statusFilter === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
            {requests.length} {statusFilter}
          </span>
        </div>

        {loadingRequests ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="no-requests" style={{ color: 'var(--text-muted)', padding: '1.5rem 0', textAlign: 'center' }}>
            No {statusFilter.toLowerCase()} {roleTypeTab === 'EVENT_ADMIN' ? 'Event Admin' : 'App Admin'} requests found.
          </p>
        ) : (
          <div className="requests-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((req) => {
              const reqUser = req.requestedBy || req.userResponse || {};
              const userName = reqUser.fullName || reqUser.name || req.studentName || 'Applicant User';
              const userEmail = reqUser.email || req.email || 'N/A';
              const userReg = reqUser.registrationNumber || req.registrationNumber || 'N/A';
              const userDept = reqUser.department ? `Dept: ${reqUser.department}` : '';
              const userYear = reqUser.year ? `Year ${reqUser.year}` : '';
              const userPhone = reqUser.phoneNumber ? `Ph: ${reqUser.phoneNumber}` : '';

              return (
                <div key={req.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{userName}</h4>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {userEmail} • Reg No: <code>{userReg}</code> {userDept ? `• ${userDept}` : ''} {userYear ? `(${userYear})` : ''} {userPhone ? `• ${userPhone}` : ''}
                      </p>
                    </div>
                    <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                      {req.status || statusFilter}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px' }} /> Justification Reason:
                    </p>
                    <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{req.requestReason}"</p>
                  </div>

                  {req.remarks && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <strong>Remarks:</strong> {req.remarks}
                    </p>
                  )}

                  {req.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id, userName)}>
                        <Check size={15} /> Approve & Grant {roleTypeTab === 'EVENT_ADMIN' ? 'Event Admin' : 'App Admin'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setRejectModalId(req.id); setRejectRemarks(''); }}
                        style={{ color: '#e11d48' }}
                      >
                        <X size={15} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Remarks Modal */}
      {rejectModalId && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Reject Request</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Provide optional remarks for rejecting this request.</p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Needs higher department clearance..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRejectModalId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#e11d48', borderColor: '#e11d48' }}>Reject Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
