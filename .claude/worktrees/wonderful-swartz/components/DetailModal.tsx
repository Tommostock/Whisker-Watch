/**
 * DetailModal Component
 * Full incident details view with photos and case notes
 */

'use client';

import React from 'react';
import { Incident } from '@/lib/types';
import { useAppIncidents } from '@/context/AppContext';
import { ConfirmDialog, useConfirmDialog } from '@/components/ConfirmDialog';
import { Lightbox, useLightbox } from '@/components/Lightbox';
import { STATUS_COLORS } from '@/lib/constants';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onEdit?: (incident: Incident) => void;
}

/**
 * DetailModal - Full incident details view
 *
 * Features:
 * - All incident information
 * - Photo gallery with lightbox
 * - Case notes timeline
 * - Edit and delete buttons
 * - Incident metadata (created/updated dates)
 */
export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  incident,
  onEdit,
}) => {
  const { deleteIncident } = useAppIncidents();
  const { isOpen: confirmOpen, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();
  const { isOpen: lightboxOpen, imageSrc, title: lightboxTitle, openLightbox, closeLightbox } = useLightbox();

  const handleDeleteClick = async () => {
    if (!incident) return;
    openConfirm();
  };

  const handleConfirmDelete = async () => {
    if (!incident) return;
    await handleConfirm(async () => {
      deleteIncident(incident.id);
      onClose();
    });
  };

  if (!isOpen || !incident) return null;

  const statusColor = STATUS_COLORS[incident.status] || '#999';
  const incidentDate = new Date(incident.datetime);
  const createdDate = new Date(incident.createdAt);
  const updatedDate = new Date(incident.updatedAt || incident.createdAt);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              {incident.address || 'Unknown Location'}
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  backgroundColor: statusColor,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {incident.status}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {incidentDate.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {incident.area && (
                <span
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                  }}
                >
                  {incident.area}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              marginLeft: '12px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Location Info */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Location</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Latitude
                </div>
                <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                  {incident.lat.toFixed(4)}°
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Longitude
                </div>
                <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                  {incident.lng.toFixed(4)}°
                </div>
              </div>
            </div>
          </section>

          {/* Incident Details */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Method
                </div>
                <div style={{ fontSize: '13px' }}>{incident.method}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Severity
                </div>
                <div style={{ fontSize: '13px' }}>{incident.severity}</div>
              </div>
            </div>
          </section>

          {/* Animal Info */}
          <section>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Animal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Type
                </div>
                <div style={{ fontSize: '13px' }}>{incident.animalType}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Age
                </div>
                <div style={{ fontSize: '13px' }}>{incident.age}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Sex
                </div>
                <div style={{ fontSize: '13px' }}>{incident.sex}</div>
              </div>
            </div>
          </section>

          {/* Witness Info */}
          {(incident.witnessName || incident.witnessContact || incident.witnessStatement) && (
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Witness</h3>
              {incident.witnessName && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Name
                  </div>
                  <div style={{ fontSize: '13px' }}>{incident.witnessName}</div>
                </div>
              )}
              {incident.witnessContact && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Contact
                  </div>
                  <div style={{ fontSize: '13px', wordBreak: 'break-word' }}>
                    {incident.witnessContact}
                  </div>
                </div>
              )}
              {incident.witnessStatement && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Statement
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    {incident.witnessStatement}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Notes */}
          {incident.notes && (
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Notes</h3>
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {incident.notes}
              </div>
            </section>
          )}

          {/* Sighted Description */}
          {incident.sightedDesc && (
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sighting Details</h3>
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {incident.sightedDesc}
              </div>
            </section>
          )}

          {/* Photos */}
          {incident.photos && incident.photos.length > 0 && (
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Photos ({incident.photos.length})
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px',
                }}
              >
                {incident.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(photo.data)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-secondary)',
                      aspectRatio: '1',
                    }}
                  >
                    <img
                      src={photo.data}
                      alt={`Photo ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                }}
              >
                Click photos to view full size
              </div>
            </section>
          )}

          {/* Case Notes */}
          {incident.caseNotes && incident.caseNotes.length > 0 && (
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Case Notes ({incident.caseNotes.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {incident.caseNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '4px',
                      borderLeft: '3px solid var(--accent-color)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {new Date(note.timestamp).toLocaleDateString('en-GB', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {note.author && (
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          by {note.author}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {note.text}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}
            >
              <div>
                <div>Created</div>
                <div style={{ fontSize: '10px' }}>
                  {createdDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div>
                <div>Updated</div>
                <div style={{ fontSize: '10px' }}>
                  {updatedDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleDeleteClick}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Delete
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(incident)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Edit
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Close
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Incident"
        message="Are you sure you want to delete this incident? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
      />
      <Lightbox
        isOpen={lightboxOpen}
        imageSrc={imageSrc}
        title={lightboxTitle}
        onClose={closeLightbox}
      />
    </div>
  );
};

DetailModal.displayName = 'DetailModal';
