/**
 * useFormValidation Hook
 * Handles form validation and error state management
 */

import { useState, useCallback, useMemo } from 'react';
import { COORDINATE_BOUNDS } from '@/lib/constants';

export interface FormErrors {
  [field: string]: string;
}

export interface ValidationRules {
  [field: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export interface FormValidationHook {
  errors: FormErrors;
  isValid: boolean;
  validate: (formData: Record<string, any>) => boolean;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearErrors: () => void;
  validateField: (field: string, value: any, rules: ValidationRules[string]) => string | null;
}

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  address: {
    required: true,
    minLength: 3,
    maxLength: 200,
  },
  notes: {
    maxLength: 5000,
  },
  witnessName: {
    maxLength: 100,
  },
  witnessContact: {
    maxLength: 100,
  },
  latitude: {
    required: true,
    custom: (value: number) => {
      if (isNaN(value)) return 'Latitude must be a number';
      if (value < COORDINATE_BOUNDS.minLat || value > COORDINATE_BOUNDS.maxLat) {
        return `Latitude must be between ${COORDINATE_BOUNDS.minLat} and ${COORDINATE_BOUNDS.maxLat}`;
      }
      return null;
    },
  },
  longitude: {
    required: true,
    custom: (value: number) => {
      if (isNaN(value)) return 'Longitude must be a number';
      if (value < COORDINATE_BOUNDS.minLng || value > COORDINATE_BOUNDS.maxLng) {
        return `Longitude must be between ${COORDINATE_BOUNDS.minLng} and ${COORDINATE_BOUNDS.maxLng}`;
      }
      return null;
    },
  },
  datetime: {
    required: true,
  },
  status: {
    required: true,
  },
  method: {
    required: true,
  },
  severity: {
    required: true,
  },
  animalType: {
    required: true,
  },
};

export function useFormValidation(
  initialRules: ValidationRules = {}
): FormValidationHook {
  const [errors, setErrors] = useState<FormErrors>({});

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const validateField = useCallback(
    (field: string, value: any, rules: ValidationRules[string]): string | null => {
      // Check required
      if (rules.required) {
        if (value === null || value === undefined || value === '') {
          return `${field} is required`;
        }
      }

      // Skip further validation if field is empty and not required
      if (!rules.required && (value === null || value === undefined || value === '')) {
        return null;
      }

      // Check min length
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return `${field} must be at least ${rules.minLength} characters`;
      }

      // Check max length
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return `${field} must be at most ${rules.maxLength} characters`;
      }

      // Check pattern
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return `${field} format is invalid`;
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) return customError;
      }

      return null;
    },
    []
  );

  const validate = useCallback(
    (formData: Record<string, any>): boolean => {
      const newErrors: FormErrors = {};

      Object.entries(initialRules).forEach(([field, rules]) => {
        const error = validateField(field, formData[field], rules);
        if (error) {
          newErrors[field] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [initialRules, validateField]
  );

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    isValid,
    validate,
    setFieldError,
    clearFieldError,
    clearErrors,
    validateField,
  };
}
