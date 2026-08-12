import React from 'react';

export default function StudentRegisteredEventsTab({
  userRegistrations,
  events,
  handleCancelRegistration,
  setActiveTab,
  viewEventDetails
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>My Registered Campus Events</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Events you have enrolled in as a student</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('events')}>
          <i className="fa-solid fa-calendar-plus"></i> Browse More Events
        </button>
      </div>

      {userRegistrations.length === 0 ? (
        <div className="empty-state glass-card">
          <i className="fa-solid fa-ticket"></i>
          <p>You have not registered for any campus events yet.</p>
          <button className="btn btn-primary" onClick={() => setActiveTab('events')} style={{ marginTop: '12px' }}>
            Explore Campus Catalog
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {userRegistrations.map(reg => {
            const event = reg.event || events.find(e => e.id === reg.eventId) || {};
            if (!event.id && !event.title) return null;

            return (
              <div key={reg.id} className="event-card">
                <span className="status-badge published" style={{ background: 'var(--success-gradient)' }}>
                  <i className="fa-solid fa-circle-check"></i> REGISTERED
                </span>
                {event.bannerImage ? (
                  <img src={event.bannerImage} alt={event.title} className="event-banner" />
                ) : (
                  <div className="event-banner-placeholder">
                    <i className="fa-solid fa-images"></i>
                  </div>
                )}
                <div className="event-content">
                  <div className="event-title">{event.title}</div>
                  <div className="event-description">{event.description}</div>
                  <div className="event-meta">
                    <div className="meta-item">
                      <i className="fa-solid fa-layer-group"></i> {event.category}
                    </div>
                    <div className="meta-item">
                      <i className="fa-solid fa-location-dot"></i> {event.venue}
                    </div>
                    <div className="meta-item">
                      <i className="fa-solid fa-calendar"></i> {event.eventDate} ({event.startTime} - {event.endTime})
                    </div>
                    <div className="meta-item">
                      <i className="fa-solid fa-clock"></i> Enrolled: {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>

                  <div className="btn-row">
                    <button className="btn btn-secondary btn-sm" onClick={() => viewEventDetails(event.id)}>
                      <i className="fa-solid fa-circle-info"></i> View Details
                    </button>

                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleCancelRegistration(event.id, reg.user?.id || reg.userId, reg.user?.fullName || 'yourself')}
                    >
                      <i className="fa-solid fa-user-minus"></i> Cancel Registration
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
