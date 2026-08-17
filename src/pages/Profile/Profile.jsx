import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Square,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { adminRequestService } from '../../services/adminRequestService';
import { formatRole, formatRoleClass } from '../../utils/formatRole';
import { formatDateDMY } from '../../utils/formatDate';
import './Profile.css';

const getTabFromPath = (path) => {
  if (path === '/profile/edit') return 'edit';
  if (path === '/profile/password') return 'password';
  if (path === '/profile/request-admin' || path === '/profile/request_admin') return 'request_admin';
  return 'view';
};

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRolesList = (user?.roles || []).map(r => typeof r === 'string' ? r.replace('ROLE_', '') : ((r && r.roleName) ? r.roleName.replace('ROLE_', '') : 'STUDENT'));
  const currentRole = (user?.role || '').replace('ROLE_', '');
  const hasAppAdminRole = currentRole === 'APP_ADMIN' || userRolesList.includes('APP_ADMIN');
  const hasEventAdminRole = hasAppAdminRole || currentRole === 'EVENT_ADMIN' || userRolesList.includes('EVENT_ADMIN');

  const [activeTab, setActiveTabState] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    let currentTab = getTabFromPath(location.pathname);
    if (hasAppAdminRole && currentTab === 'request_admin') {
      currentTab = 'view';
      navigate('/profile/view', { replace: true });
    }
    setActiveTabState(currentTab);
  }, [location.pathname, hasAppAdminRole, navigate]);

  const handleTabChange = (tabKey) => {
    setActiveTabState(tabKey);
    let targetPath = '/profile/view';
    if (tabKey === 'edit') targetPath = '/profile/edit';
    else if (tabKey === 'password') targetPath = '/profile/password';
    else if (tabKey === 'request_admin') targetPath = '/profile/request-admin';
    navigate(targetPath);
  };

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
            onClick={() => handleTabChange('view')}
          >
            <User size={16} /> View Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => handleTabChange('edit')}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => handleTabChange('password')}
          >
            <Key size={16} /> Change Password
          </button>
          {!hasAppAdminRole && (
            <button
              className={`tab-btn ${activeTab === 'request_admin' ? 'active' : ''}`}
              onClick={() => handleTabChange('request_admin')}
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
      {!hasAppAdminRole && activeTab === 'request_admin' && (
        <div className="card form-card">
          <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> Request Administrative Privileges
              </h2>
              <p style={{ margin: '4px 0 0 0' }}>
                Select the admin roles you wish to apply for and provide justification for evaluation by Application Admins.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Refresh page status"
            >
              <RotateCcw size={15} />
              Refresh Status
            </button>
          </div>

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
                {/* Event Admin Selection Card */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: (hasEventAdminRole || hasPendingEventAdmin)
                      ? '1px solid var(--card-border)'
                      : requestEventAdmin
                      ? '1.5px solid #D97757'
                      : '1px solid var(--card-border)',
                    background: (hasEventAdminRole || hasPendingEventAdmin)
                      ? 'var(--bg-card)'
                      : requestEventAdmin
                      ? 'rgba(217, 119, 87, 0.08)'
                      : 'var(--bg-tertiary)',
                    boxShadow: requestEventAdmin && !hasEventAdminRole && !hasPendingEventAdmin ? '0 4px 14px rgba(217, 119, 87, 0.15)' : 'none',
                    opacity: (hasEventAdminRole || hasPendingEventAdmin) ? 0.85 : 1,
                    cursor: (hasEventAdminRole || hasPendingEventAdmin) ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={requestEventAdmin || hasEventAdminRole}
                    disabled={hasEventAdminRole || hasPendingEventAdmin}
                    onChange={(e) => setRequestEventAdmin(e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {hasEventAdminRole ? (
                      <CheckCircle2 size={22} style={{ color: '#10b981' }} />
                    ) : hasPendingEventAdmin ? (
                      <Clock size={22} style={{ color: '#f59e0b' }} />
                    ) : requestEventAdmin ? (
                      <CheckSquare size={22} style={{ color: '#D97757' }} />
                    ) : (
                      <Square size={22} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        Event Admin Access
                      </strong>
                      <span style={{ background: 'rgba(59, 130, 246, 0.14)', color: '#3b82f6', fontSize: '0.725rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                        EVENT_ADMIN
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      {hasEventAdminRole
                        ? '✓ You currently hold the Event Admin role.'
                        : hasPendingEventAdmin
                        ? '⏳ You already have a pending Event Admin request awaiting admin approval.'
                        : 'Allows creating, managing, and publishing campus events and noticeboard announcements.'}
                    </span>
                  </div>
                </label>

                {/* App Admin Selection Card */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: (hasAppAdminRole || hasPendingAppAdmin)
                      ? '1px solid var(--card-border)'
                      : requestAppAdmin
                      ? '1.5px solid #D97757'
                      : '1px solid var(--card-border)',
                    background: (hasAppAdminRole || hasPendingAppAdmin)
                      ? 'var(--bg-card)'
                      : requestAppAdmin
                      ? 'rgba(217, 119, 87, 0.08)'
                      : 'var(--bg-tertiary)',
                    boxShadow: requestAppAdmin && !hasAppAdminRole && !hasPendingAppAdmin ? '0 4px 14px rgba(217, 119, 87, 0.15)' : 'none',
                    opacity: (hasAppAdminRole || hasPendingAppAdmin) ? 0.85 : 1,
                    cursor: (hasAppAdminRole || hasPendingAppAdmin) ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={requestAppAdmin || hasAppAdminRole}
                    disabled={hasAppAdminRole || hasPendingAppAdmin}
                    onChange={(e) => setRequestAppAdmin(e.target.checked)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {hasAppAdminRole ? (
                      <CheckCircle2 size={22} style={{ color: '#10b981' }} />
                    ) : hasPendingAppAdmin ? (
                      <Clock size={22} style={{ color: '#f59e0b' }} />
                    ) : requestAppAdmin ? (
                      <CheckSquare size={22} style={{ color: '#D97757' }} />
                    ) : (
                      <Square size={22} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>
                        Application Admin Access
                      </strong>
                      <span style={{ background: 'rgba(168, 85, 247, 0.14)', color: '#a855f7', fontSize: '0.725rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                        APP_ADMIN
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      {hasAppAdminRole
                        ? '✓ You currently hold the Application Admin role.'
                        : hasPendingAppAdmin
                        ? '⏳ You already have a pending Application Admin request awaiting review.'
                        : 'Full platform administration privileges, including evaluating user privilege requests and managing administrators.'}
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

          {/* Submitted Request Audit History Banner Component at the End */}
          {combinedRequests.length > 0 && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', width: '100%' }}>
              <button
                type="button"
                onClick={() => setShowHistoryLogs((prev) => !prev)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '1.15rem 1.5rem',
                  background: showHistoryLogs
                    ? 'linear-gradient(135deg, rgba(217, 119, 87, 0.22) 0%, rgba(217, 119, 87, 0.08) 50%, var(--bg-tertiary) 100%)'
                    : 'linear-gradient(135deg, rgba(217, 119, 87, 0.14) 0%, rgba(217, 119, 87, 0.04) 50%, var(--bg-tertiary) 100%)',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(217, 119, 87, 0.45)',
                  boxShadow: '0 4px 14px rgba(217, 119, 87, 0.1)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#D97757',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(217, 119, 87, 0.35)',
                      padding: 0
                    }}
                  >
                    <Clock size={20} style={{ display: 'block', margin: 0, width: '20px', height: '20px' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        Submitted Request Status & Audit History
                      </h4>
                      <span
                        style={{
                          background: '#D97757',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        {combinedRequests.length}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, marginTop: '3px' }}>
                      Click to expand and review all administrative role request evaluation logs
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginLeft: 'auto', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      background: showHistoryLogs ? '#D97757' : 'var(--bg-card)',
                      color: showHistoryLogs ? '#ffffff' : 'var(--text-main)',
                      border: '1px solid rgba(217, 119, 87, 0.35)',
                      letterSpacing: '0.02em',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {showHistoryLogs ? 'Hide History' : 'View Audit Logs'}
                  </span>
                  {showHistoryLogs ? (
                    <ChevronUp size={22} style={{ color: '#D97757' }} />
                  ) : (
                    <ChevronDown size={22} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </button>

              {showHistoryLogs && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%',
                    padding: '1.25rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '14px',
                    border: '1px solid var(--card-border)',
                    boxSizing: 'border-box'
                  }}
                >
                  {combinedRequests.map((req) => {
                    const reviewer = req.reviewedBy || {};
                    const reviewerName = reviewer.fullName || reviewer.name || reviewer.email || 'Application Admin';
                    const reviewerEmail = reviewer.email ? `(${reviewer.email})` : '';
                    const isRejected = req.status === 'REJECTED';
                    const isApproved = req.status === 'APPROVED';

                    return (
                      <div
                        key={`${req.roleType}-${req.id}`}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: isRejected ? '1px solid #f43f5e' : isApproved ? '1px solid #10b981' : '1px solid #f59e0b',
                          borderLeft: isRejected ? '5px solid #f43f5e' : isApproved ? '5px solid #10b981' : '5px solid #f59e0b',
                          background: 'var(--bg-card)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {req.roleLabel} Request
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              • Submitted {req.requestedAt ? formatDateDMY(req.requestedAt) : 'recently'}
                            </span>
                          </div>
                          <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                            {req.status}
                          </span>
                        </div>

                        <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.95rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid var(--card-border)' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                            Justification Submitted:
                          </span>
                          <p style={{ fontSize: '0.9rem', margin: 0, fontStyle: 'italic', color: 'var(--text-main)', fontWeight: 500 }}>
                            "{req.requestReason}"
                          </p>
                        </div>

                        {isRejected && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(244, 63, 94, 0.4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e11d48', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                              <XCircle size={16} /> Rejection Remarks:
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, margin: '0 0 0.5rem 0', background: 'rgba(244, 63, 94, 0.08)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                              "{req.remarks || 'No specific remarks provided.'}"
                            </p>
                            <span style={{ fontSize: '0.825rem', color: 'var(--text-main)', fontWeight: 600, display: 'block' }}>
                              Reviewed & Rejected by Admin: <strong>{reviewerName}</strong> {reviewerEmail} {req.reviewedAt ? `on ${formatDateDMY(req.reviewedAt)}` : ''}
                            </span>
                          </div>
                        )}

                        {isApproved && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                            ✓ Approved by Admin: <strong>{reviewerName}</strong> {reviewerEmail} {req.reviewedAt ? `on ${formatDateDMY(req.reviewedAt)}` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
