import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { formatRole, formatRoleClass } from '../../utils/formatRole';

export default function Header({ user, logout, activeTab, isSidebarOpen, toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview & Analytics';
      case 'admin_dashboard': return 'Core Platform & Admin Overview';
      case 'events': return 'All Campus Events Catalog';
      case 'my_events': return 'My Created Events Manager';
      case 'my_registered_events': return 'My Registered Events Hub';
      case 'participants': return 'Participant Manager & Registrations';
      case 'announcements': return 'Noticeboard & Event Updates';
      case 'admin_requests': return 'App-Admin Request Management';
      case 'app_admins': return 'Application Admin Management';
      case 'profile': return 'Student & User Profile';
      case 'access_denied': return 'Access Restricted';
      default: return 'Gather Official Portal';
    }
  };

  return (
    <header className="app-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
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
          <div className="brand-subtitle">Manage application admins, approve incoming privilege requests, and audit request logs.</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Light / Dark Mode Toggle Button */}
        <button
          className="btn btn-secondary btn-sm header-theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{ padding: '7px 13px', display: 'inline-flex', alignItems: 'center', gap: '7px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}
        >
          <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} style={{ fontSize: '13px', color: theme === 'dark' ? '#D97757' : '#5C5A52' }}></i>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'inherit' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Logout Button */}
        {user && (
          <button
            className="btn btn-sm"
            onClick={logout}
            title="Logout"
            style={{
              padding: '7px 12px',
              background: 'rgba(225, 29, 72, 0.1)',
              border: '1.5px solid rgba(225, 29, 72, 0.3)',
              color: '#E11D48',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '13px', color: '#E11D48' }}></i>
          </button>
        )}
      </div>
    </header>
  );
}
