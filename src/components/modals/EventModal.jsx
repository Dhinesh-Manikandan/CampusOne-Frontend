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

    // 9. Banner Image URL or Uploaded Data format validation
    if (eventForm.bannerImage && eventForm.bannerImage.trim()) {
      const trimmedBanner = eventForm.bannerImage.trim();
      if (!/^https?:\/\/.+/i.test(trimmedBanner) && !/^data:image\/.+/i.test(trimmedBanner)) {
        showToast('Banner image must be a valid http(s) URL or an uploaded image file', 'error');
        return;
      }
    }

    // All validations passed! Proceed with API call
    handleSaveEvent(e);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '980px', width: '94vw', borderRadius: 'var(--radius-lg)', padding: '24px 28px', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={editingEvent ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-calendar-plus'} style={{ color: 'var(--accent-color, #3b82f6)' }}></i>
              {editingEvent ? 'Edit Event Details' : 'Create New Campus Event'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Fill out the event specifications, timing, and optional attachments below.
            </p>
          </div>
          <button className="modal-close" onClick={() => setShowEventModal(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmitWithValidation}>
          {/* Main 2-Column Side-by-Side Container */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px', marginBottom: '20px' }}>
            
            {/* Left Column: Information & Media */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#3b82f6' }}></i> 1. Event Overview & Media
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Tech Hackathon 2026"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Category *</label>
                  <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Event Status</label>
                  <select value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })} style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <option value="UPCOMING">Published / Upcoming</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Description * <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>(Min 10 chars)</span></label>
                <textarea
                  rows="3"
                  placeholder="Detailed description of event schedule, guidelines, rules..."
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  required
                  style={{ padding: '8px 12px', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Banner Image Upload Block */}
              <div className="form-group" style={{ marginTop: '2px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600 }}>
                  <span>Banner Image <span style={{ fontSize: '0.85em', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span></span>
                  <span style={{ fontSize: '0.8em', color: '#ef4444', fontWeight: 700 }}>[Max 5 MB]</span>
                </label>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                    id="event-banner-upload-input"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
                        if (!validTypes.includes(file.type) && !/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
                          showToast('Please upload a valid image file (PNG, JPG, WEBP, GIF, SVG)', 'error');
                          e.target.value = '';
                          return;
                        }
                        const maxSizeMB = 5;
                        if (file.size > maxSizeMB * 1024 * 1024) {
                          showToast(`Selected image exceeds maximum allowed size limit of ${maxSizeMB} MB. Please upload a smaller image.`, 'error');
                          e.target.value = '';
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEventForm(prev => ({
                            ...prev,
                            bannerImage: ev.target.result
                          }));
                          showToast(`Uploaded banner image "${file.name}"`);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => document.getElementById('event-banner-upload-input').click()}
                  >
                    <i className="fa-solid fa-image" style={{ color: '#3b82f6' }}></i>
                    {eventForm.bannerImage ? 'Change Image' : 'Upload Image'}
                  </button>

                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <input
                      type="text"
                      placeholder="Or image URL (https://...)"
                      value={eventForm.bannerImage?.startsWith('data:') ? '' : (eventForm.bannerImage || '')}
                      onChange={e => setEventForm({ ...eventForm, bannerImage: e.target.value })}
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
                    />
                  </div>

                  {eventForm.bannerImage && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444', padding: '4px 8px' }}
                      onClick={() => setEventForm(prev => ({ ...prev, bannerImage: '' }))}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>

                {eventForm.bannerImage && (
                  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={eventForm.bannerImage} 
                      alt="Banner Preview" 
                      style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Schedule, Venue & Rulebook */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i> 2. Schedule, Location & Attachments
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Venue / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium Hall A"
                    value={eventForm.venue}
                    onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Maximum Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={eventForm.maxParticipants}
                    onChange={e => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Event Date *</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Registration Deadline *</label>
                  <input
                    type="date"
                    value={eventForm.registrationDeadline}
                    onChange={e => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Start Time *</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>End Time *</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* PDF Rulebook Upload Block */}
              <div className="form-group" style={{ marginTop: '4px', background: 'rgba(239, 68, 68, 0.06)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                  <span>Event PDF / Rulebook <span style={{ fontSize: '0.85em', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span></span>
                  <span style={{ fontSize: '0.8em', color: '#ef4444', fontWeight: 700 }}>[Max 10 MB]</span>
                </label>

                {eventForm.pdfFileName && (
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, margin: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i>
                    {eventForm.pdfFileName}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
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
                          e.target.value = '';
                          return;
                        }
                        const maxSizeMB = 10;
                        if (file.size > maxSizeMB * 1024 * 1024) {
                          showToast(`Selected PDF exceeds maximum allowed size limit of ${maxSizeMB} MB. Please upload a smaller document.`, 'error');
                          e.target.value = '';
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
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => document.getElementById('event-pdf-upload-input').click()}
                  >
                    <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i>
                    {eventForm.pdfFileName ? 'Change PDF Document' : 'Upload Event Description PDF'}
                  </button>
                  {eventForm.pdfFileName && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      onClick={() => setEventForm(prev => ({ ...prev, pdfFile: null, pdfFileName: '' }))}
                    >
                      <i className="fa-solid fa-trash"></i> Remove
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                  Supported format: PDF (.pdf) up to 10 MB.
                </p>
              </div>

            </div>
          </div>

          {/* Action Bar */}
          <div className="btn-row" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-floppy-disk"></i> {editingEvent ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
