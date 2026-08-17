import React, { useState, useEffect } from 'react';
import { UserCheck, Check, X, ShieldAlert, AlertCircle, CheckCircle2, MessageSquare, Clock, Shield, ShieldCheck, Search } from 'lucide-react';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import { formatDateDMY } from '../../utils/formatDate';
import './AppAdminRequestsPage.css';

export const AppAdminRequestsPage = () => {
  const { user } = useAuth();
  const userRole = (user?.role || '').toUpperCase();
  const isAppAdmin = userRole === 'APP_ADMIN' || (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_APP_ADMIN' || r === 'APP_ADMIN'));

  const [roleTypeTab, setRoleTypeTab] = useState(() => (isAppAdmin ? 'APP_ADMIN' : 'EVENT_ADMIN')); // 'APP_ADMIN' or 'EVENT_ADMIN'
  const [statusFilter, setStatusFilter] = useState('VIEW_EVENT_ADMINS'); // 'VIEW_EVENT_ADMINS', 'PENDING', 'APPROVED', 'REJECTED'
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // State for View Event Admins tab
  const [eventAdmins, setEventAdmins] = useState([]);
  const [loadingEventAdmins, setLoadingEventAdmins] = useState(false);
  const [eventAdminSearch, setEventAdminSearch] = useState('');

  const [alert, setAlert] = useState(null);
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  useEffect(() => {
    if (statusFilter === 'VIEW_EVENT_ADMINS') {
      fetchEventAdmins();
    } else {
      fetchRequests(roleTypeTab, statusFilter);
    }
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

  const fetchEventAdmins = async () => {
    setLoadingEventAdmins(true);
    try {
      const data = await adminRequestService.getEventAdmins();
      setEventAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch event admins:', err);
      setEventAdmins([]);
    } finally {
      setLoadingEventAdmins(false);
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

  // Filter out current logged-in user from event admins list
  const otherEventAdmins = eventAdmins.filter((adm) => {
    if (user?.id && adm.id === user.id) return false;
    if (user?.email && (adm.email || '').toLowerCase() === user.email.toLowerCase()) return false;
    if (user?.registrationNumber && (adm.registrationNumber || '').toLowerCase() === user.registrationNumber.toLowerCase()) return false;
    return true;
  });

  const searchedEventAdmins = otherEventAdmins.filter((adm) => {
    const q = eventAdminSearch.trim().toLowerCase();
    if (!q) return true;
    const email = (adm.email || '').toLowerCase();
    const regNo = (adm.registrationNumber || '').toLowerCase();
    const name = (adm.fullName || adm.name || '').toLowerCase();
    return email.includes(q) || regNo.includes(q) || name.includes(q);
  });

  return (
    <div className="admin-requests-page">
      {alert && (
        <div className={`auth-alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Role Type Selector Tabs (Only shown for App Admins to switch between App Admin and Event Admin Requests) */}
      {isAppAdmin && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <button
            className={`tab-btn ${roleTypeTab === 'APP_ADMIN' ? 'active' : ''}`}
            onClick={() => setRoleTypeTab('APP_ADMIN')}
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '8px 16px',
              borderRadius: '6px',
              background: roleTypeTab === 'APP_ADMIN' ? '#D97757' : 'transparent',
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
              background: roleTypeTab === 'EVENT_ADMIN' ? '#D97757' : 'transparent',
              color: roleTypeTab === 'EVENT_ADMIN' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px' }} /> Event Admin Requests
          </button>
        </div>
      )}

      {/* Filter Status Tabs */}
      <div className="profile-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className={`tab-btn ${statusFilter === 'VIEW_EVENT_ADMINS' ? 'active' : ''}`}
          onClick={() => setStatusFilter('VIEW_EVENT_ADMINS')}
        >
          <ShieldCheck size={16} /> View Event Admins
        </button>
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

      {/* TAB CONTENT 1: VIEW EVENT ADMINS TABLE */}
      {statusFilter === 'VIEW_EVENT_ADMINS' ? (
        <div className="card admin-review-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Registered Event Admins</h2>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name/email/regno..."
                  value={eventAdminSearch}
                  onChange={(e) => setEventAdminSearch(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem', borderRadius: '8px' }}
                />
              </div>
            </div>
            <span className="badge badge-info">{searchedEventAdmins.length} Event {searchedEventAdmins.length === 1 ? 'Admin' : 'Admins'}</span>
          </div>

          {loadingEventAdmins ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading Event Admins...</p>
          ) : searchedEventAdmins.length === 0 ? (
            <p className="no-requests" style={{ color: 'var(--text-muted)', padding: '1.5rem 0', textAlign: 'center' }}>
              {eventAdminSearch ? `No Event Admins found matching "${eventAdminSearch}".` : 'No other Event Admins found.'}
            </p>
          ) : (
            <div className="admins-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="admins-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>S.No</th>
                    <th style={{ padding: '10px' }}>Full Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Registration No</th>
                    <th style={{ padding: '10px' }}>Department / Year</th>
                    <th style={{ padding: '10px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedEventAdmins.map((adm, index) => (
                    <tr key={adm.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '12px 10px' }}>{index + 1}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                        <ShieldCheck size={16} style={{ color: '#D97757', display: 'inline', marginRight: '6px' }} />
                        {adm.fullName || adm.name || 'Event Admin'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>{adm.email || 'N/A'}</td>
                      <td style={{ padding: '12px 10px' }}><code>{adm.registrationNumber || 'N/A'}</code></td>
                      <td style={{ padding: '12px 10px' }}>
                        {adm.department ? `${adm.department} ${adm.year ? `(Yr ${adm.year})` : ''}` : '-'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="badge badge-primary">EVENT_ADMIN</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB CONTENT 2: PENDING / APPROVED / REJECTED REQUEST CARDS */
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
                const reviewerObj = req.reviewedBy || {};
                const reviewerName = typeof reviewerObj === 'object' ? (reviewerObj.fullName || reviewerObj.name || reviewerObj.email) : String(reviewerObj || '');
                const displayReviewer = reviewerName || (req.status !== 'PENDING' ? 'App Admin' : null);

                return (
                  <div key={req.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{userName}</h4>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {userEmail} • Reg No: <code>{userReg}</code> {userDept ? `• ${userDept}` : ''} {userYear ? `(${userYear})` : ''} {userPhone ? `• ${userPhone}` : ''} • Submitted: {formatDateDMY(req.requestedAt)}
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

                    {(displayReviewer || req.remarks) && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                        {displayReviewer && (
                          <span style={{ marginRight: '1rem' }}>
                            <strong>Reviewed by:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayReviewer}</span>
                          </span>
                        )}
                        {req.remarks && (
                          <span>
                            <strong>Remarks:</strong> {req.remarks}
                          </span>
                        )}
                      </div>
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
      )}

      {/* Reject Remarks Modal */}
      {rejectModalId && (
        <div
          className="modal-backdrop"
          onClick={() => setRejectModalId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
        >
          <div
            className="card glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '90%',
              padding: '1.75rem',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--card-border)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Reject {roleTypeTab === 'EVENT_ADMIN' ? 'Event Admin' : 'App Admin'} Request
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Provide optional rejection remarks for evaluating user privilege requests.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Needs department head authorization..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                style={{ marginBottom: '1.25rem', borderRadius: '10px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRejectModalId(null)}
                  style={{ borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#e11d48', borderColor: '#e11d48', color: '#ffffff', fontWeight: 700, borderRadius: '8px', padding: '0.5rem 1.25rem' }}
                >
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
