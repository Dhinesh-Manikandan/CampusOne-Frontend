import React from 'react';

export default function AnnouncementsTab({
  events,
  user,
  selectedEventId,
  setSelectedEventId,
  loadAnnouncements,
  editingAnnouncement,
  announcementForm,
  setAnnouncementForm,
  handleSaveAnnouncement,
  cancelEditAnnouncement,
  announcements,
  openEditAnnouncement,
  handleDeleteAnnouncement
}) {
  const isStudent = user?.role === 'STUDENT';
  const availableEvents = isStudent
    ? events
    : events.filter(
        e => String(e.createdBy) === String(user?.id) || user?.role === 'ADMIN' || user?.role === 'APP_ADMIN' || user?.role === 'EVENT_ADMIN'
      );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>Event Noticeboard & Announcements</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {isStudent ? 'View official broadcast alerts and updates for campus events' : 'Post broadcast updates and alerts for registered event participants'}
        </p>
      </div>

      {/* Select Event */}
      <div className="glass-card">
        <div className="form-group">
          <label><i className="fa-solid fa-bullhorn"></i> Select Event Noticeboard</label>
          <select 
            value={selectedEventId || ''} 
            onChange={e => {
              const id = Number(e.target.value);
              setSelectedEventId(id);
              loadAnnouncements(id);
            }}
          >
            <option value="">-- Choose an event --</option>
            {availableEvents.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedEventId ? (
        <div style={{ display: 'grid', gridTemplateColumns: isStudent ? '1fr' : '1fr 1fr', gap: '20px' }}>
          {/* Post Form - Admin Only */}
          {!isStudent && (
            <div className="glass-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', marginBottom: '16px' }}>
                {editingAnnouncement ? 'Edit Announcement' : 'Post New Broadcast Update'}
              </h3>
              <form onSubmit={handleSaveAnnouncement} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Announcement Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Venue Changed to Main Hall B" 
                    value={announcementForm.title}
                    onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Priority Level</label>
                  <select 
                    value={announcementForm.priority}
                    onChange={e => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  >
                    <option value="NORMAL">Normal Info</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea 
                    rows="4" 
                    placeholder="Write clear instructions for participants..." 
                    value={announcementForm.content}
                    onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    required
                  />
                </div>

                <div className="btn-row" style={{ marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-paper-plane"></i> {editingAnnouncement ? 'Save Update' : 'Broadcast Announcement'}
                  </button>
                  {editingAnnouncement && (
                    <button type="button" className="btn btn-secondary" onClick={cancelEditAnnouncement}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Announcements Feed */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', marginBottom: '16px' }}>
              Noticeboard Feed ({announcements.length})
            </h3>

            {announcements.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-comment-slash"></i>
                <p>No announcements posted for this event yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map(item => (
                  <div 
                    key={item.id} 
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${item.priority === 'URGENT' ? '#ef4444' : item.priority === 'IMPORTANT' ? '#f59e0b' : '#3b82f6'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '15px' }}>{item.title}</strong>
                      <span className={`role-pill ${item.priority?.toLowerCase() || 'student'}`} style={{ fontSize: '10px' }}>
                        {item.priority || 'NORMAL'}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                      {item.content}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>{item.postedAt ? new Date(item.postedAt).toLocaleString() : 'Just now'}</span>
                      {!isStudent && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => openEditAnnouncement(item)}>
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleDeleteAnnouncement(item.id)}>
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state glass-card">
          <i className="fa-solid fa-arrow-up"></i>
          <p>Please select an event from the dropdown list above to view noticeboard announcements.</p>
        </div>
      )}
    </div>
  );
}
