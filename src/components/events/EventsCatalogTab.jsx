import React, { useState } from 'react';
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
  registeredEventIds = new Set(),
  viewEventDetails,
  handleRegister,
  openEditEventModal,
  handleDeleteEvent,
  setSelectedEventId,
  setActiveTab,
  loadParticipants,
  loadAnnouncements
}) {
  const [searchInput, setSearchInput] = useState(catalogSearch || '');
  const [viewDeadlineEnded, setViewDeadlineEnded] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const isDeadlinePassed = (event) => {
    if (!event.registrationDeadline) return false;
    return String(event.registrationDeadline) < todayStr;
  };

  const catalogList = filteredEvents.filter(e => !isEventCreator || !isEventCreator(e));

  const activeEvents = catalogList.filter(e => !isDeadlinePassed(e));
  const endedEvents = catalogList.filter(e => isDeadlinePassed(e));

  const displayList = viewDeadlineEnded ? endedEvents : activeEvents;

  return (
    <div>
      {/* Primary Section Filter: Active Events vs Deadline Ended Events */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${!viewDeadlineEnded ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewDeadlineEnded(false)}
          style={{ fontWeight: 700, padding: '10px 18px' }}
        >
          <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i>
          Active Registration Events ({activeEvents.length})
        </button>
        <button
          className={`btn ${viewDeadlineEnded ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewDeadlineEnded(true)}
          style={{ fontWeight: 700, padding: '10px 18px', background: viewDeadlineEnded ? '#ef4444' : undefined, borderColor: viewDeadlineEnded ? '#ef4444' : undefined }}
        >
          <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '6px' }}></i>
          Deadline Ended Events ({endedEvents.length})
        </button>
      </div>

      {/* Toolbar Search & Category Filter */}
      <div className="catalog-toolbar glass-card" style={{ marginBottom: '20px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="Search events (press Enter)..." 
            value={searchInput} 
            onChange={e => {
              setSearchInput(e.target.value);
              if (!e.target.value.trim()) setCatalogSearch('');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') setCatalogSearch(searchInput);
            }}
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

      {/* Context Notice for Deadline Ended Section */}
      {viewDeadlineEnded && (
        <div className="glass-card" style={{ marginBottom: '20px', padding: '14px 18px', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.08)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: '#ef4444', marginRight: '6px' }}></i>
            Registration deadline for these events has ended. You can view event details and brochures, but new registrations are closed.
          </p>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="empty-state glass-card">
          <i className="fa-solid fa-calendar-xmark"></i>
          <p>{viewDeadlineEnded ? 'No past deadline events found.' : 'No active registration events found matching your filter criteria.'}</p>
        </div>
      ) : (
        <div className="events-grid">
          {displayList.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              user={user}
              participantCountMap={participantCountMap}
              isEventCreator={isEventCreator}
              registeredEventIds={registeredEventIds}
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
