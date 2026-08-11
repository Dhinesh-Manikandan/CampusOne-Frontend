import React from 'react';

export default function Header({ user, logout, activeTab, isSidebarOpen, toggleSidebar }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview & Analytics';
      case 'events': return 'All Campus Events Catalog';
      case 'my_events': return 'My Created Events Manager';
      case 'participants': return 'Participant Manager & Registrations';
      case 'announcements': return 'Noticeboard & Event Updates';
      default: return 'CampusOne Event Management';
    }
  };

  return (
    <header className="app-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={toggleSidebar} 
          title={isSidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
          style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-bars" style={{ fontSize: '15px' }}></i>
        </button>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            {getTabTitle()}
          </h2>
          <div className="brand-subtitle">CampusOne Official Management Portal</div>
        </div>
      </div>

      {user && (
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className={`role-pill ${user.role?.toLowerCase()}`}>
              <i className="fa-solid fa-shield-halved"></i> {user.role}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout} title="Logout">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      )}
    </header>
  );
}
