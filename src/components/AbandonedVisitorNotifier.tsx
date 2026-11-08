"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell, X, Sparkles, CheckCircle2 } from "lucide-react";

interface RetargetNotification {
  title: string;
  body: string;
  url: string;
  tag: string;
  minElapsedMs: number; // Time elapsed since first visit
}

// Strictly 2 to 3 notifications across 2 days (48 hours)
const NOTIFICATION_SCHEDULE: RetargetNotification[] = [
  {
    // Alert 1: Sent ~2 hours after visitor browsed without buying
    title: "Dastiyab Store — Don't Miss Out! 🔥",
    body: "Pakistan's trending items are in high demand. Cash on Delivery & fast delivery available nationwide!",
    url: "/shop",
    tag: "dastiyab-retarget-1",
    minElapsedMs: 2 * 60 * 60 * 1000 // 2 hours
  },
  {
    // Alert 2: Sent ~24 hours after visit (Day 1)
    title: "🎁 10% OFF Voucher Waiting for You!",
    body: "Use promo code WELCOME10 at checkout to save flat 10% on your Dastiyab Store order today!",
    url: "/shop?coupon=WELCOME10",
    tag: "dastiyab-retarget-2",
    minElapsedMs: 24 * 60 * 60 * 1000 // 24 hours
  },
  {
    // Alert 3: Sent ~48 hours after visit (Day 2 - Final Notice)
    title: "🚚 Final Notice: Fast Shipping & Stock Alert!",
    body: "Selected items are running out fast. Complete your shopping before stock ends!",
    url: "/shop",
    tag: "dastiyab-retarget-3",
    minElapsedMs: 48 * 60 * 60 * 1000 // 48 hours
  }
];

