import React from 'react';
import EventCard from './EventCard';

export default function EventsCatalogTab({
  catalogSearch,
  setCatalogSearch,
  categoryFilter,
  setCategoryFilter,
  filteredEvents,
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
  return (
    <div>
      <div className="catalog-toolbar glass-card" style={{ marginBottom: '20px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Search events by title, venue, or category..." 
            value={catalogSearch} 
            onChange={e => setCatalogSearch(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop'].map(cat => (
            <button 
              key={cat} 
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state glass-card">
          <i className="fa-solid fa-calendar-xmark"></i>
          <p>No events found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
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
