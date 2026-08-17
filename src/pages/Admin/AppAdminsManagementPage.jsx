import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, AlertCircle, CheckCircle2, UserPlus, UserCheck, Check, Clock, Shield, Search, X, FileText, MessageSquare, Filter } from 'lucide-react';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import './AppAdminsManagementPage.css';

export const AppAdminsManagementPage = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('view'); // 'view', 'create', 'requests'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Search queries (applied on Enter) & typing inputs
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [createSearchInput, setCreateSearchInput] = useState('');
  const [createSearchQuery, setCreateSearchQuery] = useState('');

  const [requestSearchInput, setRequestSearchInput] = useState('');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');

  // Dropdown filter for 3rd subtab: 'ALL' (default), 'PENDING', 'APPROVED', 'REJECTED'
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'requests') {
      fetchRequestsLog(requestStatusFilter);
    }
  }, [activeSubTab, requestStatusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsData, requestsData] = await Promise.all([
        adminRequestService.getApplicationAdmins().catch(() => []),
        adminRequestService.getPendingRequests('PENDING').catch(() => [])
      ]);
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      setPendingRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsLog = async (status) => {
    setLoading(true);
    try {
      const param = status === 'ALL' ? '' : status;
      const data = await adminRequestService.getPendingRequests(param);
      setAllRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch request history:', err);
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // State for Reject Remarks Modal
  const [rejectModalData, setRejectModalData] = useState(null); // { requestId, studentName }
  const [rejectRemarks, setRejectRemarks] = useState('');

  const handleCreateAdminFromRequest = async (requestId, studentName) => {
    setActionLoadingId(requestId);
    setAlert(null);
    try {
      await adminRequestService.approveRequest(requestId);
      setAlert({ type: 'success', message: `Successfully created Application Admin for ${studentName || 'User'}!` });
      fetchData();
      if (activeSubTab === 'requests') fetchRequestsLog(requestStatusFilter);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create Application Admin.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (requestId, studentName) => {
    setRejectModalData({ requestId, studentName });
    setRejectRemarks('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalData) return;
    const { requestId, studentName } = rejectModalData;
    setActionLoadingId(requestId);
    setAlert(null);
    try {
      await adminRequestService.rejectRequest(requestId, rejectRemarks.trim() || 'Not enough justification at this time.');
      setAlert({ type: 'info', message: `Rejected admin request for ${studentName || 'User'}.` });
      setRejectModalData(null);
      setRejectRemarks('');
      fetchData();
      if (activeSubTab === 'requests') fetchRequestsLog(requestStatusFilter);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to reject request.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveAdmin = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from Application Admins?`)) return;

    setAlert(null);
    try {
      await adminRequestService.removeApplicationAdmin(id);
      setAlert({ type: 'success', message: `Removed ${name} from Application Admins.` });
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to remove admin.' });
    }
  };

  const otherAdmins = admins.filter((adm) => {
    if (user?.id && adm.id === user.id) return false;
    if (user?.email && (adm.email || '').toLowerCase() === user.email.toLowerCase()) return false;
    if (user?.registrationNumber && (adm.registrationNumber || '').toLowerCase() === user.registrationNumber.toLowerCase()) return false;
    return true;
  });

  const filteredAdmins = otherAdmins.filter((adm) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const email = (adm.email || '').toLowerCase();
    const regNo = (adm.registrationNumber || '').toLowerCase();
    const name = (adm.fullName || adm.name || '').toLowerCase();
    return email.includes(q) || regNo.includes(q) || name.includes(q);
  });

  const filteredPendingRequests = pendingRequests.filter((req) => {
    const q = createSearchQuery.trim().toLowerCase();
    if (!q) return true;
    const userObj = req.requestedBy || req.userResponse || {};
    const email = (userObj.email || req.email || '').toLowerCase();
    const regNo = (userObj.registrationNumber || req.registrationNumber || '').toLowerCase();
    const name = (userObj.fullName || req.fullName || req.studentName || '').toLowerCase();
    return email.includes(q) || regNo.includes(q) || name.includes(q);
  });

  const filteredAllRequests = allRequests.filter((req) => {
    const q = requestSearchQuery.trim().toLowerCase();
    if (!q) return true;
    const userObj = req.requestedBy || req.userResponse || {};
    const email = (userObj.email || req.email || '').toLowerCase();
    const regNo = (userObj.registrationNumber || req.registrationNumber || '').toLowerCase();
    const name = (userObj.fullName || req.fullName || req.studentName || '').toLowerCase();
    return email.includes(q) || regNo.includes(q) || name.includes(q);
  });

  return (
    <div className="app-admins-page">

      {
        alert && (
          <div className={`auth-alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        )
      }

      {/* Sub Tab Navigation */}
      <div className="profile-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className={`tab-btn ${activeSubTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('view')}
        >
          <ShieldCheck size={16} /> View Admins
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('create')}
        >
          <UserCheck size={16} /> Approve Admin Requests {pendingRequests.length > 0 && <span className="badge badge-warning" style={{ marginLeft: '4px' }}>({pendingRequests.length})</span>}
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('requests')}
        >
          <FileText size={16} /> All Privilege Requests
        </button>
      </div>

      {/* SUB-TAB 1: VIEW ADMINS */}
      {
        activeSubTab === 'view' && (
          <div className="card app-admins-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Registered Application Admins</h2>
                <div style={{ position: 'relative', width: '290px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search email/regno (press Enter)..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (!e.target.value.trim()) setSearchQuery('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSearchQuery(searchInput);
                    }}
                    style={{ paddingLeft: '32px', paddingRight: '10px', height: '36px', fontSize: '0.85rem', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <span className="badge badge-info">{filteredAdmins.length} {filteredAdmins.length === 1 ? 'Admin' : 'Admins'}</span>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading application admins...</p>
            ) : filteredAdmins.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1.5rem 0', textAlign: 'center' }}>
                {searchQuery ? `No admins found matching "${searchQuery}".` : 'No application admins found.'}
              </p>
            ) : (
              <div className="admins-table-wrapper">
                <table className="admins-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Registration No</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((adm, index) => (
                      <tr key={adm.id}>
                        <td>{index + 1}</td>
                        <td className="adm-name-cell">
                          <ShieldCheck size={16} className="adm-icon" style={{ color: '#D97757' }} /> {adm.fullName || adm.name || 'Admin User'}
                        </td>
                        <td>{adm.email || 'N/A'}</td>
                        <td><code>{adm.registrationNumber || 'N/A'}</code></td>
                        <td><span className="badge badge-primary">APP_ADMIN</span></td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm btn-remove"
                            onClick={() => handleRemoveAdmin(adm.id, adm.fullName || adm.email || 'Admin')}
                            title="Remove Application Admin Role"
                            style={{ color: '#e11d48' }}
                          >
                            <Trash2 size={14} /> Remove Admin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      }

      {/* SUB-TAB 2: APPROVE ADMIN REQUESTS */}
      {
        activeSubTab === 'create' && (
          <div className="card form-card">
            <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}><UserCheck size={20} style={{ display: 'inline', marginRight: '6px' }} /> Approve Admin Requests & Grant Privileges</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '2px' }}>
                    Review and approve incoming admin privilege requests to grant Application Admin access.
                  </p>
                </div>
              </div>

              <div style={{ position: 'relative', width: '290px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search requests (press Enter)..."
                  value={createSearchInput}
                  onChange={(e) => {
                    setCreateSearchInput(e.target.value);
                    if (!e.target.value.trim()) setCreateSearchQuery('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setCreateSearchQuery(createSearchInput);
                  }}
                  style={{ paddingLeft: '32px', paddingRight: '10px', height: '36px', fontSize: '0.85rem', borderRadius: '8px' }}
                />
              </div>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading pending admin requests...</p>
            ) : filteredPendingRequests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <h3>{createSearchQuery ? `No requests matching "${createSearchQuery}"` : 'No Pending Admin Privilege Requests'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  When users (Students or Event Admins) submit an admin request from their Profile page, they will appear here for review and approval.
                </p>
              </div>
            ) : (
              <div className="requests-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredPendingRequests.map((req) => {
                  const reqUser = req.requestedBy || req.userResponse || {};
                  const userName = reqUser.fullName || reqUser.name || req.fullName || req.studentName || 'Applicant User';
                  const userEmail = reqUser.email || req.email || 'N/A';
                  const userReg = reqUser.registrationNumber || req.registrationNumber || 'N/A';
                  const userDept = reqUser.department ? `Department of ${reqUser.department}` : '';
                  const userYear = reqUser.year ? `Year ${reqUser.year}` : '';
                  const userPhone = reqUser.phoneNumber ? `Ph: ${reqUser.phoneNumber}` : '';

                  return (
                    <div key={req.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{userName}</h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            <span>{userEmail}</span>
                            <span>•</span>
                            <span>Reg No: <code>{userReg}</code></span>
                            {userDept && (
                              <>
                                <span>•</span>
                                <span>{userDept} {userYear ? `(${userYear})` : ''}</span>
                              </>
                            )}
                            {userPhone && (
                              <>
                                <span>•</span>
                                <span>{userPhone}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="badge badge-warning">Pending Request</span>
                      </div>

                      <p style={{ fontSize: '0.9rem', fontStyle: 'italic', background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        "{req.requestReason}"
                      </p>

                      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleCreateAdminFromRequest(req.id, userName)}
                          disabled={actionLoadingId === req.id}
                        >
                          <Check size={15} /> Approve & Grant Admin
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => openRejectModal(req.id, userName)}
                          disabled={actionLoadingId === req.id}
                        >
                          <X size={15} /> Reject Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      }

      {/* SUB-TAB 3: ALL PRIVILEGE REQUESTS LOG & AUDIT */}
      {
        activeSubTab === 'requests' && (
          <div className="card form-card">
            <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  <FileText size={20} style={{ display: 'inline', marginRight: '6px' }} /> App-Admin Privilege Requests Log
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '2px' }}>
                  Review historical and current privilege requests across all status states.
                </p>
              </div>

              {/* Dropdown Filter + Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                  <select
                    className="form-control"
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    style={{ padding: '0.45rem 2.2rem 0.45rem 0.85rem', fontSize: '0.875rem', lineHeight: '1.4', borderRadius: '8px', minWidth: '130px', cursor: 'pointer' }}
                  >
                    <option value="ALL">All States</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search log (press Enter)..."
                    value={requestSearchInput}
                    onChange={(e) => {
                      setRequestSearchInput(e.target.value);
                      if (!e.target.value.trim()) setRequestSearchQuery('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setRequestSearchQuery(requestSearchInput);
                    }}
                    style={{ paddingLeft: '32px', paddingRight: '10px', height: '36px', fontSize: '0.85rem', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading privilege requests...</p>
            ) : filteredAllRequests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <h3>No requests found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {requestSearchQuery ? `No requests matching "${requestSearchQuery}" in state ${requestStatusFilter}.` : `No requests found for status "${requestStatusFilter}".`}
                </p>
              </div>
            ) : (
              <div className="requests-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredAllRequests.map((req) => {
                  const reqUser = req.requestedBy || req.userResponse || {};
                  const userName = reqUser.fullName || reqUser.name || req.fullName || req.studentName || 'Applicant User';
                  const userEmail = reqUser.email || req.email || 'N/A';
                  const userReg = reqUser.registrationNumber || req.registrationNumber || 'N/A';
                  const userDept = reqUser.department ? `Department of ${reqUser.department}` : '';
                  const userYear = reqUser.year ? `Year ${reqUser.year}` : '';

                  const reviewerObj = req.reviewedBy || {};
                  const reviewerName = typeof reviewerObj === 'object'
                    ? (reviewerObj.fullName || reviewerObj.name || reviewerObj.email)
                    : String(reviewerObj || '');
                  const displayReviewer = reviewerName || (req.status !== 'PENDING' ? 'App Admin' : null);

                  return (
                    <div key={req.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{userName}</h4>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            {userEmail} • Reg No: <code>{userReg}</code> {userDept ? `• ${userDept}` : ''} {userYear ? `(${userYear})` : ''}
                          </p>
                        </div>
                        <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                          {req.status}
                        </span>
                      </div>

                      <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px' }} /> Justification Reason:
                        </p>
                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{req.requestReason}"</p>
                      </div>

                      {(displayReviewer || req.remarks) && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
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
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCreateAdminFromRequest(req.id, userName)}
                            disabled={actionLoadingId === req.id}
                          >
                            <Check size={15} /> Promote to App Admin
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openRejectModal(req.id, userName)}
                            disabled={actionLoadingId === req.id}
                            style={{ color: '#e11d48' }}
                          >
                            <X size={15} /> Reject Request
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      }

      {/* Reject Remarks Modal */}
      {
        rejectModalData && (
          <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(6px)' }}>
            <div style={{ maxWidth: '500px', width: '92%', background: '#1c1a17', color: '#f3f4f6', padding: '1.75rem', borderRadius: '16px', border: '1px solid #383531', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #2d2b27', paddingBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                  <X size={20} /> Reject Request
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectModalData(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a1a1aa' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#d4d4d8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Rejecting privilege request for <strong style={{ color: '#ffffff' }}>{rejectModalData.studentName}</strong>. Provide rejection remarks below for auditing:
              </p>

              <form onSubmit={handleConfirmReject}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', marginBottom: '0.5rem', display: 'block' }}>
                    Rejection Remarks *
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="e.g. Not enough justification provided at this time..."
                    value={rejectRemarks}
                    onChange={(e) => setRejectRemarks(e.target.value)}
                    style={{ width: '100%', resize: 'vertical', background: '#121110', border: '1px solid #383531', color: '#ffffff', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRejectModalData(null)}
                    style={{ background: '#383531', color: '#ffffff', border: '1px solid #524e48', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#e11d48', borderColor: '#e11d48', color: '#ffffff', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)' }}
                    disabled={actionLoadingId === rejectModalData.requestId}
                  >
                    {actionLoadingId === rejectModalData.requestId ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};
