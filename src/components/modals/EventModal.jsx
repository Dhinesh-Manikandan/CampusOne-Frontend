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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingEvent ? 'Edit Event Details' : 'Create New Campus Event'}</h3>
          <button className="modal-close" onClick={() => setShowEventModal(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form onSubmit={handleSaveEvent} className="form-grid">
          <div className="form-group full-width">
            <label>Event Title</label>
            <input 
              type="text" 
              placeholder="e.g. Annual Tech Hackathon 2026" 
              value={eventForm.title} 
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Academic">Academic</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          <div className="form-group">
            <label>Venue / Location</label>
            <input 
              type="text" 
              placeholder="e.g. Auditorium Hall A" 
              value={eventForm.venue} 
              onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Event Date</label>
            <input 
              type="date" 
              value={eventForm.eventDate} 
              onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Registration Deadline</label>
            <input 
              type="date" 
              value={eventForm.registrationDeadline} 
              onChange={e => setEventForm({ ...eventForm, registrationDeadline: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input 
              type="time" 
              value={eventForm.startTime} 
              onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input 
              type="time" 
              value={eventForm.endTime} 
              onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Maximum Capacity</label>
            <input 
              type="number" 
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
            <label>Banner Image URL</label>
            <input 
              type="text" 
              placeholder="https://images.unsplash.com/..." 
              value={eventForm.bannerImage} 
              onChange={e => setEventForm({ ...eventForm, bannerImage: e.target.value })} 
            />
          </div>
          <div className="form-group full-width">
            <label>Description</label>
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
