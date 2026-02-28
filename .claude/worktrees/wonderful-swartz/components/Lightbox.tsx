/**
 * Lightbox Component
 * Full-screen image viewer with keyboard navigation
 * Extracted from original app behavior
 */

'use client';

import React, { useEffect, useCallback } from 'react';

interface LightboxProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  title?: string;
}

/**
 * Lightbox - full-screen image viewer
 *
 * Usage:
 * const [lightbox, setLightbox] = useState({ isOpen: false, src: '' });
 *
 * <Lightbox
 *   isOpen={lightbox.isOpen}
 *   imageSrc={lightbox.src}
 *   onClose={() => setLightbox({ isOpen: false, src: '' })}
 *   title="Incident Photo"
 * />
 *
 * To open lightbox on click:
 * <img
 *   src={photo.data}
 *   onClick={() => setLightbox({ isOpen: true, src: photo.data })}
 *   style={{ cursor: 'pointer' }}
 * />
 */
export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  imageSrc,
  onClose,
  title,
}) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside image
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="lightbox open"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Image viewer'}
    >
      {/* Close button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        title="Close (Esc)"
        aria-label="Close image viewer"
      >
        ✕
      </button>

      {/* Image container */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          id="lightboxImg"
          src={imageSrc}
          alt={title || 'Full size image'}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Optional title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {title}
        </div>
      )}

      {/* Keyboard hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Press ESC to close
      </div>
    </div>
  );
};

/**
 * Hook for managing lightbox state
 */
export function useLightbox() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState('');
  const [title, setTitle] = React.useState('');

  const openLightbox = (src: string, imageTitle?: string) => {
    setImageSrc(src);
    setTitle(imageTitle || '');
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setImageSrc('');
    setTitle('');
  };

  return {
    isOpen,
    imageSrc,
    title,
    openLightbox,
    closeLightbox,
  };
}

/**
 * Example usage:
 *
 * export function PhotoGallery({ photos }) {
 *   const { isOpen, imageSrc, title, openLightbox, closeLightbox } = useLightbox();
 *
 *   return (
 *     <>
 *       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
 *         {photos.map((photo) => (
 *           <img
 *             key={photo.name}
 *             src={photo.data}
 *             alt={photo.name}
 *             onClick={() => openLightbox(photo.data, photo.name)}
 *             style={{ cursor: 'pointer', width: '100%', aspectRatio: '1' }}
 *           />
 *         ))}
 *       </div>
 *
 *       <Lightbox
 *         isOpen={isOpen}
 *         imageSrc={imageSrc}
 *         title={title}
 *         onClose={closeLightbox}
 *       />
 *     </>
 *   );
 * }
 */
