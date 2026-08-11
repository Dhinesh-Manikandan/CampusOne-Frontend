import React from 'react';

export default function SidebarNav({
  activeTab,
  setActiveTab,
  events,
  user,
  logout
}) {
  const myEventsCount = events.filter(e => String(e.createdBy) === String(user?.id)).length;

  return (
    <aside className="official-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-box">
        <div className="brand-icon">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        <div>
          <div className="brand-title">CampusOne</div>
          <div className="brand-subtitle">Official Management Portal</div>
        </div>
      </div>

      {/* Categorized Navigation Groups */}
      <div className="sidebar-nav-scroll">
        <div className="nav-group-label">OVERVIEW</div>
        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Dashboard Summary</span>
        </button>

        <div className="nav-group-label">EVENT HUB</div>
        <button
          className={`sidebar-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <i className="fa-solid fa-calendar-days"></i>
          <span>All Campus Events</span>
          <span className="nav-badge">{events.length}</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'my_events' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_events')}
        >
          <i className="fa-solid fa-folder-open"></i>
          <span>My Created Events</span>
          {myEventsCount > 0 && <span className="nav-badge primary">{myEventsCount}</span>}
        </button>

        <div className="nav-group-label">ADMINISTRATION</div>
        <button
          className={`sidebar-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <i className="fa-solid fa-users"></i>
          <span>Participant Manager</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          <i className="fa-solid fa-bullhorn"></i>
          <span>Noticeboard & Alerts</span>
        </button>
      </div>

      {/* User Footer & Logout */}
      {user && (
        <div className="sidebar-user-footer">
          <div className="user-profile-badge" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none', width: '100%' }}>
            <div className="avatar-circle" style={{ flexShrink: 0 }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div className={`role-pill ${user.role?.toLowerCase()}`} style={{ display: 'inline-flex' }}>
                <i className="fa-solid fa-shield-halved"></i> {user.role}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={logout} title="Logout" style={{ padding: '8px 10px', flexShrink: 0 }}>
              <i className="fa-solid fa-right-from-bracket" style={{ color: '#f43f5e' }}></i>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
