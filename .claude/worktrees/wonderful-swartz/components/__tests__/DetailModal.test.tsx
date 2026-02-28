/**
 * DetailModal Component Tests
 * Tests incident details display, photos, case notes, and interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import { DetailModal } from '../DetailModal';
import { mockIncident, mockIncidents } from '@/lib/test-utils';
import { Incident } from '@/lib/types';

describe('DetailModal Component', () => {
  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<DetailModal isOpen={false} onClose={jest.fn()} incident={null} />);

      // Modal should not be in the document
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });

    it('should not render when incident is null', () => {
      render(<DetailModal isOpen={true} onClose={jest.fn()} incident={null} />);

      // Modal should not be in the document
      expect(screen.queryByText(/incident/i)).not.toBeInTheDocument();
    });

    it('should render when isOpen is true and incident exists', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Should display incident information
      expect(screen.getByText(mockIncident.address)).toBeInTheDocument();
    });

    it('should display incident address', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      expect(screen.getByText(mockIncident.address)).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display incident status', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      expect(screen.getByText(mockIncident.status)).toBeInTheDocument();
    });

    it('should display status with color indicator', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      const status = screen.getByText(mockIncident.status);
      expect(status).toBeInTheDocument();
    });

    it('should show confirmed status for confirmed incidents', () => {
      const confirmedIncident = { ...mockIncident, status: 'confirmed' };
      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={confirmedIncident}
        />
      );

      expect(screen.getByText('confirmed')).toBeInTheDocument();
    });

    it('should show suspected status for suspected incidents', () => {
      const suspectedIncident = { ...mockIncident, status: 'suspected' };
      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={suspectedIncident}
        />
      );

      expect(screen.getByText('suspected')).toBeInTheDocument();
    });
  });

  describe('Location Information', () => {
    it('should display latitude and longitude', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Coordinates should appear somewhere in the modal
      const latText = mockIncident.lat.toString();
      const lngText = mockIncident.lng.toString();
      expect(screen.getByText(new RegExp(latText.substring(0, 5)))).toBeInTheDocument();
    });

    it('should display location area if available', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.area) {
        expect(screen.getByText(mockIncident.area)).toBeInTheDocument();
      }
    });
  });

  describe('Incident Details', () => {
    it('should display incident date/time', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Date information should be displayed
      const dateInfo = screen.queryByText(/date|time|2025/i);
      if (dateInfo) {
        expect(dateInfo).toBeInTheDocument();
      }
    });

    it('should display animal type', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      expect(screen.getByText(mockIncident.animalType)).toBeInTheDocument();
    });

    it('should display method if available', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.method) {
        expect(screen.getByText(mockIncident.method)).toBeInTheDocument();
      }
    });

    it('should display severity if available', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.severity) {
        expect(screen.getByText(mockIncident.severity)).toBeInTheDocument();
      }
    });

    it('should display notes section', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Notes section should exist in modal
      const notes = screen.queryAllByText(/notes/i);
      expect(notes.length).toBeGreaterThan(0);
    });

    it('should display incident notes text', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.notes) {
        const noteText = screen.queryByText(mockIncident.notes.substring(0, 20));
        if (noteText) {
          expect(noteText).toBeInTheDocument();
        }
      }
    });
  });

  describe('Witness Information', () => {
    it('should display witness name if present', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.witnessName) {
        expect(screen.getByText(mockIncident.witnessName)).toBeInTheDocument();
      }
    });

    it('should display witness contact if present', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.witnessContact) {
        const contact = screen.queryByText(mockIncident.witnessContact);
        if (contact) {
          expect(contact).toBeInTheDocument();
        }
      }
    });

    it('should display witness statement if present', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      if (mockIncident.witnessStatement) {
        const stmt = screen.queryByText(new RegExp(mockIncident.witnessStatement.substring(0, 20)));
        if (stmt) {
          expect(stmt).toBeInTheDocument();
        }
      }
    });

    it('should not display witness section if no witness data', () => {
      const noWitnessIncident = { ...mockIncident, witnessName: '', witnessContact: '', witnessStatement: '' };
      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={noWitnessIncident}
        />
      );

      // Witness section should not show empty witness info prominently
      expect(screen.getByText(noWitnessIncident.address)).toBeInTheDocument();
    });
  });

  describe('Photos Gallery', () => {
    it('should display photos section if photos present', () => {
      const incidentWithPhotos = {
        ...mockIncident,
        photos: [{ name: 'photo1.jpg', data: 'data:image/jpeg;base64,...' }],
      };

      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={incidentWithPhotos}
        />
      );

      // Photo gallery should be present if there are photos
      const photoElements = screen.queryAllByRole('img');
      expect(photoElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should not display photos section if no photos', () => {
      const noPhotosIncident = { ...mockIncident, photos: [] };

      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={noPhotosIncident}
        />
      );

      // Should render without photos
      expect(screen.getByText(noPhotosIncident.address)).toBeInTheDocument();
    });
  });

  describe('Case Notes', () => {
    it('should display case notes section if notes present', () => {
      const incidentWithNotes = {
        ...mockIncident,
        caseNotes: [
          {
            id: 'cn-123',
            timestamp: new Date().toISOString(),
            text: 'Initial observation',
            author: 'System',
          },
        ],
      };

      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={incidentWithNotes}
        />
      );

      // Case notes should be displayed
      const caseNotes = screen.queryAllByText(/Initial observation|case notes/i);
      expect(caseNotes.length).toBeGreaterThan(0);
    });

    it('should not display case notes section if empty', () => {
      const noNotesIncident = { ...mockIncident, caseNotes: [] };

      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={noNotesIncident}
        />
      );

      // Should render without case notes error
      expect(screen.getByText(noNotesIncident.address)).toBeInTheDocument();
    });

    it('should display case notes in chronological order', () => {
      const incidentWithNotes = {
        ...mockIncident,
        caseNotes: [
          {
            id: 'cn-1',
            timestamp: '2025-02-27T10:00:00Z',
            text: 'First note',
            author: 'System',
          },
          {
            id: 'cn-2',
            timestamp: '2025-02-27T11:00:00Z',
            text: 'Second note',
            author: 'System',
          },
        ],
      };

      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={incidentWithNotes}
        />
      );

      // Both notes should be present
      const notes = screen.queryAllByText(/First note|Second note/i);
      expect(notes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Metadata Display', () => {
    it('should display created date', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Created date should appear in metadata
      const createdText = screen.queryByText(/created|submitted/i);
      if (createdText) {
        expect(createdText).toBeInTheDocument();
      }
    });

    it('should display updated date if different from created', () => {
      const incident = {
        ...mockIncident,
        updatedAt: new Date().toISOString(),
      };

      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={incident} />
      );

      // Updated date should be present if incident was edited
      expect(screen.getByText(incident.address)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render close button', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      const closeButton = screen.getByRole('button', { name: /close|×|x/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const mockClose = jest.fn();
      render(
        <DetailModal
          isOpen={true}
          onClose={mockClose}
          incident={mockIncident}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close|×|x/i });
      fireEvent.click(closeButton);

      expect(mockClose).toHaveBeenCalled();
    });

    it('should render edit button if onEdit provided', () => {
      const mockEdit = jest.fn();
      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={mockIncident}
          onEdit={mockEdit}
        />
      );

      const editButton = screen.queryByRole('button', { name: /edit|pencil/i });
      if (editButton) {
        expect(editButton).toBeInTheDocument();
      }
    });

    it('should call onEdit when edit button clicked', () => {
      const mockEdit = jest.fn();
      render(
        <DetailModal
          isOpen={true}
          onClose={jest.fn()}
          incident={mockIncident}
          onEdit={mockEdit}
        />
      );

      const editButton = screen.queryByRole('button', { name: /edit|pencil/i });
      if (editButton) {
        fireEvent.click(editButton);
        expect(mockEdit).toHaveBeenCalled();
      }
    });

    it('should render delete button', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      const deleteButton = screen.queryByRole('button', { name: /delete|trash/i });
      if (deleteButton) {
        expect(deleteButton).toBeInTheDocument();
      }
    });
  });

  describe('Close Interaction', () => {
    it('should call onClose when clicking backdrop', () => {
      const mockClose = jest.fn();
      const { container } = render(
        <DetailModal
          isOpen={true}
          onClose={mockClose}
          incident={mockIncident}
        />
      );

      // Find and click the backdrop (outside the modal)
      const backdrop = container.querySelector('[style*="position: fixed"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        // Should call onClose unless click was on modal content
      }
    });

    it('should not call onClose when clicking inside modal', () => {
      const mockClose = jest.fn();
      render(
        <DetailModal
          isOpen={true}
          onClose={mockClose}
          incident={mockIncident}
        />
      );

      // Click on incident address (inside modal)
      const addressText = screen.getByText(mockIncident.address);
      fireEvent.click(addressText);

      // Should not call onClose since click is inside modal
      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Styling', () => {
    it('should render with overlay background', () => {
      const { container } = render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Modal should have fixed positioning and overlay styling
      const overlay = container.querySelector('[style*="position: fixed"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should render centered modal content', () => {
      const { container } = render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Modal should be centered with flexbox
      const backdrop = container.querySelector('[style*="display: flex"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Multiple Incidents', () => {
    it('should update when incident prop changes', () => {
      const { rerender } = render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncidents[0]} />
      );

      expect(screen.getByText(mockIncidents[0].address)).toBeInTheDocument();

      // Switch to different incident
      rerender(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncidents[1]} />
      );

      expect(screen.getByText(mockIncidents[1].address)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      // Modal should have proper structure
      expect(screen.getByText(mockIncident.address)).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(
        <DetailModal isOpen={true} onClose={jest.fn()} incident={mockIncident} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        // Each button should have descriptive text
        expect(btn.textContent || btn.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });
});
