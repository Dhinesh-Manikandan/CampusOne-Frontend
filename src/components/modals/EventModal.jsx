import React from 'react';

export default function EventModal({
  showEventModal,
  setShowEventModal,
  editingEvent,
  eventForm,
  setEventForm,
  handleSaveEvent,
  showToast
}) {
  if (!showEventModal) return null;

  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().slice(0, 5); // "HH:MM"

    // 1. Title validation
    if (!eventForm.title || eventForm.title.trim().length < 3) {
      showToast('Event title must be at least 3 characters long', 'error');
      return;
    }

    // 2. Description validation
    if (!eventForm.description || eventForm.description.trim().length < 10) {
      showToast('Event description must be at least 10 characters long', 'error');
      return;
    }

    // 3. Venue validation
    if (!eventForm.venue || !eventForm.venue.trim()) {
      showToast('Venue / Location is required', 'error');
      return;
    }

    // 4. Event Date validation (cannot be in the past)
    if (!eventForm.eventDate) {
      showToast('Event date is required', 'error');
      return;
    }
    if (eventForm.eventDate < todayStr && !editingEvent) {
      showToast('Event date cannot be in the past', 'error');
      return;
    }

    // 5. Registration Deadline validation (must be on or before event date)
    if (!eventForm.registrationDeadline) {
      showToast('Registration deadline is required', 'error');
      return;
    }
    if (eventForm.registrationDeadline > eventForm.eventDate) {
      showToast('Registration deadline must be on or before the event date', 'error');
      return;
    }

    // 6. Time validation (startTime < endTime)
    if (eventForm.startTime && eventForm.endTime && eventForm.startTime >= eventForm.endTime) {
      showToast('End time must be strictly after start time', 'error');
      return;
    }

    // 7. Same day start time validation
    if (eventForm.eventDate === todayStr && eventForm.startTime && eventForm.startTime < nowTimeStr && !editingEvent) {
      showToast('Start time cannot be in the past for today’s event', 'error');
      return;
    }

    // 8. Max capacity validation
    const capacity = Number(eventForm.maxParticipants);
    if (isNaN(capacity) || capacity < 1) {
      showToast('Maximum capacity must be at least 1 participant', 'error');
      return;
    }

    // 9. Banner Image URL format validation
    if (eventForm.bannerImage && eventForm.bannerImage.trim() && !/^https?:\/\/.+/i.test(eventForm.bannerImage.trim())) {
      showToast('Banner image URL must start with http:// or https://', 'error');
      return;
    }

    // All validations passed! Proceed with API call
    handleSaveEvent(e);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingEvent ? 'Edit Event Details' : 'Create New Campus Event'}</h3>
          <button className="modal-close" onClick={() => setShowEventModal(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form onSubmit={handleSubmitWithValidation} className="form-grid">
          <div className="form-group full-width">
            <label>Event Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Annual Tech Hackathon 2026" 
              value={eventForm.title} 
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Academic">Academic</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          <div className="form-group">
            <label>Venue / Location *</label>
            <input 
              type="text" 
              placeholder="e.g. Auditorium Hall A" 
              value={eventForm.venue} 
              onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Event Date *</label>
            <input 
              type="date" 
              value={eventForm.eventDate} 
              onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Registration Deadline * <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>(Before or on Event Date)</span></label>
            <input 
              type="date" 
              value={eventForm.registrationDeadline} 
              onChange={e => setEventForm({ ...eventForm, registrationDeadline: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Start Time * <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>(Specify AM/PM e.g. 09:30 AM)</span></label>
            <input 
              type="time" 
              value={eventForm.startTime} 
              onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>End Time * <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>(Specify AM/PM e.g. 05:30 PM)</span></label>
            <input 
              type="time" 
              value={eventForm.endTime} 
              onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Maximum Capacity *</label>
            <input 
              type="number" 
              min="1"
              value={eventForm.maxParticipants} 
              onChange={e => setEventForm({ ...eventForm, maxParticipants: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Event Status</label>
            <select value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })}>
              <option value="UPCOMING">Published / Upcoming</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label>Banner Image URL <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>(Optional, must start with http:// or https://)</span></label>
            <input 
              type="text" 
              placeholder="https://images.unsplash.com/..." 
              value={eventForm.bannerImage} 
              onChange={e => setEventForm({ ...eventForm, bannerImage: e.target.value })} 
            />
          </div>
          <div className="form-group full-width">
            <label>Description * <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>(Minimum 10 characters)</span></label>
            <textarea 
              rows="3" 
              placeholder="Detailed description of event schedule and guidelines..." 
              value={eventForm.description} 
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: '4px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Event Description PDF / Rulebook <span style={{ fontSize: '0.85em', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span></span>
              {eventForm.pdfFileName && (
                <span style={{ fontSize: '0.85em', color: '#10b981', fontWeight: 600 }}>
                  📄 {eventForm.pdfFileName}
                </span>
              )}
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
              <input 
                type="file" 
                accept=".pdf,application/pdf"
                id="event-pdf-upload-input"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                      showToast('Please upload a valid PDF document', 'error');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setEventForm(prev => ({
                        ...prev,
                        pdfFile: ev.target.result,
                        pdfFileName: file.name
                      }));
                      showToast(`Attached PDF document "${file.name}"`);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                onClick={() => document.getElementById('event-pdf-upload-input').click()}
              >
                <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i>
                {eventForm.pdfFileName ? 'Change PDF File' : 'Upload Event Description PDF'}
              </button>
              {eventForm.pdfFileName && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444' }}
                  onClick={() => setEventForm(prev => ({ ...prev, pdfFile: null, pdfFileName: '' }))}
                >
                  <i className="fa-solid fa-trash"></i> Remove PDF
                </button>
              )}
            </div>
          </div>

          <div className="btn-row full-width" style={{ gridColumn: 'span 2', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-floppy-disk"></i> {editingEvent ? 'Save Changes' : 'Publish Event'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
