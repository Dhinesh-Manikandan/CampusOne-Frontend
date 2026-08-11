import React from 'react';

export default function DashboardTab({
  dashboardSummary,
  events,
  openCreateEventModal,
  setActiveTab
}) {
  return (
    <div>
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
