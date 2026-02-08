"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  duration?: number;
  onClose?: () => void;
  topRem?: number;
}

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
  topRem = 1,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasClosedRef = useRef(false);
  const fadeTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  const close = useCallback(
    (delayMs: number) => {
      if (hasClosedRef.current) return;
      hasClosedRef.current = true;

      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);

      setIsLeaving(true);
      fadeTimerRef.current = null;
      removeTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        onClose?.();
        removeTimerRef.current = null;
      }, delayMs);
    },
    [onClose]
  );

  useEffect(() => {
    const safeDuration = Math.max(duration, 300);
    const fadeDelay = Math.max(0, safeDuration - 300);

    fadeTimerRef.current = window.setTimeout(() => {
      setIsLeaving(true);
      fadeTimerRef.current = null;
    }, fadeDelay);

    removeTimerRef.current = window.setTimeout(() => {
      if (hasClosedRef.current) return;
      hasClosedRef.current = true;

      setIsVisible(false);
      onClose?.();
      removeTimerRef.current = null;
    }, safeDuration);

    return () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);

      fadeTimerRef.current = null;
      removeTimerRef.current = null;
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-indigo-600";

  return (
    <div
      style={{ top: `${topRem}rem` }}
      className={`fixed left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        isLeaving ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div
        className={`${bgColor} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-[420px]`}
      >
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={() => {
            close(300);
          }}
          className="p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Hook-style toast manager.
 * Usage:
 *   const { toast, ToastContainer } = useToast();
 *   toast("Entry saved!");
 *   return <><ToastContainer />...</>
 */
export function useToast() {
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "info" | "error" }[]
  >([]);

  const idCounterRef = useRef(0);

  const toast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      const id = Date.now() + ++idCounterRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map((t, i) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          topRem={1 + i * 4}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </>
  );

  return { toast, ToastContainer };
}
