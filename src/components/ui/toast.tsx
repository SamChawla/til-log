"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 300);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
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
            setIsLeaving(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 300);
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

  let idCounter = 0;

  const toast = (
    message: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    const id = Date.now() + ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((t, i) => (
        <div key={t.id} style={{ top: `${1 + i * 4}rem` }} className="fixed left-1/2 -translate-x-1/2 z-[9999]">
          <Toast
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        </div>
      ))}
    </>
  );

  return { toast, ToastContainer };
}
