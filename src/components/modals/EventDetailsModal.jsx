import React from 'react';
import { formatTime12Hour } from '../../utils/formatTime';

export default function EventDetailsModal({
  showDetailsModal,
  setShowDetailsModal,
  selectedEventDetails,
  participantCountMap
}) {
  if (!showDetailsModal || !selectedEventDetails) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{selectedEventDetails.title}</h3>
          <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {selectedEventDetails.bannerImage && (
          <img src={selectedEventDetails.bannerImage} alt={selectedEventDetails.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
          {selectedEventDetails.description}
        </p>

        {(selectedEventDetails.pdfFile || selectedEventDetails.pdfFileName) && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9em' }}>
              <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: '1.2em' }}></i>
              {selectedEventDetails.pdfFileName || 'Event_Rulebook_Document.pdf'}
            </span>
            <a 
              href={selectedEventDetails.pdfFile || '#'} 
              target="_blank" 
              rel="noreferrer" 
              download={selectedEventDetails.pdfFileName || 'Event_Description.pdf'}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <i className="fa-solid fa-download"></i> View / Download PDF
            </a>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div><strong>Category:</strong> {selectedEventDetails.category}</div>
          <div><strong>Venue:</strong> {selectedEventDetails.venue}</div>
          <div><strong>Date:</strong> {selectedEventDetails.eventDate}</div>
          <div><strong>Time:</strong> {formatTime12Hour(selectedEventDetails.startTime)} - {formatTime12Hour(selectedEventDetails.endTime)}</div>
          <div><strong>Registration Deadline:</strong> {selectedEventDetails.registrationDeadline || 'None'}</div>
          <div><strong>Created By:</strong> {selectedEventDetails.createdByUsername || selectedEventDetails.createdByEmail || 'Event Admin'}</div>
          <div><strong>Registered Count:</strong> {participantCountMap[selectedEventDetails.id] ?? selectedEventDetails.registeredCount ?? 0} / {selectedEventDetails.maxParticipants}</div>
          <div><strong>Status:</strong> <span className={`status-badge ${selectedEventDetails.status?.toLowerCase()}`} style={{ position: 'static' }}>{selectedEventDetails.status}</span></div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
