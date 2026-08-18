"use client";

/**
 * lib/context/ToastContext.tsx
 * Sistem Toast Notifikasi interaktif untuk seluruh aplikasi Pundi.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id:          string;
  type:        ToastType;
  title:       string;
  message?:    string;
  duration?:   number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfig: Record<ToastType, {
  icon:      typeof CheckCircle2;
  color:     string;
  bg:        string;
  border:    string;
}> = {
  success: {
    icon:   CheckCircle2,
    color:  "var(--color-pine)",
    bg:     "var(--color-surface)",
    border: "var(--color-pine)",
  },
  error: {
    icon:   AlertCircle,
    color:  "var(--color-ember)",
    bg:     "var(--color-surface)",
    border: "var(--color-ember)",
  },
  warning: {
    icon:   AlertTriangle,
    color:  "var(--color-warning)",
    bg:     "var(--color-surface)",
    border: "var(--color-warning)",
  },
  info: {
    icon:   Info,
    color:  "var(--color-pine)",
    bg:     "var(--color-surface)",
    border: "var(--color-rule)",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration = 4000 }: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}

      {/* Floating Toasts Container */}
      <aside
        aria-live="polite"
        aria-label="Notifikasi"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const cfg = toastConfig[t.type];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-card shadow-float",
                "border transition-all duration-300 ease-out",
                "animate-in fade-in slide-in-from-top-4"
              )}
              style={{
                backgroundColor: cfg.bg,
                borderColor: "var(--color-rule)",
                borderLeftColor: cfg.color,
                borderLeftWidth: "4px",
              }}
            >
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor:
                    t.type === "success"
                      ? "var(--color-pine-10)"
                      : t.type === "error"
                      ? "var(--color-ember-10)"
                      : t.type === "warning"
                      ? "var(--color-warning-10)"
                      : "var(--color-paper)",
                }}
              >
                <Icon size={16} strokeWidth={2} style={{ color: cfg.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-small font-semibold leading-tight"
                  style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink)" }}
                >
                  {t.title}
                </p>
                {t.message && (
                  <p
                    className="text-small mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}
                  >
                    {t.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-ink-muted hover:text-ink transition-colors p-1 rounded-sm flex-shrink-0"
                style={{ color: "var(--color-ink-muted)" }}
                aria-label="Tutup notifikasi"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus digunakan di dalam <ToastProvider>");
  }
  return ctx;
}
