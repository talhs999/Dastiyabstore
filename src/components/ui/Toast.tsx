"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.alert = (message: any) => {
        const msgStr = String(message);
        const msgLower = msgStr.toLowerCase();
        let type: ToastType = "info";
        if (
          msgLower.includes("success") || 
          msgLower.includes("saved") || 
          msgLower.includes("updated") || 
          msgLower.includes("created") ||
          msgLower.includes("deleted")
        ) {
          type = "success";
        } else if (
          msgLower.includes("fail") || 
          msgLower.includes("error") || 
          msgLower.includes("cannot") || 
          msgLower.includes("invalid") || 
          msgLower.includes("unable")
        ) {
          type = "error";
        }
        showToast(msgStr, type);
      };
    }
  }, [showToast]);

  const icons = {
    success: <CheckCircle size={20} color="var(--red)" />,
    error:   <AlertCircle size={20} color="#dc2626" />,
    info:    <Info size={20} color="#3b82f6" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", top: 32, left: 0, right: 0, zIndex: 9999, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", pointerEvents: "none", padding: "0 16px" }}>
        {toasts.map(t => (
          <div key={t.id} className="toast animate-fade-down" style={{ borderColor: t.type === "error" ? "#dc2626" : t.type === "info" ? "#3b82f6" : "var(--red)", pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, background: "white", padding: "12px 20px", borderRadius: "var(--radius-full)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", minWidth: 280, maxWidth: "100%", borderLeft: "4px solid" }}>
            {icons[t.type]}
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-800)", flex: 1, textAlign: "center", wordBreak: "break-word" }}>{t.message}</span>
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
