/**
 * useFormValidation Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useFormValidation, VALIDATION_RULES } from '@/hooks/useFormValidation'

describe('useFormValidation', () => {
  describe('Basic validation', () => {
    it('should initialize with no errors', () => {
      const { result } = renderHook(() => useFormValidation({}))
      expect(result.current.errors).toEqual({})
      expect(result.current.isValid).toBe(true)
    })

    it('should validate required fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: { required: true },
        })
      )

      act(() => {
        result.current.validate({ email: '' })
      })

      expect(result.current.errors.email).toBeDefined()
      expect(result.current.isValid).toBe(false)
    })

    it('should pass required field validation with value', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: { required: true },
        })
      )

      act(() => {
        result.current.validate({ email: 'test@example.com' })
      })

      expect(result.current.errors.email).toBeUndefined()
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('String length validation', () => {
    it('should validate minLength', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { minLength: 3 },
        })
      )

      act(() => {
        result.current.validate({ name: 'ab' })
      })

      expect(result.current.errors.name).toBeDefined()
    })

    it('should validate maxLength', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { maxLength: 10 },
        })
      )

      act(() => {
        result.current.validate({ name: 'this is way too long' })
      })

      expect(result.current.errors.name).toBeDefined()
    })

    it('should pass length validation within bounds', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { minLength: 3, maxLength: 10 },
        })
      )

      act(() => {
        result.current.validate({ name: 'John' })
      })

      expect(result.current.errors.name).toBeUndefined()
    })
  })

  describe('Pattern validation', () => {
    it('should validate regex patterns', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        })
      )

      act(() => {
        result.current.validate({ email: 'invalid-email' })
      })

      expect(result.current.errors.email).toBeDefined()
    })

    it('should pass pattern validation', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        })
      )

      act(() => {
        result.current.validate({ email: 'test@example.com' })
      })

      expect(result.current.errors.email).toBeUndefined()
    })
  })

  describe('Custom validation', () => {
    it('should support custom validation function', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          age: {
            custom: (value) => {
              if (value < 18) return 'Must be 18 or older'
              return null
            },
          },
        })
      )

      act(() => {
        result.current.validate({ age: 16 })
      })

      expect(result.current.errors.age).toBeDefined()
    })

    it('should pass custom validation', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          age: {
            custom: (value) => {
              if (value < 18) return 'Must be 18 or older'
              return null
            },
          },
        })
      )

      act(() => {
        result.current.validate({ age: 25 })
      })

      expect(result.current.errors.age).toBeUndefined()
    })
  })

  describe('Field-level operations', () => {
    it('should set field error', () => {
      const { result } = renderHook(() => useFormValidation({}))

      act(() => {
        result.current.setFieldError('name', 'Name is invalid')
      })

      expect(result.current.errors.name).toBe('Name is invalid')
      expect(result.current.isValid).toBe(false)
    })

    it('should clear field error', () => {
      const { result } = renderHook(() => useFormValidation({}))

      act(() => {
        result.current.setFieldError('name', 'Name is invalid')
        result.current.clearFieldError('name')
      })

      expect(result.current.errors.name).toBeUndefined()
      expect(result.current.isValid).toBe(true)
    })

    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormValidation({}))

      act(() => {
        result.current.setFieldError('name', 'Error 1')
        result.current.setFieldError('email', 'Error 2')
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('Incident validation rules', () => {
    it('should validate address field', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          address: VALIDATION_RULES.address,
        })
      )

      // Too short
      act(() => {
        result.current.validate({ address: 'ab' })
      })

      expect(result.current.errors.address).toBeDefined()

      // Valid
      act(() => {
        result.current.validate({ address: '123 Test Street' })
      })

      expect(result.current.errors.address).toBeUndefined()
    })

    it('should validate latitude bounds', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          latitude: VALIDATION_RULES.latitude,
        })
      )

      // Out of bounds (too high)
      act(() => {
        result.current.validate({ latitude: 65 })
      })

      expect(result.current.errors.latitude).toBeDefined()

      // Valid
      act(() => {
        result.current.validate({ latitude: 51.5 })
      })

      expect(result.current.errors.latitude).toBeUndefined()
    })

    it('should validate longitude bounds', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          longitude: VALIDATION_RULES.longitude,
        })
      )

      // Out of bounds (too negative)
      act(() => {
        result.current.validate({ longitude: -10 })
      })

      expect(result.current.errors.longitude).toBeDefined()

      // Valid
      act(() => {
        result.current.validate({ longitude: -0.1 })
      })

      expect(result.current.errors.longitude).toBeUndefined()
    })
  })

  describe('validateField method', () => {
    it('should validate individual field', () => {
      const { result } = renderHook(() => useFormValidation({}))

      const error = result.current.validateField('test', 'value', {
        required: true,
      })

      expect(error).toBeNull()
    })

    it('should return error for invalid field', () => {
      const { result } = renderHook(() => useFormValidation({}))

      const error = result.current.validateField('test', '', {
        required: true,
      })

      expect(error).toBeDefined()
      expect(typeof error).toBe('string')
    })
  })
})
