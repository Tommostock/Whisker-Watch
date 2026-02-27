/**
 * ConfirmDialog Component
 * Modal confirmation dialog for delete actions
 * Extracted from original app behavior
 */

'use client';

import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * ConfirmDialog - modal confirmation for destructive actions
 *
 * Usage:
 * const [showConfirm, setShowConfirm] = useState(false);
 *
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   message="Delete this incident permanently?"
 *   onConfirm={() => { deleteIncident(id); setShowConfirm(false); }}
 *   onCancel={() => setShowConfirm(false)}
 *   isDanger
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ display: 'flex' }}>
      <div className="modal" style={{ maxWidth: '340px' }}>
        <div className="modal-hdr">
          <div className="modal-title">{title}</div>
          <div
            className="modal-x"
            onClick={onCancel}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            ✕
          </div>
        </div>

        <div className="modal-body">
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>

        <div className="modal-ftr">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for managing confirm dialog state
 * Returns: [isOpen, openConfirm, closeConfirm, confirmed]
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const openConfirm = () => {
    setIsOpen(true);
    setConfirmed(false);
  };

  const closeConfirm = () => {
    setIsOpen(false);
    setConfirmed(false);
    setIsLoading(false);
  };

  const handleConfirm = async (callback?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      }
      setConfirmed(true);
    } finally {
      setIsLoading(false);
      closeConfirm();
    }
  };

  return {
    isOpen,
    openConfirm,
    closeConfirm,
    handleConfirm,
    confirmed,
    isLoading,
  };
}

/**
 * Example usage:
 *
 * export function DeleteIncidentButton({ incidentId }) {
 *   const { isOpen, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();
 *   const { deleteIncident } = useAppIncidents();
 *
 *   return (
 *     <>
 *       <button onClick={openConfirm}>Delete</button>
 *
 *       <ConfirmDialog
 *         isOpen={isOpen}
 *         title="Delete Incident"
 *         message="Delete this incident permanently? This cannot be undone."
 *         confirmText="Delete"
 *         isDanger
 *         onConfirm={() =>
 *           handleConfirm(async () => {
 *             deleteIncident(incidentId);
 *           })
 *         }
 *         onCancel={closeConfirm}
 *       />
 *     </>
 *   );
 * }
 */
