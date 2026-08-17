import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building,
  Edit3,
  UserCheck,
  Key,
  User,
  Phone,
  Mail,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Send,
  Clock,
  MessageSquare,
  XCircle,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { adminRequestService } from '../../services/adminRequestService';
import { formatRole, formatRoleClass } from '../../utils/formatRole';
import { formatDateDMY } from '../../utils/formatDate';
import './Profile.css';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'edit', 'password', 'request_admin'

  const userRolesList = (user?.roles || []).map(r => typeof r === 'string' ? r.replace('ROLE_', '') : ((r && r.roleName) ? r.roleName.replace('ROLE_', '') : 'STUDENT'));
  const currentRole = (user?.role || '').replace('ROLE_', '');
  const hasAppAdminRole = currentRole === 'APP_ADMIN' || userRolesList.includes('APP_ADMIN');
  const hasEventAdminRole = hasAppAdminRole || currentRole === 'EVENT_ADMIN' || userRolesList.includes('EVENT_ADMIN');

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    department: '',
    year: '1',
    phoneNumber: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Admin Request Form State
  const [requestReason, setRequestReason] = useState('');
  const [requestAppAdmin, setRequestAppAdmin] = useState(false);
  const [requestEventAdmin, setRequestEventAdmin] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [myAppRequests, setMyAppRequests] = useState([]);
  const [myEventRequests, setMyEventRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const [showHistoryLogs, setShowHistoryLogs] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Populate edit form when user changes or tab switches to edit
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        department: user.department || '',
        year: user.year ? String(user.year) : '1',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'request_admin') {
      fetchMyAdminRequests();
    }
  }, [activeTab]);

  const fetchMyAdminRequests = async () => {
    setLoadingMyRequests(true);
    try {
      const [appData, eventData] = await Promise.all([
        adminRequestService.getMyRequests().catch(() => []),
        adminRequestService.getMyEventAdminRequests().catch(() => [])
      ]);
      setMyAppRequests(Array.isArray(appData) ? appData : []);
      setMyEventRequests(Array.isArray(eventData) ? eventData : []);
    } catch (err) {
      console.error('Failed to fetch my requests:', err);
    } finally {
      setLoadingMyRequests(false);
    }
  };

  const hasPendingAppAdmin = myAppRequests.some(r => r.status === 'PENDING');
  const hasPendingEventAdmin = myEventRequests.some(r => r.status === 'PENDING');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.fullName.trim()) {
      setProfileError('Full Name is required.');
      return;
    }
    if (!profileForm.department.trim()) {
      setProfileError('Department is required.');
      return;
    }
    if (!profileForm.phoneNumber.trim() || !/^[0-9]{10,15}$/.test(profileForm.phoneNumber.trim())) {
      setProfileError('Phone number must contain 10 to 15 digits.');
      return;
    }

    setProfileLoading(true);
    try {
      const updatedUser = await authService.updateProfile(profileForm);
      updateUser(updatedUser);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setProfileSuccess('');
      }, 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordSuccess('');
      }, 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAdminRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestSuccess('');

    if (!requestAppAdmin && !requestEventAdmin) {
      setRequestError('Please select at least one role to request (App Admin or Event Admin).');
      return;
    }
    if (!requestReason.trim()) {
      setRequestError('Please enter your request reason and justification.');
      return;
    }

    setRequestLoading(true);
    try {
      const submittedRoles = [];
      if (requestAppAdmin && !hasAppAdminRole && !hasPendingAppAdmin) {
        await adminRequestService.submitAppAdminRequest(requestReason.trim());
        submittedRoles.push('App Admin');
      }
      if (requestEventAdmin && !hasEventAdminRole && !hasPendingEventAdmin) {
        await adminRequestService.submitEventAdminRequest(requestReason.trim());
        submittedRoles.push('Event Admin');
      }

      if (submittedRoles.length > 0) {
        setRequestSuccess(`Admin request for ${submittedRoles.join(' and ')} submitted successfully!`);
        setRequestReason('');
        setRequestAppAdmin(false);
        setRequestEventAdmin(false);
        fetchMyAdminRequests();
        setTimeout(() => setRequestSuccess(''), 5000);
      } else {
        setRequestError('You already possess or have pending requests for the selected roles.');
      }
    } catch (err) {
      setRequestError(err.message || 'Failed to submit request. You may already have a pending request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const getRolesDisplay = () => {
    if (!user?.roles) return [user?.role || 'STUDENT'];
    if (Array.isArray(user.roles)) {
      return user.roles.map(r => typeof r === 'string' ? r.replace('ROLE_', '') : r.roleName ? r.roleName.replace('ROLE_', '') : 'STUDENT');
    }
    return [user?.role || 'STUDENT'];
  };

  // Gender-neutral initials avatar helpers
  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name = '') => {
    const palettes = [
      { bg: '#D97757', text: '#fff' },   // terracotta
      { bg: '#0891B2', text: '#fff' },   // cyan
      { bg: '#059669', text: '#fff' },   // emerald
      { bg: '#7C3AED', text: '#fff' },   // violet
      { bg: '#DB2777', text: '#fff' },   // pink
      { bg: '#D97706', text: '#fff' },   // amber
      { bg: '#DC2626', text: '#fff' },   // red
      { bg: '#2563EB', text: '#fff' },   // blue
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palettes[Math.abs(hash) % palettes.length];
  };

  const displayName = user?.fullName || user?.name || '';
  const initials = getInitials(displayName || user?.email || 'U');
  const avatarColor = getAvatarColor(displayName || user?.email || 'user');

  // Combine and sort submitted requests
  const combinedRequests = [
    ...myAppRequests.map(r => ({ ...r, roleType: 'APP_ADMIN', roleLabel: 'App Admin' })),
    ...myEventRequests.map(r => ({ ...r, roleType: 'EVENT_ADMIN', roleLabel: 'Event Admin' }))
  ].sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));

  return (
    <div className="profile-page">
      {/* Hero Header Card */}
      <div className="card profile-hero-card">
        <div className="profile-hero-content">
          <div
            className="profile-hero-avatar"
            style={{
              background: avatarColor.bg,
              color: avatarColor.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              userSelect: 'none',
              flexShrink: 0,
            }}
            aria-label={`Avatar for ${displayName || 'User'}`}
          >
            {initials}
          </div>
          <div className="profile-hero-info">
            <h1>{user?.fullName || user?.name || 'Student Profile'}</h1>
            <div className="role-tags-container">
              <Shield size={14} className="icon-badge" />
              <span className="role-label">{getRolesDisplay().length > 1 ? 'Roles:' : 'Role:'}</span>
              {getRolesDisplay().map((r, i) => (
                <span key={i} className={`badge-role badge-role-${formatRoleClass(r)}`}>
                  {formatRole(r)}
                </span>
              ))}
              <span className="reg-sep">•</span>
              <span className="reg-no">Reg No: <strong>{user?.registrationNumber || 'N/A'}</strong></span>
            </div>
            {user?.department && (
              <p className="dept">
                <Building size={14} /> Department of {user?.department} {user?.year ? `(Year ${user.year})` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Profile Action Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <User size={16} /> View Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Key size={16} /> Change Password
          </button>
          <button
            className={`tab-btn ${activeTab === 'request_admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('request_admin')}
          >
            <ShieldAlert size={16} /> Request Admin Rights
          </button>
        </div>
      </div>

      {/* Tab 1: View Profile */}
      {activeTab === 'view' && (
        <div className="profile-details-grid">
          <div className="detail-card">
            <h2><User size={18} /> User Profile Information</h2>
            <div className="detail-list">
              <div className="detail-row">
                <span className="label"><User size={15} /> Full Name</span>
                <span className="value">{user?.fullName || user?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label"><GraduationCap size={15} /> Registration Number</span>
                <span className="value font-mono">{user?.registrationNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label"><Mail size={15} /> Email Address</span>
                <span className="value">{user?.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label"><Phone size={15} /> Phone Number</span>
                <span className="value">{user?.phoneNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label"><Building size={15} /> Department</span>
                <span className="value">{user?.department || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label"><GraduationCap size={15} /> Academic Year</span>
                <span className="value">{user?.year ? `Year ${user.year}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h2><Shield size={18} /> Account Security & Roles</h2>
            <div className="security-box">
              <div className="security-box-header">
                <UserCheck size={28} className="security-icon" />
                <h3>Assigned Permissions</h3>
              </div>
              <div className="roles-pill-list">
                {getRolesDisplay().map((r, i) => (
                  <span key={i} className="role-pill">{formatRole(r)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Profile */}
      {activeTab === 'edit' && (
        <div className="card form-card">
          <div className="form-card-header">
            <h2><Edit3 size={20} /> Edit Personal Information</h2>
            <p>Update your display name, department, academic year, and contact phone number.</p>
          </div>

          {profileSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} /> {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} /> {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label><User size={15} /> Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label><GraduationCap size={15} /> Registration Number</label>
                <input
                  type="text"
                  className="form-control disabled-input"
                  value={user?.registrationNumber || ''}
                  disabled
                  title="Registration number cannot be changed"
                />
                <span className="input-hint">Registration number is immutable.</span>
              </div>

              <div className="form-group">
                <label><Mail size={15} /> Email Address</label>
                <input
                  type="email"
                  className="form-control disabled-input"
                  value={user?.email || ''}
                  disabled
                  title="Email address cannot be changed"
                />
                <span className="input-hint">Email address is linked to university domain.</span>
              </div>

              <div className="form-group">
                <label><Phone size={15} /> Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div className="form-group">
                <label><Building size={15} /> Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>

              <div className="form-group">
                <label><GraduationCap size={15} /> Academic Year</label>
                <select
                  className="form-control"
                  value={profileForm.year}
                  onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                  required
                >
                  <option value="1">Year 1 (Freshman)</option>
                  <option value="2">Year 2 (Sophomore)</option>
                  <option value="3">Year 3 (Junior)</option>
                  <option value="4">Year 4 (Senior)</option>
                  <option value="5">Postgraduate / PhD</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-solid-primary"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving Changes...</>
                ) : (
                  <><Save size={16} /> Save Profile Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Change Password */}
      {activeTab === 'password' && (
        <div className="card form-card">
          <div className="form-card-header">
            <h2><Key size={20} /> Security & Password</h2>
            <p>Ensure your account remains secure by updating your password regularly.</p>
          </div>

          {passwordSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} /> {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} /> {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="password-form-stack" style={{ width: '100%', maxWidth: '750px' }}>
              <div className="form-group" style={{ width: '100%' }}>
                <label><Lock size={15} /> Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="password-inputs-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', width: '100%' }}>
                <div className="form-group" style={{ width: '100%' }}>
                  <label><Key size={15} /> New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ width: '100%' }}>
                  <label><CheckCircle2 size={15} /> Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-solid-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Updating Password...</>
                ) : (
                  <><Key size={16} /> Update Password</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Request Admin Rights */}
      {activeTab === 'request_admin' && (
        <div className="card form-card">
          <div className="form-card-header">
            <h2><ShieldAlert size={20} /> Request Administrative Privileges</h2>
            <p>Select the admin roles you wish to apply for and provide justification for evaluation by Application Admins.</p>
          </div>

          {/* Submitted Request Audit History */}
          {combinedRequests.length > 0 && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} /> Submitted Request Status & Audit History
              </h3>
              {combinedRequests.map((req, index) => {
                const reviewer = req.reviewedBy || {};
                const reviewerName = reviewer.fullName || reviewer.name || reviewer.email || 'Application Admin';
                const reviewerEmail = reviewer.email ? `(${reviewer.email})` : '';

                return (
                  <div
                    key={`${req.roleType}-${req.id}`}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '10px',
                      border: req.status === 'REJECTED' ? '1px solid #f43f5e' : req.status === 'APPROVED' ? '1px solid #10b981' : '1px solid var(--card-border)',
                      background: req.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.06)' : req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-tertiary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge" style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                          {req.roleLabel} Request
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Submitted {req.requestedAt ? formatDateDMY(req.requestedAt) : 'recently'}
                        </span>
                      </div>
                      <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: '6px', marginBottom: '0.75rem', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                        Justification Submitted:
                      </span>
                      <p style={{ fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
                        "{req.requestReason}"
                      </p>
                    </div>

                    {req.status === 'REJECTED' && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(244, 63, 94, 0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e11d48', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                          <XCircle size={16} /> Rejection Remarks:
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, margin: '0 0 0.5rem 0', background: 'var(--bg-card)', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                          "{req.remarks || 'No specific remarks provided.'}"
                        </p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                          Reviewed & Rejected by Admin: <strong>{reviewerName}</strong> {reviewerEmail} {req.reviewedAt ? `on ${formatDateDMY(req.reviewedAt)}` : ''}
                        </span>
                      </div>
                    )}

                    {req.status === 'APPROVED' && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', color: '#10b981', fontWeight: 600 }}>
                        ✓ Approved by Admin: <strong>{reviewerName}</strong> {reviewerEmail} {req.reviewedAt ? `on ${formatDateDMY(req.reviewedAt)}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {requestSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} /> {requestSuccess}
            </div>
          )}
          {requestError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} /> {requestError}
            </div>
          )}

          <form onSubmit={handleAdminRequestSubmit} className="profile-form">
            {/* Checkboxes for requesting App Admin / Event Admin Roles */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                Select Role(s) to Request *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Event Admin Checkbox */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: (hasEventAdminRole || hasPendingEventAdmin) ? '1px solid var(--border-subtle)' : requestEventAdmin ? '1px solid #3b82f6' : '1px solid var(--card-border)',
                    background: (hasEventAdminRole || hasPendingEventAdmin) ? 'rgba(255,255,255,0.02)' : requestEventAdmin ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
                    opacity: (hasEventAdminRole || hasPendingEventAdmin) ? 0.6 : 1,
                    cursor: (hasEventAdminRole || hasPendingEventAdmin) ? 'not-allowed' : 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={requestEventAdmin || hasEventAdminRole}
                    disabled={hasEventAdminRole || hasPendingEventAdmin}
                    onChange={(e) => setRequestEventAdmin(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: (hasEventAdminRole || hasPendingEventAdmin) ? 'not-allowed' : 'pointer' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Event Admin (`EVENT_ADMIN`)</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {hasEventAdminRole
                        ? '✓ You already hold the Event Admin role.'
                        : hasPendingEventAdmin
                        ? '⏳ You already have a pending Event Admin request.'
                        : 'Allows creating, managing, and publishing campus events and noticeboards.'}
                    </span>
                  </div>
                </label>

                {/* App Admin Checkbox */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: (hasAppAdminRole || hasPendingAppAdmin) ? '1px solid var(--border-subtle)' : requestAppAdmin ? '1px solid #3b82f6' : '1px solid var(--card-border)',
                    background: (hasAppAdminRole || hasPendingAppAdmin) ? 'rgba(255,255,255,0.02)' : requestAppAdmin ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
                    opacity: (hasAppAdminRole || hasPendingAppAdmin) ? 0.6 : 1,
                    cursor: (hasAppAdminRole || hasPendingAppAdmin) ? 'not-allowed' : 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={requestAppAdmin || hasAppAdminRole}
                    disabled={hasAppAdminRole || hasPendingAppAdmin}
                    onChange={(e) => setRequestAppAdmin(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: (hasAppAdminRole || hasPendingAppAdmin) ? 'not-allowed' : 'pointer' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Application Admin (`APP_ADMIN`)</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {hasAppAdminRole
                        ? '✓ You already hold the Application Admin role.'
                        : hasPendingAppAdmin
                        ? '⏳ You already have a pending Application Admin request.'
                        : 'Full platform administration privileges, including reviewing user role requests.'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label><MessageSquare size={15} /> Justification & Request Reason *</label>
              <textarea
                className="form-control"
                rows={4}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Provide justification for why you need administrative access..."
                required
              />
              <span className="input-hint">
                Your request will be submitted to Application Admins for official review and approval.
              </span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-solid-primary"
                disabled={requestLoading || (!requestAppAdmin && !requestEventAdmin)}
              >
                {requestLoading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Loader2 size={16} className="animate-spin" /> Submitting Request...</span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Send size={16} /> Submit Role Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
