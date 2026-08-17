import React from 'react';

export default function ParticipantsTab({
  events,
  user,
  selectedEventId,
  setSelectedEventId,
  loadParticipants,
  participantSearch,
  setParticipantSearch,
  participants,
  handleCancelRegistration
}) {
  const isAppAdmin = user?.role === 'ADMIN' || user?.role === 'APP_ADMIN' || (Array.isArray(user?.roles) && user.roles.some(r => r === 'APP_ADMIN' || r?.roleName === 'ROLE_APP_ADMIN'));

  const adminEvents = events.filter(e => {
    if (isAppAdmin) return true;
    const creatorId = typeof e.createdBy === 'object' ? e.createdBy?.id : e.createdBy;
    return String(creatorId) === String(user?.id) || (e.organizerEmail && e.organizerEmail === user?.email);
  });

  const filteredParticipants = (participants || []).filter(reg => {
    if (!participantSearch || !participantSearch.trim()) return true;
    const query = participantSearch.toLowerCase().trim();
    const u = reg.user || {};
    const name = (u.fullName || u.name || u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const regNo = String(u.registrationNumber || u.regNo || '').toLowerCase();
    const dept = String(u.department || '').toLowerCase();

    return name.includes(query) || email.includes(query) || regNo.includes(query) || dept.includes(query);
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>Participant Manager</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>View & search participants registered for your events</p>
      </div>

      {/* Event Selector */}
      <div className="glass-card">
        <div className="form-group">
          <label><i className="fa-solid fa-list-check"></i> Select Event</label>
          <select 
            value={selectedEventId || ''} 
            onChange={e => {
              const id = Number(e.target.value);
              setSelectedEventId(id);
              loadParticipants(id, participantSearch);
            }}
          >
            <option value="">-- Choose an event --</option>
            {adminEvents.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedEventId ? (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px' }}>
              Registered Participants ({filteredParticipants.length})
            </h3>
            <div className="search-box" style={{ width: '280px', marginBottom: 0 }}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                placeholder="Search reg no, name, email..." 
                value={participantSearch}
                onChange={e => {
                  setParticipantSearch(e.target.value);
                  if (!e.target.value.trim()) {
                    loadParticipants(selectedEventId, '');
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    loadParticipants(selectedEventId, participantSearch);
                  }
                }}
              />
            </div>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-user-slash"></i>
              <p>No participants registered or matching filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Reg No</th>
                    <th>Participant Name & Dept</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Registered At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((reg, index) => {
                    const participantUser = reg.user || {};
                    const displayName = participantUser.fullName || participantUser.name || participantUser.username || (participantUser.email ? participantUser.email.split('@')[0] : 'Student Participant');
                    const regNo = participantUser.registrationNumber || 'N/A';
                    const deptInfo = participantUser.department ? `${participantUser.department} (Yr ${participantUser.year || 1})` : '';
                    const participantUserId = participantUser.id || reg.userId;

                    return (
                      <tr key={reg.id}>
                        <td>{index + 1}</td>
                        <td><span className="badge badge-info" style={{ position: 'static' }}>{regNo}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{displayName}</strong>
                              {deptInfo && <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{deptInfo}</div>}
                            </div>
                          </div>
                        </td>
                        <td>{participantUser.email || 'N/A'}</td>
                        <td>
                          <span className="role-pill student">{reg.status || 'REGISTERED'}</span>
                        </td>
                        <td>{reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : 'Recently'}</td>
                        <td>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleCancelRegistration(selectedEventId, participantUserId, displayName)}
                          >
                            <i className="fa-solid fa-user-xmark"></i> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <i className="fa-solid fa-arrow-up"></i>
          <p>Please select an event from the dropdown list above to view registered participants.</p>
        </div>
      )}
    </div>
  );
}
