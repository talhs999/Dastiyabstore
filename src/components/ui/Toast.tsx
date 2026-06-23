"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = {
    success: <CheckCircle size={20} color="var(--red)" />,
    error:   <AlertCircle size={20} color="#dc2626" />,
    info:    <Info size={20} color="#3b82f6" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", top: 80, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 12 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{ borderColor: t.type === "error" ? "#dc2626" : t.type === "info" ? "#3b82f6" : "var(--red)" }}>
            {icons[t.type]}
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-800)", flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", padding: 2 }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
