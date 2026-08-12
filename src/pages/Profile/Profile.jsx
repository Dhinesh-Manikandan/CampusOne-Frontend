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
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { adminRequestService } from '../../services/adminRequestService';
import { formatRole, formatRoleClass } from '../../utils/formatRole';
import './Profile.css';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'edit', 'password', 'request_admin'

  const isAppAdmin = user?.role === 'APP_ADMIN' || (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_APP_ADMIN' || (typeof r === 'string' ? r : r.roleName) === 'APP_ADMIN'));

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
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

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
    if (activeTab === 'request_admin' && !isAppAdmin) {
      fetchMyAdminRequests();
    }
  }, [activeTab]);

  const fetchMyAdminRequests = async () => {
    setLoadingMyRequests(true);
    try {
      const data = await adminRequestService.getMyRequests();
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch my requests:', err);
    } finally {
      setLoadingMyRequests(false);
    }
  };

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

    if (!requestReason.trim()) {
      setRequestError('Please enter your request reason and justification.');
      return;
    }

    setRequestLoading(true);
    try {
      await adminRequestService.submitRequest(requestReason.trim());
      setRequestSuccess('Application Admin request submitted successfully! An Application Admin will review your request.');
      setRequestReason('');
      fetchMyAdminRequests();
      setTimeout(() => {
        setRequestSuccess('');
      }, 5000);
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

  // Derive a warm, consistent hue from the name string (same name = same color always)
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

  return (
    <div className="profile-page">
      {/* Hero Header Card */}
      <div className="card profile-hero-card">
        <div className="profile-hero-content">
          {/* Gender-neutral initials avatar */}
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
              <span className="role-label">Roles:</span>
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
          {!isAppAdmin && (
            <button
              className={`tab-btn ${activeTab === 'request_admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('request_admin')}
            >
              <ShieldAlert size={16} /> Request Admin Rights
            </button>
          )}
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
              {/* <p className="security-note">
                Session authenticated securely via Spring Security JWT Filter.
              </p> */}
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
            <div className="password-form-stack">
              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
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
      {activeTab === 'request_admin' && !isAppAdmin && (
        <div className="card form-card">
          <div className="form-card-header">
            <h2><ShieldAlert size={20} /> Request Application Admin Privileges</h2>
            <p>Students and Event Admins can submit a request for Application Admin privileges to an existing App Admin.</p>
          </div>

          {user?.role === 'APP_ADMIN' ? (
            <div className="alert alert-success" style={{ padding: '1.25rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <CheckCircle2 size={20} /> Application Admin Role Granted
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Your account already holds full Application Admin privileges. You can view, create, and manage admins or review incoming user requests in the Application Admin section.
              </p>
            </div>
          ) : (
            <>
              {/* My Submitted Requests History */}
              {myRequests.length > 0 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} /> Submitted Request Status & Audit History
                  </h3>
                  {myRequests.map((req, index) => {
                    const reviewer = req.reviewedBy || {};
                    const reviewerName = reviewer.fullName || reviewer.name || reviewer.email || 'Application Admin';
                    const reviewerEmail = reviewer.email ? `(${reviewer.email})` : '';

                    return (
                      <div
                        key={req.id}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '10px',
                          border: req.status === 'REJECTED' ? '1px solid #f43f5e' : req.status === 'APPROVED' ? '1px solid #10b981' : '1px solid var(--card-border)',
                          background: req.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.06)' : req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-tertiary)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Request {index + 1} • Submitted {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : 'recently'}
                          </span>
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
                              <XCircle size={16} /> Rejection Remarks from App Admin:
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, margin: '0 0 0.5rem 0', background: 'var(--bg-card)', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                              "{req.remarks || 'No specific remarks provided.'}"
                            </p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                              Reviewed & Rejected by App Admin: <strong>{reviewerName}</strong> {reviewerEmail} {req.reviewedAt ? `on ${new Date(req.reviewedAt).toLocaleString()}` : ''}
                            </span>
                          </div>
                        )}

                        {req.status === 'APPROVED' && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', color: '#10b981', fontWeight: 600 }}>
                            ✓ Approved by App Admin: <strong>{reviewerName}</strong> {reviewerEmail} {req.reviewedAt ? `on ${new Date(req.reviewedAt).toLocaleString()}` : ''}
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
                <div className="form-group">
                  <label><MessageSquare size={15} /> Justification & Request Reason *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Provide justification for why you need Application Admin access (e.g. Managing department events and platform administration)..."
                    required
                  />
                  <span className="input-hint">
                    API: <code>POST /api/app-admin-requests</code>. Your request will be sent to the Application Admin team for approval.
                  </span>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-solid-primary"
                    disabled={requestLoading}
                  >
                    {requestLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Submitting Request...</>
                    ) : (
                      <><Send size={16} /> Submit Admin Request</>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

