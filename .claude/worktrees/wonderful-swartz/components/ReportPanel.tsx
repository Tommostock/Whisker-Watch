/**
 * ReportPanel Component
 * Form for creating and editing incidents
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Incident } from '@/lib/types';
import { useFormValidation, VALIDATION_RULES } from '@/hooks/useFormValidation';
import { useAppIncidents } from '@/context/AppContext';
import { useAppGeocoding } from '@/context/AppContext';
import { useToast } from '@/components/Toast';
import {
  INCIDENT_STATUS,
  INCIDENT_METHODS,
  INCIDENT_SEVERITY,
  ANIMAL_TYPES,
  AGE_OPTIONS,
  SEX_OPTIONS,
  STATUS_COLORS,
} from '@/lib/constants';

interface ReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: Incident | null;
  initialLat?: number;
  initialLng?: number;
}

interface FormData {
  address: string;
  lat: number;
  lng: number;
  datetime: string;
  status: string;
  method: string;
  severity: string;
  animalType: string;
  age: string;
  sex: string;
  notes: string;
  witnessName: string;
  witnessContact: string;
  witnessStatement: string;
  sightedDesc: string;
}

/**
 * ReportPanel - Form for incident reporting and editing
 *
 * Features:
 * - Create new incidents
 * - Edit existing incidents
 * - Address search with geocoding
 * - All incident fields
 * - Photo upload (TODO)
 * - Validation with error messages
 * - Save/cancel buttons
 */
export const ReportPanel: React.FC<ReportPanelProps> = ({
  isOpen,
  onClose,
  incident,
  initialLat,
  initialLng,
}) => {
  const { createIncident, updateIncident } = useAppIncidents();
  const { geocodeAddress } = useAppGeocoding();
  const { showToast } = useToast();
  const { errors, validate, clearErrors, setFieldError } = useFormValidation(
    VALIDATION_RULES
  );

  const [formData, setFormData] = useState<FormData>({
    address: '',
    lat: initialLat || 51.505,
    lng: initialLng || -0.09,
    datetime: new Date().toISOString().slice(0, 16),
    status: 'unconfirmed',
    method: 'Other/Unknown',
    severity: 'Injured',
    animalType: 'Domestic Cat',
    age: 'Unknown',
    sex: 'Unknown',
    notes: '',
    witnessName: '',
    witnessContact: '',
    witnessStatement: '',
    sightedDesc: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize form with incident data if editing
  useEffect(() => {
    if (incident) {
      setFormData({
        address: incident.address || '',
        lat: incident.lat,
        lng: incident.lng,
        datetime: incident.datetime,
        status: incident.status,
        method: incident.method,
        severity: incident.severity,
        animalType: incident.animalType,
        age: incident.age || 'Unknown',
        sex: incident.sex || 'Unknown',
        notes: incident.notes || '',
        witnessName: incident.witnessName || '',
        witnessContact: incident.witnessContact || '',
        witnessStatement: incident.witnessStatement || '',
        sightedDesc: incident.sightedDesc || '',
      });
    }
  }, [incident]);

  const handleFieldChange = useCallback(
    (field: keyof FormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleGeocode = useCallback(async () => {
    if (!formData.address.trim()) {
      setFieldError('address', 'Please enter an address');
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(formData.address);
      if (result) {
        setFormData((prev) => ({
          ...prev,
          lat: result.lat,
          lng: result.lng,
        }));
        showToast({
          message: `Located: ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`,
          type: 'success',
        });
      } else {
        setFieldError('address', 'Location not found. Please try another address.');
      }
    } catch (err) {
      setFieldError('address', 'Geocoding failed. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  }, [formData.address, geocodeAddress, setFieldError, showToast]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate(formData)) {
        showToast({
          message: 'Please fix validation errors',
          type: 'error',
        });
        return;
      }

      setIsSubmitting(true);
      try {
        if (incident) {
          // Update existing incident
          updateIncident(incident.id, {
            ...formData,
          });
          showToast({
            message: 'Incident updated successfully',
            type: 'success',
          });
        } else {
          // Create new incident
          createIncident({
            ...formData,
          });
          showToast({
            message: 'Incident reported successfully',
            type: 'success',
          });
        }

        clearErrors();
        onClose();
      } catch (err) {
        showToast({
          message: 'Failed to save incident. Please try again.',
          type: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, incident, validate, createIncident, updateIncident, clearErrors, onClose, showToast]
  );

  if (!isOpen) return null;

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
          maxWidth: '600px',
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
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
            {incident ? 'Edit Incident' : 'Report Incident'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Location Section */}
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Location
              </legend>

              {/* Address */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Address *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="Enter address"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      border: errors.address ? '1px solid var(--danger-color)' : '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={isGeocoding}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isGeocoding ? 'wait' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeocoding ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {errors.address && (
                  <div style={{ fontSize: '11px', color: 'var(--danger-color)', marginTop: '4px' }}>
                    {errors.address}
                  </div>
                )}
              </div>

              {/* Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => handleFieldChange('lat', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: errors.lat ? '1px solid var(--danger-color)' : '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.lat && (
                    <div style={{ fontSize: '11px', color: 'var(--danger-color)', marginTop: '4px' }}>
                      {errors.lat}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => handleFieldChange('lng', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: errors.lng ? '1px solid var(--danger-color)' : '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.lng && (
                    <div style={{ fontSize: '11px', color: 'var(--danger-color)', marginTop: '4px' }}>
                      {errors.lng}
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Incident Details Section */}
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Incident Details
              </legend>

              {/* Date/Time */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(e) => handleFieldChange('datetime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: errors.datetime ? '1px solid var(--danger-color)' : '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status, Method, Severity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {Object.entries(INCIDENT_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Method *
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => handleFieldChange('method', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {INCIDENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => handleFieldChange('severity', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {INCIDENT_SEVERITY.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Animal Details Section */}
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Animal Details
              </legend>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Type *
                  </label>
                  <select
                    value={formData.animalType}
                    onChange={(e) => handleFieldChange('animalType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {ANIMAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Age
                  </label>
                  <select
                    value={formData.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {AGE_OPTIONS.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Sex
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleFieldChange('sex', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {SEX_OPTIONS.map((sex) => (
                      <option key={sex} value={sex}>
                        {sex}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Witness & Notes Section */}
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Witness & Notes
              </legend>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Witness Name
                  </label>
                  <input
                    type="text"
                    value={formData.witnessName}
                    onChange={(e) => handleFieldChange('witnessName', e.target.value)}
                    placeholder="Optional"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={formData.witnessContact}
                    onChange={(e) => handleFieldChange('witnessContact', e.target.value)}
                    placeholder="Optional"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Witness Statement
                </label>
                <textarea
                  value={formData.witnessStatement}
                  onChange={(e) => handleFieldChange('witnessStatement', e.target.value)}
                  placeholder="What did the witness say?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Additional notes about the incident..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </fieldset>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'wait' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              {isSubmitting ? 'Saving...' : incident ? 'Update' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReportPanel.displayName = 'ReportPanel';
