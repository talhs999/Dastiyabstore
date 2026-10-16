"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Copy, Check, Sparkles, Tag, ArrowRight, Gift } from "lucide-react";

interface AdPopupConfig {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  couponCode: string;
  discountText: string;
  buttonText: string;
  buttonLink: string;
  image?: string;
  secondaryImage?: string;
}

const DEFAULT_CONFIG: AdPopupConfig = {
  enabled: true,
  badge: "🔥 LIMITED TIME OFFER",
  title: "Flat 10% OFF on Your Order!",
  subtitle: "Explore our brand new 2-Piece Night Suits & Loungewear collection starting from just Rs. 1,450. Cash on delivery nationwide!",
  couponCode: "WELCOME10",
  discountText: "Extra 10% OFF at Checkout",
  buttonText: "Shop Night Suits Now",
  buttonLink: "/shop/night-suits",
  image: "/images/mashallah-store/women-suit-01.webp",
  secondaryImage: "/images/mashallah-store/kids-suit-01.webp"
};

export default function HomeAdPopup() {
  const [config, setConfig] = useState<AdPopupConfig>(DEFAULT_CONFIG);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if user already dismissed it during this session
    const dismissed = sessionStorage.getItem("dastiyab_home_ad_dismissed");
    if (dismissed === "true") {
      setHasDismissed(true);
      return;
    }

    // 2. Fetch remote config if available
    fetch("/api/settings/ad-popup")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.enabled === "boolean") {
          setConfig(data);
          if (data.enabled) {
            // Show popup with gentle delay after hero section renders
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 1400);
            return () => clearTimeout(timer);
          }
        } else {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1400);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1400);
        return () => clearTimeout(timer);
      });
  }, []);

  // Keyboard accessibility (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);
    sessionStorage.setItem("dastiyab_home_ad_dismissed", "true");
  };

  const handleCopyCode = () => {
    if (!config.couponCode) return;
    navigator.clipboard.writeText(config.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* 1. Floating Offer Pill (Re-open trigger after dismissal) */}
      {hasDismissed && !isOpen && config.enabled && (
        <button
          onClick={() => setIsOpen(true)}
          className="no-print"
          style={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 9999,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            animation: "pulseGlow 2.5s infinite"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
            e.currentTarget.style.borderColor = "var(--yellow)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
          aria-label="View Special Offer"
        >
          <Gift size={16} color="var(--yellow)" />
          <span>Special Offer: <strong>{config.couponCode}</strong></span>
        </button>
      )}

      {/* 2. Main Ad Popup Modal */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            animation: "adFadeIn 0.25s ease-out forwards"
          }}
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              animation: "adScaleUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              display: "flex",
              flexDirection: "column",
              maxHeight: "92vh"
            }}
          >
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close Advertisement"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 20,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(4px)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--red)";
                e.currentTarget.style.transform = "rotate(90deg) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <X size={17} strokeWidth={2.5} />
            </button>

            {/* Visual Header / Banner */}
            <div
              style={{
                position: "relative",
                height: 190,
                background: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              {/* Product Visual Preview (Side by Side or Feature Display) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "16px 20px"
                }}
              >
                {config.image && (
                  <div
                    style={{
                      width: 125,
                      height: 160,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "2px solid rgba(255, 255, 255, 0.18)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
                      transform: "rotate(-3deg)",
                      transition: "transform 0.3s ease"
                    }}
                  >
                    <img
                      src={config.image}
                      alt="Women Suit"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                {config.secondaryImage && (
                  <div
                    style={{
                      width: 125,
                      height: 160,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "2px solid rgba(255, 255, 255, 0.18)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
                      transform: "rotate(4deg)",
                      transition: "transform 0.3s ease"
                    }}
                  >
                    <img
                      src={config.secondaryImage}
                      alt="Kids Suit"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              {/* Gradient overlay for text contrast */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)",
                  pointerEvents: "none"
                }}
              />

              {/* Badge Tag in Header */}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 18,
                  zIndex: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--red)",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.6px",
                  padding: "4px 10px",
                  borderRadius: 9999,
                  boxShadow: "0 4px 10px rgba(220, 38, 38, 0.4)",
                  textTransform: "uppercase"
                }}
              >
                <Sparkles size={12} color="var(--yellow)" />
                {config.badge}
              </div>
            </div>

            {/* Content Area */}
            <div style={{ padding: "20px 22px 22px", textAlign: "center", overflowY: "auto" }}>
              {/* Title */}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "var(--gray-900)",
                  lineHeight: 1.25,
                  marginBottom: 8,
                  letterSpacing: "-0.3px"
                }}
              >
                {config.title}
              </h3>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 13,
                  color: "var(--gray-600)",
                  lineHeight: 1.5,
                  marginBottom: 16
                }}
              >
                {config.subtitle}
              </p>

              {/* Coupon Box */}
              {config.couponCode && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "2px dashed #cbd5e1",
                    borderRadius: 14,
                    padding: "10px 14px",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12
                  }}
                >
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Voucher Code
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "var(--red)", letterSpacing: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {config.couponCode}
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: copied ? "#10b981" : "var(--gray-900)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      flexShrink: 0
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Primary Call to Action Button */}
              <Link
                href={config.buttonLink || "/shop"}
                onClick={handleClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "13px 20px",
                  background: "var(--red)",
                  color: "#ffffff",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(220, 38, 38, 0.35)",
                  transition: "all 0.2s ease",
                  marginBottom: 10
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#b91c1c";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--red)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <span>{config.buttonText}</span>
                <ArrowRight size={17} />
              </Link>

              {/* Dismiss / Secondary Link */}
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--gray-400)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 8px",
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--gray-700)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--gray-400)"}
              >
                No thanks, continue browsing
              </button>

              {/* Trust Tagline */}
              <div
                style={{
                  borderTop: "1px solid var(--gray-100)",
                  marginTop: 14,
                  paddingTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--gray-500)"
                }}
              >
                <span>🚚 Cash on Delivery</span>
                <span>•</span>
                <span>🔄 5-Day Returns</span>
                <span>•</span>
                <span>⭐ 100% Quality</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes adFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes adScaleUp {
          from { 
            opacity: 0; 
            transform: scale(0.88) translateY(12px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(220, 38, 38, 0.45);
          }
        }
      `}</style>
    </>
  );
}
