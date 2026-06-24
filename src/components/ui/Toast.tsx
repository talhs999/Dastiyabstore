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
      <div style={{ position: "fixed", top: 32, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", pointerEvents: "none" }}>
        {toasts.map(t => (
          <div key={t.id} className="toast animate-fade-down" style={{ borderColor: t.type === "error" ? "#dc2626" : t.type === "info" ? "#3b82f6" : "var(--red)", pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, background: "white", padding: "12px 20px", borderRadius: "100px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", minWidth: 300, borderLeft: "4px solid" }}>
            {icons[t.type]}
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", flex: 1, textAlign: "center" }}>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", padding: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