export default function AbandonedVisitorNotifier() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [grantedToast, setGrantedToast] = useState(false);
  const swRegisteredRef = useRef(false);

  // Helper: check if notifications are permanently stopped
  const isStopped = useCallback(() => {
    if (typeof window === "undefined") return true;
    const orderPlaced = localStorage.getItem("dastiyab_order_placed") === "true";
    const notifCount = parseInt(localStorage.getItem("dastiyab_notif_count") || "0", 10);
    return orderPlaced || notifCount >= 3;
  }, []);

  // Dispatch a notification safely via Service Worker or Web Notification API
  const sendNotification = useCallback(async (index: number) => {
    if (typeof window === "undefined") return;
    if (isStopped()) return;

    const notif = NOTIFICATION_SCHEDULE[index];
    if (!notif) return;

    const currentCount = parseInt(localStorage.getItem("dastiyab_notif_count") || "0", 10);
    if (currentCount >= 3) return;

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        let sent = false;

        // 1. Try Service Worker registration first (works seamlessly on mobile & background)
        if ("serviceWorker" in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready;
            if (reg && "showNotification" in reg) {
              await reg.showNotification(notif.title, {
                body: notif.body,
                icon: "/icon.png",
                badge: "/icon.png",
                tag: notif.tag,
                data: { url: notif.url }
              });
              sent = true;
            }
          } catch (swErr) {
            console.debug("SW notification fallback", swErr);
          }
        }

        // 2. Fallback to window Notification constructor
        if (!sent) {
          const n = new Notification(notif.title, {
            body: notif.body,
            icon: "/icon.png",
            tag: notif.tag
          });
          n.onclick = () => {
            window.focus();
            window.location.href = notif.url;
          };
          sent = true;
        }

        // Increment count and record timestamp (Strictly stops at 3)
        const nextCount = currentCount + 1;
        localStorage.setItem("dastiyab_notif_count", nextCount.toString());
        localStorage.setItem("dastiyab_notif_last_sent", Date.now().toString());
      } catch (err) {
        console.warn("Failed to deliver notification", err);
      }
    }
  }, [isStopped]);

  // Main evaluation: checks if any scheduled alert is due
  const evaluateSchedule = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isStopped()) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const firstVisit = parseInt(localStorage.getItem("dastiyab_first_visit") || "0", 10);
    if (!firstVisit) return;

    const now = Date.now();
    const elapsed = now - firstVisit;
    const currentCount = parseInt(localStorage.getItem("dastiyab_notif_count") || "0", 10);
    const lastSent = parseInt(localStorage.getItem("dastiyab_notif_last_sent") || "0", 10);

    // Minimum 4 hours between any two alerts
    const minSpacing = 4 * 60 * 60 * 1000;
    if (lastSent && (now - lastSent) < minSpacing) {
      return;
    }

    if (currentCount === 0 && elapsed >= NOTIFICATION_SCHEDULE[0].minElapsedMs) {
      sendNotification(0);
    } else if (currentCount === 1 && elapsed >= NOTIFICATION_SCHEDULE[1].minElapsedMs) {
      sendNotification(1);
    } else if (currentCount === 2 && elapsed >= NOTIFICATION_SCHEDULE[2].minElapsedMs) {
      sendNotification(2);
    }
  }, [isStopped, sendNotification]);

  // Setup: Register Service Worker and initialize tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check notification support
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    // Mark first visit timestamp if not set
    if (!localStorage.getItem("dastiyab_first_visit")) {
      localStorage.setItem("dastiyab_first_visit", Date.now().toString());
    }

    // Register Service Worker
    if ("serviceWorker" in navigator && !swRegisteredRef.current) {
      swRegisteredRef.current = true;
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.debug("Dastiyab SW registered:", reg.scope);
        })
        .catch((err) => {
          console.debug("Dastiyab SW registration error:", err);
        });
    }

    // Check if prompt should show
    if (Notification.permission === "default" && !isStopped()) {
      const dismissedUntil = parseInt(localStorage.getItem("dastiyab_notif_dismissed_until") || "0", 10);
      if (Date.now() > dismissedUntil) {
        // Show non-intrusive prompt after 6 seconds of engagement
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }

    // Check schedule on mount
    evaluateSchedule();

    // Check schedule periodically (every 5 minutes)
    const interval = setInterval(evaluateSchedule, 5 * 60 * 1000);

    // Check on page visibility change (when user minimizes or returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        evaluateSchedule();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for order placement in checkout to instantly cancel all notifications
    const handleOrderSuccess = () => {
      localStorage.setItem("dastiyab_order_placed", "true");
      setShowPrompt(false);
    };
    window.addEventListener("dastiyab_order_success", handleOrderSuccess);

    // Also listen to storage events across different tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dastiyab_order_placed" && e.newValue === "true") {
        setShowPrompt(false);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("dastiyab_order_success", handleOrderSuccess);
      window.removeEventListener("storage", handleStorage);
    };
  }, [evaluateSchedule, isStopped]);

  // Request Notification permission
  const handleEnable = async () => {
    if (typeof Notification === "undefined") return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === "granted") {
        setGrantedToast(true);
        setTimeout(() => setGrantedToast(false), 4000);

        // Mark visit if not marked
        if (!localStorage.getItem("dastiyab_first_visit")) {
          localStorage.setItem("dastiyab_first_visit", Date.now().toString());
        }

        // Register with server to record device session
        try {
          fetch("/api/notifications/abandoned-reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "register_visitor",
              firstVisit: Date.now()
            })
          }).catch(() => {});
        } catch (_) {}
      } else if (result === "denied") {
        localStorage.setItem("dastiyab_notif_dismissed_until", (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
      }
    } catch (err) {
      console.warn("Permission request error", err);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 24 hours so we don't annoy the visitor
    localStorage.setItem(
      "dastiyab_notif_dismissed_until",
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    );
  };

  // If order was placed or user maxed out, don't render anything
  if (isStopped() && !grantedToast) {
    return null;
  }

  return (
    <>
      {/* Success Toast when permission is granted */}
      {grantedToast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            backgroundColor: "#065f46",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 600,
            animation: "slideInUp 0.3s ease-out"
          }}
        >
          <CheckCircle2 size={18} color="#34d399" />
          <span>Alerts Enabled! You&apos;ll receive exclusive deals &amp; order updates.</span>
        </div>
      )}

      {/* Gentle Opt-In Prompt (Mobile & Laptop Friendly) */}
      {showPrompt && permission === "default" && (
        <aside
          aria-label="Notification Preferences"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 99990,
            maxWidth: "360px",
            width: "calc(100vw - 48px)",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            padding: "16px 18px",
            fontFamily: "var(--font-inter, sans-serif)",
            animation: "slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Bell size={20} color="var(--red, #dc2626)" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111827",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Dastiyab Deals &amp; Alerts
                  <Sparkles size={13} color="#f59e0b" />
                </h4>
                <button
                  onClick={handleDismiss}
                  aria-label="Dismiss notification prompt"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    color: "#9ca3af"
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <p
                style={{
                  fontSize: "12px",
                  lineHeight: "1.5",
                  color: "#4b5563",
                  margin: "0 0 12px 0"
                }}
              >
                Get <strong>10% OFF voucher</strong> &amp; flash sale alerts directly on your device. Never miss trending deals!
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={handleEnable}
                  style={{
                    flex: 1,
                    backgroundColor: "var(--red, #dc2626)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Allow Alerts
                </button>
                <button
                  onClick={handleDismiss}
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#4b5563",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 640px) {
          aside[aria-label="Notification Preferences"] {
            left: 12px !important;
            bottom: 80px !important;
            width: calc(100vw - 24px) !important;
          }
        }
      `}</style>
    </>
  );
}

