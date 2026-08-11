import React from 'react';
import EventCard from './EventCard';

export default function MyEventsTab({
  events,
  user,
  openCreateEventModal,
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
  const myEvents = events.filter(e => String(e.createdBy) === String(user?.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>My Created Events</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Events created under your account ({user?.email})</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateEventModal}>
          <i className="fa-solid fa-plus"></i> Create New Event
        </button>
      </div>

      {myEvents.length === 0 ? (
        <div className="empty-state glass-card">
          <i className="fa-solid fa-folder-open"></i>
          <p>You have not created any events yet.</p>
          <button className="btn btn-primary" onClick={openCreateEventModal} style={{ marginTop: '12px' }}>
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {myEvents.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              user={user}
              participantCountMap={participantCountMap}
              isEventCreator={isEventCreator}
              viewEventDetails={viewEventDetails}
              handleRegister={handleRegister}
              openEditEventModal={openEditEventModal}
              handleDeleteEvent={handleDeleteEvent}
              setSelectedEventId={setSelectedEventId}
              setActiveTab={setActiveTab}
              loadParticipants={loadParticipants}
              loadAnnouncements={loadAnnouncements}
            />
          ))}
        </div>
      )}
    </div>
  );
}
