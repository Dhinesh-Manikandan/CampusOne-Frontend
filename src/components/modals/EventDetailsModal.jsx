import React, { useState, useEffect } from 'react';
import { formatTime12Hour } from '../../utils/formatTime';
import { formatDateDMY } from '../../utils/formatDate';

const base64ToBlobUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const trimmed = dataUrl.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  try {
    let base64 = trimmed;
    if (base64.includes(';base64,')) {
      base64 = base64.split(';base64,')[1];
    } else if (base64.includes(',')) {
      base64 = base64.split(',')[1];
    }
    base64 = base64.replace(/[\r\n\s]/g, '');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error creating PDF Blob URL:', err);
    return null;
  }
};

export default function EventDetailsModal({
  showDetailsModal,
  setShowDetailsModal,
  selectedEventDetails,
  participantCountMap
}) {
  const [showPdfViewer, setShowPdfViewer] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!selectedEventDetails?.pdfFile) {
      setBlobUrl(null);
      return;
    }
    const url = base64ToBlobUrl(selectedEventDetails.pdfFile);
    setBlobUrl(url);

    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedEventDetails?.pdfFile]);

  if (!showDetailsModal || !selectedEventDetails) return null;

  const registeredCount = participantCountMap[selectedEventDetails.id] ?? selectedEventDetails.registeredCount ?? 0;
  const formattedEventDate = formatDateDMY(selectedEventDetails.eventDate);
  const formattedDeadline = selectedEventDetails.registrationDeadline
    ? formatDateDMY(selectedEventDetails.registrationDeadline)
    : 'No Deadline Specified';

  const hasPdf = Boolean(blobUrl || selectedEventDetails.pdfFile || selectedEventDetails.pdfFileName);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '920px', width: '92vw', borderRadius: 'var(--radius-lg)', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <span className={`status-badge ${selectedEventDetails.status?.toLowerCase() || 'published'}`} style={{ position: 'static', display: 'inline-block', marginBottom: '6px' }}>
              {selectedEventDetails.status || 'PUBLISHED'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {selectedEventDetails.title}
            </h2>
          </div>
          <button className="modal-close" onClick={() => { setShowPdfViewer(true); setShowDetailsModal(false); }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Top Side-by-Side Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Left Column: Banner & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
            {selectedEventDetails.bannerImage && (
              <img 
                src={selectedEventDetails.bannerImage} 
                alt={selectedEventDetails.title} 
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} 
              />
            )}

            <div style={{ minWidth: 0 }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                Event Description & Overview
              </h4>
              <p style={{ 
                color: 'var(--text-primary)', 
                fontSize: '13.5px', 
                lineHeight: 1.6, 
                background: 'rgba(255, 255, 255, 0.03)', 
                padding: '14px 16px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)', 
                margin: 0,
                maxHeight: '250px',
                overflowY: 'auto',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedEventDetails.description}
              </p>
            </div>
          </div>

          {/* Right Column: Key Specifications */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 700 }}>
                Key Specifications & Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
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
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Event Date</span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{formattedEventDate}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-clock" style={{ color: '#f59e0b', width: '18px', textAlign: 'center' }}></i>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Timing</span>
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
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Capacity</span>
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
          </div>
        </div>

        {/* Bottom PDF Viewer Section */}
        {hasPdf && (
          <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: showPdfViewer && blobUrl ? '12px' : '0' }}>
              <span 
                onClick={() => setShowPdfViewer(!showPdfViewer)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer' }}
                title="Click to toggle PDF preview"
              >
                <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: '1.5em' }}></i>
                {selectedEventDetails.pdfFileName || 'Event_Rulebook_Document.pdf'}
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {blobUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPdfViewer(!showPdfViewer)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className={`fa-solid ${showPdfViewer ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: '#ef4444' }}></i>
                    {showPdfViewer ? 'Hide PDF' : 'View PDF'}
                  </button>
                )}
                {blobUrl && (
                  <a 
                    href={blobUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-up-right-from-square"></i> Fullscreen
                  </a>
                )}
                {blobUrl && (
                  <a 
                    href={blobUrl} 
                    download={selectedEventDetails.pdfFileName || 'Event_Description.pdf'}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-download"></i> Download PDF
                  </a>
                )}
              </div>
            </div>

            {showPdfViewer && blobUrl && (
              <div style={{ border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '520px', background: '#0f172a' }}>
                <iframe 
                  src={blobUrl} 
                  title={selectedEventDetails.pdfFileName || 'Event Description PDF'} 
                  style={{ width: '100%', height: '100%', border: 'none' }} 
                />
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
