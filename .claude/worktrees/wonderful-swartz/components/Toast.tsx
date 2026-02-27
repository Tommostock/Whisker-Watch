/**
 * Toast Component
 * Auto-dismissing notification at bottom of screen
 * Extracted from original app behavior
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TOAST_DURATION } from '@/lib/constants';

export interface ToastMessage {
  id: string;
  text: string;
  color?: string; // CSS color or CSS variable like 'var(--green)'
  duration?: number; // ms to show (default: TOAST_DURATION)
}

interface ToastProps {
  messages: ToastMessage[];
  onDismiss?: (id: string) => void;
}

/**
 * Toast component - displays toast notifications
 *
 * Usage:
 * const [toasts, setToasts] = useState<ToastMessage[]>([]);
 *
 * const showToast = (text: string, color?: string) => {
 *   const id = 'toast-' + Date.now();
 *   setToasts([...toasts, { id, text, color }]);
 * };
 *
 * return (
 *   <>
 *     <Toast messages={toasts} onDismiss={(id) => setToasts(toasts.filter(t => t.id !== id))} />
 *   </>
 * );
 */
export const Toast: React.FC<ToastProps> = ({ messages, onDismiss }) => {
  // Auto-dismiss toasts after duration
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const duration = lastMessage.duration ?? TOAST_DURATION;

    const timer = setTimeout(() => {
      onDismiss?.(lastMessage.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [messages, onDismiss]);

  if (messages.length === 0) return null;

  const message = messages[messages.length - 1];

  return (
    <div
      className="toast open"
      style={{
        backgroundColor: message.color
          ? message.color.startsWith('var(')
            ? `var(${message.color.slice(4, -1)})`
            : message.color
          : 'var(--accent)',
      }}
    >
      <span id="toastMsg">{message.text}</span>
    </div>
  );
};

/**
 * Hook for managing toast messages
 * Returns: [messages, showToast, clearToast]
 */
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (text: string, color?: string, duration?: number) => {
    const id = 'toast-' + Date.now().toString(36);
    setMessages([...messages, { id, text, color, duration }]);
  };

  const dismissToast = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  const clearToasts = () => {
    setMessages([]);
  };

  return {
    messages,
    showToast,
    dismissToast,
    clearToasts,
  };
}

/**
 * Standalone toast manager for non-component code
 * Usage: toastManager.show('Hello!', 'var(--green)');
 */
class ToastManager {
  private messages: Map<string, ToastMessage> = new Map();
  private container: HTMLElement | null = null;
  private listeners: Set<(messages: ToastMessage[]) => void> = new Set();

  constructor() {
    if (typeof document !== 'undefined') {
      this.ensureContainer();
    }
  }

  private ensureContainer() {
    if (this.container) return;
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(text: string, color?: string, duration?: number) {
    const id = 'toast-' + Date.now().toString(36);
    const message: ToastMessage = {
      id,
      text,
      color: color ?? 'var(--accent)',
      duration: duration ?? TOAST_DURATION,
    };

    this.messages.set(id, message);
    this.notifyListeners();

    // Auto-dismiss
    setTimeout(() => {
      this.messages.delete(id);
      this.notifyListeners();
    }, message.duration);

    return id;
  }

  dismiss(id: string) {
    this.messages.delete(id);
    this.notifyListeners();
  }

  clear() {
    this.messages.clear();
    this.notifyListeners();
  }

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const messages = Array.from(this.messages.values());
    this.listeners.forEach((listener) => listener(messages));
  }
}

// Export singleton instance
export const toastManager = new ToastManager();
