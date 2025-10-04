import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: "from-green-500/20 to-emerald-500/20",
    border: "border-green-400/30",
    icon: "✅",
    iconColor: "text-green-400",
  },
  error: {
    bg: "from-red-500/20 to-pink-500/20",
    border: "border-red-400/30",
    icon: "❌",
    iconColor: "text-red-400",
  },
  warning: {
    bg: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-400/30",
    icon: "⚠️",
    iconColor: "text-yellow-400",
  },
  info: {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-400/30",
    icon: "ℹ️",
    iconColor: "text-blue-400",
  },
};

export function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring" }}
              className={`relative bg-gradient-to-br ${style.bg} backdrop-blur-xl border ${style.border} rounded-xl p-4 shadow-2xl overflow-hidden`}
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer" />

              <div className="relative flex items-start gap-3">
                <div className={`text-2xl ${style.iconColor}`}>
                  {style.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold mb-1">
                    {toast.title}
                  </h4>
                  <p className="text-white/70 text-sm">{toast.message}</p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <svg
                    className="w-4 h-4 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Auto-dismiss progress bar */}
              {toast.duration && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{
                    duration: toast.duration / 1000,
                    ease: "linear",
                  }}
                  className="absolute bottom-0 left-0 h-1 bg-white/30 origin-left"
                  style={{ width: "100%" }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Hook for using toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (type: ToastType, title: string, message: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("success", title, message, duration);
    },
    [addToast]
  );

  const error = React.useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("error", title, message, duration);
    },
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("warning", title, message, duration);
    },
    [addToast]
  );

  const info = React.useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast("info", title, message, duration);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
