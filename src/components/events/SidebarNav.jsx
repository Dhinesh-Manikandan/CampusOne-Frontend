import React from 'react';

export default function SidebarNav({
  isSidebarOpen,
  toggleSidebar,
  activeTab,
  setActiveTab,
  events,
  user,
  logout
}) {
  const myEventsCount = events.filter(e => String(e.createdBy) === String(user?.id)).length;

  return (
    <aside className={`official-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-box">
        <div className="brand-icon">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        {isSidebarOpen && (
          <div>
            <div className="brand-title">CampusOne</div>
            <div className="brand-subtitle">Official Management Portal</div>
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
        {isSidebarOpen && <div className="nav-group-label">OVERVIEW</div>}
        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title="Dashboard Summary"
        >
          <i className="fa-solid fa-chart-pie"></i>
          {isSidebarOpen && <span>Dashboard Summary</span>}
        </button>

        {isSidebarOpen && <div className="nav-group-label">EVENT HUB</div>}
        <button
          className={`sidebar-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
          title="All Campus Events"
        >
          <i className="fa-solid fa-calendar-days"></i>
          {isSidebarOpen && <span>All Campus Events</span>}
          {isSidebarOpen && <span className="nav-badge">{events.length}</span>}
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'my_events' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_events')}
          title="My Created Events"
        >
          <i className="fa-solid fa-folder-open"></i>
          {isSidebarOpen && <span>My Created Events</span>}
          {isSidebarOpen && myEventsCount > 0 && <span className="nav-badge primary">{myEventsCount}</span>}
        </button>

        {isSidebarOpen && <div className="nav-group-label">ADMINISTRATION</div>}
        <button
          className={`sidebar-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
          title="Participant Manager"
        >
          <i className="fa-solid fa-users"></i>
          {isSidebarOpen && <span>Participant Manager</span>}
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
          title="Noticeboard & Alerts"
        >
          <i className="fa-solid fa-bullhorn"></i>
          {isSidebarOpen && <span>Noticeboard & Alerts</span>}
        </button>
      </div>

      {/* User Footer & Logout */}
      {user && (
        <div className="sidebar-user-footer">
          <div className="user-profile-badge" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none', width: '100%', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
            <div className="avatar-circle" style={{ flexShrink: 0 }} title={user.name || user.email}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {isSidebarOpen && (
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div className={`role-pill ${user.role?.toLowerCase()}`} style={{ display: 'inline-flex' }}>
                  <i className="fa-solid fa-shield-halved"></i> {user.role}
                </div>
              </div>
            )}
            {isSidebarOpen && (
              <button className="btn btn-secondary btn-sm" onClick={logout} title="Logout" style={{ padding: '8px 10px', flexShrink: 0 }}>
                <i className="fa-solid fa-right-from-bracket" style={{ color: '#f43f5e' }}></i>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
