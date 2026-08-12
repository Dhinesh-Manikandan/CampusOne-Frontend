import React from 'react';

export default function EventCard({
  event,
  user,
  participantCountMap,
  isEventCreator,
  viewEventDetails,
  handleRegister,
  openEditEventModal,
  handleDeleteEvent,
  setSelectedEventId,
  setActiveTab,
  loadParticipants,
  loadAnnouncements
}) {
  const count = participantCountMap[event.id] ?? event.registeredCount ?? 0;
  const isFull = event.maxParticipants && count >= event.maxParticipants;
  const isCreator = isEventCreator(event);

  return (
    <div className="event-card">
      <span className={`status-badge ${event.status?.toLowerCase() || 'published'}`}>
        {event.status || 'PUBLISHED'}
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
            <i className="fa-solid fa-users"></i> Registered: {count} / {event.maxParticipants || '∞'}
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={() => viewEventDetails(event.id)}>
            <i className="fa-solid fa-circle-info"></i> Details
          </button>

          {(!user || user.role === 'STUDENT') && (
            <button 
              className={`btn btn-sm ${isFull ? 'btn-secondary' : 'btn-primary'}`} 
              disabled={isFull}
              onClick={() => handleRegister(event.id)}
            >
              <i className="fa-solid fa-user-plus"></i> {isFull ? 'Event Full' : 'Register'}
            </button>
          )}

          {isCreator && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => openEditEventModal(event)}>
                <i className="fa-solid fa-pen"></i> Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(event.id)}>
                <i className="fa-solid fa-trash"></i> Delete
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => { 
                  setSelectedEventId(event.id); 
                  setActiveTab('participants'); 
                  loadParticipants(event.id); 
                }}
              >
                <i className="fa-solid fa-users"></i> Participants
              </button>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => { 
                  setSelectedEventId(event.id); 
                  setActiveTab('announcements'); 
                  loadAnnouncements(event.id); 
                }}
              >
                <i className="fa-solid fa-bullhorn"></i> Noticeboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
