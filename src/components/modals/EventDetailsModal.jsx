import React from 'react';
import { formatTime12Hour } from '../../utils/formatTime';
import { formatDateDMY } from '../../utils/formatDate';

export default function EventDetailsModal({
  showDetailsModal,
  setShowDetailsModal,
  selectedEventDetails,
  participantCountMap
}) {
  if (!showDetailsModal || !selectedEventDetails) return null;

  const registeredCount = participantCountMap[selectedEventDetails.id] ?? selectedEventDetails.registeredCount ?? 0;
  const formattedEventDate = formatDateDMY(selectedEventDetails.eventDate);
  const formattedDeadline = selectedEventDetails.registrationDeadline
    ? formatDateDMY(selectedEventDetails.registrationDeadline)
    : 'No Deadline Specified';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px', width: '92%', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <div className="modal-header" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <span className={`status-badge ${selectedEventDetails.status?.toLowerCase() || 'published'}`} style={{ position: 'static', display: 'inline-block', marginBottom: '6px' }}>
              {selectedEventDetails.status || 'PUBLISHED'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {selectedEventDetails.title}
            </h2>
          </div>
          <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {selectedEventDetails.bannerImage && (
          <img 
            src={selectedEventDetails.bannerImage} 
            alt={selectedEventDetails.title} 
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-subtle)' }} 
          />
        )}

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
            Event Description & Overview
          </h4>
          <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, background: 'rgba(255, 255, 255, 0.03)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', margin: 0 }}>
            {selectedEventDetails.description}
          </p>
        </div>

        {(selectedEventDetails.pdfFile || selectedEventDetails.pdfFileName) && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
              <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: '1.3em' }}></i>
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
              <i className="fa-solid fa-download"></i> Download Rulebook PDF
            </a>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 700 }}>
            Key Specifications & Details
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-layer-group" style={{ color: '#3b82f6', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{selectedEventDetails.category}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Venue / Location</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{selectedEventDetails.venue}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-calendar-day" style={{ color: '#10b981', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Event Date (DD/MM/YYYY)</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{formattedEventDate}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-clock" style={{ color: '#f59e0b', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Timing (AM/PM)</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  {formatTime12Hour(selectedEventDetails.startTime)} - {formatTime12Hour(selectedEventDetails.endTime)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-calendar-xmark" style={{ color: '#ec4899', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Registration Deadline</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{formattedDeadline}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-users" style={{ color: '#8b5cf6', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Registered Capacity</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{registeredCount} / {selectedEventDetails.maxParticipants || '∞'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-user-shield" style={{ color: '#06b6d4', width: '18px', textAlign: 'center' }}></i>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Organized By</span>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{selectedEventDetails.createdByUsername || selectedEventDetails.createdByEmail || 'Event Admin'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
