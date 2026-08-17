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
      case 'announcements': return 'Campus Noticeboard & Broadcast Alerts';
      case 'admin_announcements': return 'Noticeboard Management & Alerts';
      case 'admin_requests': return 'Administrative Role Requests';
      case 'event_admin_requests': return 'Event Admin Role Requests';
      case 'app_admins': return 'Application Admin Management';
      case 'event_admins': return 'Event Admin Management';
      case 'profile': return 'Student & User Profile';
      case 'access_denied': return 'Access Restricted';
      default: return 'Gather Official Portal';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview of campus events, registrations, and activity metrics.';
      case 'admin_dashboard': return 'Core platform administration, system overview, and platform stats.';
      case 'events': return 'Browse, search, and register for upcoming campus events and workshops.';
      case 'my_events': return 'Manage your organized campus events, update details, and view analytics.';
      case 'my_registered_events': return 'Track your registered campus events and participation status.';
      case 'participants': return 'View and manage registered student participants for your events.';
      case 'announcements': return 'Stay informed with live announcements, campus alerts, and updates.';
      case 'admin_announcements': return 'Post broadcast updates and manage noticeboard alerts for your events.';
      case 'admin_requests': return 'Review, approve, or reject Application Admin and Event Admin privilege requests.';
      case 'event_admin_requests': return 'Review, approve, or reject Event Admin privilege requests.';
      case 'app_admins': return 'Manage application admins, approve incoming privilege requests, and audit logs.';
      case 'event_admins': return 'Manage event admins, approve incoming event admin privilege requests, and audit logs.';
      case 'profile': return 'View and manage your student profile information and credentials.';
      case 'access_denied': return 'You do not have authorization to view the requested section.';
      default: return 'Campus Event Management Platform';
    }
  };

  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #D97757 0%, #C86545 100%)',
        borderRadius: '16px',
        padding: '1.1rem 1.6rem',
        marginBottom: '24px',
        color: '#fff',
        boxShadow: '0 6px 24px rgba(217, 119, 87, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
          style={{
            background: 'rgba(255, 255, 255, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.42)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <i className="fa-solid fa-bars" style={{ fontSize: '15px', color: '#fff' }}></i>
        </button>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#fff' }}>
            {getTabTitle()}
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.92)', margin: 0 }}>
            {getTabSubtitle()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Light / Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.38)',
            backdropFilter: 'blur(8px)',
            padding: '6px 13px',
            borderRadius: '20px',
            fontSize: '0.73rem',
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} style={{ fontSize: '11px', color: '#fff' }}></i>
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Logout Button */}
        {user && (
          <button
            type="button"
            onClick={logout}
            title="Logout"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.38)',
              backdropFilter: 'blur(8px)',
              padding: '6px 13px',
              borderRadius: '20px',
              fontSize: '0.73rem',
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '11px', color: '#fff' }}></i>
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
