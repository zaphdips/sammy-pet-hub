"use client";

/**
 * Toast Notification System
 *
 * WHY: Replaces all browser alert() calls with a premium,
 * non-blocking notification system. Stacks from bottom-right,
 * auto-dismisses after 4s, supports success/error/info/warning.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast("Order placed!", "success");
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import styles from "./Toast.module.css";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: "#22c55e",
  error:   "#ef4444",
  warning: "#f59e0b",
  info:    "#3b82f6",
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="false">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          const color = COLORS[toast.type];
          return (
            <div
              key={toast.id}
              className={`${styles.toast} ${styles[toast.type]}`}
              role="alert"
            >
              <Icon size={20} color={color} className={styles.icon} />
              <span className={styles.message}>{toast.message}</span>
              <button
                className={styles.close}
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
