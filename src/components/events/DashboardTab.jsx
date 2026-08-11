import React from 'react';

export default function DashboardTab({
  user,
  dashboardSummary,
  events,
  openCreateEventModal,
  setActiveTab
}) {
  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: '24px', 
          padding: '24px 28px', 
          background: 'var(--primary-gradient)', 
          color: 'white', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-glow)', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}
      >
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, opacity: 0.9, marginBottom: '4px' }}>
            Campus Analytics & Control Center
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
            Welcome back, {user?.name || user?.email || 'Campus User'}! 👋
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.95 }}>
            Logged in as <strong style={{ color: '#ffffff', textDecoration: 'underline' }}>{user?.email}</strong> • Role: <span style={{ background: 'rgba(255,255,255,0.25)', padding: '3px 12px', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>{user?.role || 'STUDENT'}</span>
          </p>
        </div>
        <div className="avatar-circle" style={{ width: '56px', height: '56px', fontSize: '24px', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', flexShrink: 0 }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      {/* Analytics Metrics Cards */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-icon purple">
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div className="metric-info">
            <div className="metric-title">Total Campus Events</div>
            <div className="metric-value">{dashboardSummary?.totalEvents ?? events.length}</div>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon green">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="metric-info">
            <div className="metric-title">Upcoming Events</div>
            <div className="metric-value">{dashboardSummary?.upcomingEvents ?? 0}</div>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon blue">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="metric-info">
            <div className="metric-title">Total Registrations</div>
            <div className="metric-value">{dashboardSummary?.totalRegistrationsSum ?? 0}</div>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon orange">
            <i className="fa-solid fa-flag-checkered"></i>
          </div>
          <div className="metric-info">
            <div className="metric-title">Completed Events</div>
            <div className="metric-value">{dashboardSummary?.completedEvents ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="glass-card" style={{ marginTop: '24px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', marginBottom: '6px' }}>
            Ready to Organize a Campus Event?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Publish workshops, technical hackathons, cultural fests, and track live student analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={openCreateEventModal}>
            <i className="fa-solid fa-plus"></i> Create New Event
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('events')}>
            <i className="fa-solid fa-compass"></i> Explore Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
