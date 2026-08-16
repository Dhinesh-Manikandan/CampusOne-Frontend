import React from 'react';
import { formatRole, formatRoleClass } from '../../utils/formatRole';

export default function SidebarNav({
  isSidebarOpen,
  toggleSidebar,
  activeTab,
  setActiveTab,
  events = [],
  userRegistrations = [],
  user,
  logout
}) {
  const safeEvents = Array.isArray(events) ? events : [];
  const registeredCount = Array.isArray(userRegistrations) ? userRegistrations.length : 0;

  // Robust Creator Filter
  const myEventsCount = safeEvents.filter(e => {
    const creatorId = typeof e.createdBy === 'object' ? e.createdBy?.id : e.createdBy;
    return String(creatorId) === String(user?.id);
  }).length;

  // Robust Role Normalization
  const getRoleStrings = (u) => {
    if (!u) return [];
    const roles = new Set();
    if (u.role) roles.add(String(u.role).replace(/^ROLE_/, '').toUpperCase());
    if (Array.isArray(u.roles)) {
      u.roles.forEach(r => {
        const val = typeof r === 'string' ? r : (r.roleName || r.name || '');
        if (val) roles.add(String(val).replace(/^ROLE_/, '').toUpperCase());
      });
    }
    return Array.from(roles);
  };

  const userRoles = getRoleStrings(user);
  const isAppAdmin = userRoles.includes('APP_ADMIN') || userRoles.includes('ADMIN');
  const isEventAdmin = isAppAdmin || userRoles.includes('EVENT_ADMIN');
  const isStudent = userRoles.includes('STUDENT') || (!isAppAdmin && !isEventAdmin);

  const displayName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'User Profile');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className={`official-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-box">
        {isSidebarOpen ? (
          <>
            <div className="brand-icon">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div className="brand-title">Gather</div>
              <div className="brand-subtitle">Campus Event Management Platform</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm sidebar-toggle-btn"
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              style={{ marginLeft: 'auto', padding: '6px 10px' }}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm sidebar-toggle-btn"
            onClick={toggleSidebar}
            title="Expand Sidebar"
            style={{ width: '42px', height: '42px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', margin: '0 auto' }}
          >
            <i className="fa-solid fa-angles-right" style={{ fontSize: '15px' }}></i>
          </button>
        )}
      </div>

      {/* Categorized Navigation Groups */}
      <div className="sidebar-nav-scroll">
        {/* 1. APP ADMIN SECTION - Visible to App Admins Only */}
        {isAppAdmin && (
          <>
            {isSidebarOpen && <div className="nav-group-label">APP ADMIN SECTION</div>}
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'admin_dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin_dashboard')}
              title="Admin Core Overview"
            >
              <i className="fa-solid fa-gauge-high"></i>
              {isSidebarOpen && <span>Admin Overview</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'app_admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('app_admins')}
              title="App Admin Management"
            >
              <i className="fa-solid fa-shield-halved"></i>
              {isSidebarOpen && <span>App Admin Management</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'admin_requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin_requests')}
              title="Admin Role Requests"
            >
              <i className="fa-solid fa-user-shield"></i>
              {isSidebarOpen && <span>Role Requests</span>}
            </button>
          </>
        )}

        {/* 2. EVENT ADMIN SECTION - Visible to Event Admins & App Admins */}
        {isEventAdmin && (
          <>
            {isSidebarOpen && <div className="nav-group-label">EVENT ADMIN SECTION</div>}
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'my_events' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_events')}
              title="My Created Events"
            >
              <i className="fa-solid fa-folder-open"></i>
              {isSidebarOpen && <span>My Created Events</span>}
              {isSidebarOpen && myEventsCount > 0 && <span className="nav-badge primary">{myEventsCount}</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
              title="Participant Manager"
            >
              <i className="fa-solid fa-users"></i>
              {isSidebarOpen && <span>Participant Manager</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveTab('announcements')}
              title="Noticeboard & Alerts"
            >
              <i className="fa-solid fa-bullhorn"></i>
              {isSidebarOpen && <span>Noticeboard & Alerts</span>}
            </button>
          </>
        )}

        {/* 3. NORMAL USER SECTION - Visible to All Roles (Students, Event Admins, App Admins) */}
        {isSidebarOpen && <div className="nav-group-label">USER SECTION</div>}
        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title="Dashboard Summary"
        >
          <i className="fa-solid fa-chart-pie"></i>
          {isSidebarOpen && <span>Dashboard Summary</span>}
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
          title="All Campus Events"
        >
          <i className="fa-solid fa-calendar-days"></i>
          {isSidebarOpen && <span>All Campus Events</span>}
          {isSidebarOpen && <span className="nav-badge">{safeEvents.length}</span>}
        </button>

        {/* Student View: My Registered Events */}
        {isStudent && (
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'my_registered_events' ? 'active' : ''}`}
            onClick={() => setActiveTab('my_registered_events')}
            title="My Registered Events"
          >
            <i className="fa-solid fa-ticket"></i>
            {isSidebarOpen && <span>My Registered Events</span>}
            {isSidebarOpen && registeredCount > 0 && <span className="nav-badge primary">{registeredCount}</span>}
          </button>
        )}

        {!isEventAdmin && (
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
            title="Noticeboard & Alerts"
          >
            <i className="fa-solid fa-bullhorn"></i>
            {isSidebarOpen && <span>Noticeboard & Alerts</span>}
          </button>
        )}

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          title="My Profile & Admin Role Requests"
        >
          <i className="fa-solid fa-user-shield"></i>
          {isSidebarOpen && <span>Profile & Admin Requests</span>}
        </button>
      </div>

      {/* 4. STICKY BOTTOM PROFILE SECTION */}
      {user && (
        <div className="sidebar-user-footer" style={{ position: 'sticky', bottom: 0, background: 'var(--bg-surface)', zIndex: 10, paddingTop: '14px' }}>
          <div
            className={`sidebar-profile-card ${activeTab === 'profile' ? 'active-profile' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="View Student Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              gap: isSidebarOpen ? '12px' : '0',
              width: '100%',
              padding: isSidebarOpen ? '10px 12px' : '6px 0',
              borderRadius: isSidebarOpen ? 'var(--radius-md)' : '12px',
              background: activeTab === 'profile' ? '#D97757' : isSidebarOpen ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
              border: activeTab === 'profile' ? '1px solid rgba(255, 255, 255, 0.3)' : isSidebarOpen ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: activeTab === 'profile' ? '#ffffff' : 'var(--text-primary)'
            }}
          >
            <div
              className="avatar-circle"
              style={{
                flexShrink: 0,
                width: isSidebarOpen ? '40px' : '44px',
                height: isSidebarOpen ? '40px' : '44px',
                fontSize: isSidebarOpen ? '16px' : '17px',
                boxShadow: isSidebarOpen ? 'none' : '0 2px 8px rgba(0,0,0,0.15)'
              }}
              title={displayName}
            >
              {initial}
            </div>
            {isSidebarOpen && (
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div className={`role-pill ${formatRoleClass(user.role)}`} style={{ display: 'inline-flex', fontSize: '10px' }}>
                  <i className="fa-solid fa-shield-halved"></i> {formatRole(user.role || 'STUDENT')}
                </div>
              </div>
            )}
            {isSidebarOpen && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                title="Logout"
                style={{
                  padding: '6px 10px',
                  flexShrink: 0,
                  marginLeft: 'auto',
                  background: activeTab === 'profile' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(225, 29, 72, 0.1)',
                  border: activeTab === 'profile' ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(225, 29, 72, 0.25)',
                  color: activeTab === 'profile' ? '#FFFFFF' : '#E11D48',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >
                <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '13px', color: 'inherit' }}></i>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
