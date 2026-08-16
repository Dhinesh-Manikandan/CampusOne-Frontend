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
  const myEventsCount = safeEvents.filter(e => String(e.createdBy) === String(user?.id)).length;
  const registeredCount = userRegistrations.length;

  const userRole = (user?.role || '').toUpperCase();
  const isStudent = userRole === 'STUDENT' || (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_STUDENT'));
  const isAppAdmin = userRole === 'APP_ADMIN' || (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_APP_ADMIN' || r === 'APP_ADMIN'));
  const isEventAdmin = isAppAdmin || userRole === 'EVENT_ADMIN' || (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_EVENT_ADMIN' || r === 'EVENT_ADMIN'));

  return (
    <aside className={`official-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-box">
        <div className="brand-icon">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        {isSidebarOpen && (
          <div>
            <div className="brand-title">Gather</div>
            <div className="brand-subtitle">Campus Event Management Platform</div>
          </div>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          style={{ marginLeft: isSidebarOpen ? 'auto' : '0', padding: '6px 10px' }}
        >
          <i className={isSidebarOpen ? "fa-solid fa-chevron-left" : "fa-solid fa-angles-right"}></i>
        </button>
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

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'admin_requests' || activeTab === 'event_admin_requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin_requests')}
              title="Event Admin Role Requests"
            >
              <i className="fa-solid fa-user-check"></i>
              {isSidebarOpen && <span>Event Admin Requests</span>}
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

      {/* 4. STICKY BOTTOM PROFILE SECTION (Common to All 3 Roles) */}
      {user && (
        <div className="sidebar-user-footer" style={{ position: 'sticky', bottom: 0, background: 'var(--bg-surface)', zIndex: 10, paddingTop: '14px' }}>
          <div
            className={`sidebar-profile-card ${activeTab === 'profile' ? 'active-profile' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="View Student Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'profile' ? '#D97757' : 'rgba(255, 255, 255, 0.04)',
              border: activeTab === 'profile' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: activeTab === 'profile' ? '#ffffff' : 'var(--text-primary)'
            }}
          >
            <div className="avatar-circle" style={{ flexShrink: 0 }} title={user.name || user.email}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {isSidebarOpen && (
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || user.fullName || 'User Profile'}
                </div>
                <div className={`role-pill ${formatRoleClass(user.role)}`} style={{ display: 'inline-flex', fontSize: '10px' }}>
                  <i className="fa-solid fa-shield-halved"></i> {formatRole(user.role || 'STUDENT')}
                </div>
              </div>
            )}
            {isSidebarOpen && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                title="Logout"
                style={{ padding: '6px 8px', flexShrink: 0, marginLeft: 'auto' }}
              >
                <i className="fa-solid fa-right-from-bracket" style={{ color: activeTab === 'profile' ? '#ffffff' : '#f43f5e' }}></i>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
