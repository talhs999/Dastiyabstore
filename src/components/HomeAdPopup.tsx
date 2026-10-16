"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { X, Copy, Check, Sparkles, ArrowRight, Gift, ShoppingBag, ShieldCheck } from "lucide-react";

interface DastiyabProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image: string;
  secondaryImage?: string | null;
  badge?: string;
  categoryName?: string;
}

interface PopupApiResponse {
  enabled: boolean;
  badge?: string;
  couponCode?: string;
  discountText?: string;
  products: DastiyabProduct[];
}

// Curated fallbacks strictly from Dastiyab Store's own verified in-stock catalog
const FALLBACK_DASTIYAB_PRODUCTS: DastiyabProduct[] = [
  {
    id: "19756287-99e8-4c68-8504-d91d9308b126",
    name: "Panda LED Night Light — Soft Silicone, 3 Brightness Levels, Tap/Squeeze Control",
    slug: "panda-led-night-light-silicone",
    price: 1299,
    original_price: 1499,
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753546/dastiyabstore/dkzttylp7r5ebphii2ui.webp",
    secondaryImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753549/dastiyabstore/yfozfcttvgsegzsy3fmj.webp",
    badge: "13% OFF",
    categoryName: "Night Lights"
  },
  {
    id: "0228a7cb-d660-48db-be06-c4a615ae605d",
    name: "Stress Relief Gift Set — Wireless Earbuds, Fidget Toy & Keychain Combo",
    slug: "stress-relief-gift-set-with-keychain-earbuds",
    price: 1899,
    original_price: 2299,
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783766729/dastiyabstore/ooilsox6528vdha0e0bb.webp",
    secondaryImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783766738/dastiyabstore/bpv63okgof9zkcjb8ybu.webp",
    badge: "17% OFF",
    categoryName: "Gift Sets"
  },
  {
    id: "3c0765f0-3ab3-4cd6-a353-40b1a7bea407",
    name: "Capybara TWS-K22 Wireless Earbuds — Cute Character Design, Fast Pairing",
    slug: "capybara-tws-k22-wireless-earbuds",
    price: 1499,
    original_price: 1999,
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783768832/dastiyabstore/r78xwsc4te0qpxmi0kas.webp",
    secondaryImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783768835/dastiyabstore/jojjgqafgfzsa41ci9fd.webp",
    badge: "25% OFF",
    categoryName: "Wireless Earbuds"
  },
  {
    id: "2a5d601e-eb0d-470f-ab06-9d100b2d7576",
    name: "P9 Wireless Headphones — Bluetooth 5.0, Foldable Over-Ear Design",
    slug: "p9-wireless-headphones-bluetooth",
    price: 1199,
    original_price: 1399,
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753310/dastiyabstore/ted3irxtlwzqkn2zjkhd.webp",
    secondaryImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753316/dastiyabstore/dzgkrhxnoozn8t9in7xo.webp",
    badge: "14% OFF",
    categoryName: "Headphones"
  },
  {
    id: "26580216-5eee-4afc-af44-7d97685258a4",
    name: "U39 True Wireless Bluetooth Earbuds — Bluetooth 5.3, HD Stereo Sound",
    slug: "u39-true-wireless-bluetooth-earbuds-black-yellow",
    price: 1049,
    original_price: 1399,
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783374191/dastiyabstore/vygzeefbsr0pnmcyxjjw.webp",
    secondaryImage: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783374248/dastiyabstore/kpctw7u1qmpes8bkgwgc.webp",
    badge: "25% OFF",
    categoryName: "Earbuds"
  }
];

export default function HomeAdPopup() {
  const [productsPool, setProductsPool] = useState<DastiyabProduct[]>(FALLBACK_DASTIYAB_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<DastiyabProduct>(FALLBACK_DASTIYAB_PRODUCTS[0]);
  const [couponCode, setCouponCode] = useState<string>("WELCOME10");
  const [badgeText, setBadgeText] = useState<string>("🔥 DASTIYAB EXCLUSIVE DEAL");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasDismissed, setHasDismissed] = useState<boolean>(false);

  // Pick a random product from a list
  const pickRandom = (items: DastiyabProduct[]): DastiyabProduct => {
    if (!items || items.length === 0) return FALLBACK_DASTIYAB_PRODUCTS[0];
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  };

  useEffect(() => {
    // 1. Initial random fallback selection
    const initialFallback = pickRandom(FALLBACK_DASTIYAB_PRODUCTS);
    setSelectedProduct(initialFallback);

    // 2. Check if user already dismissed during this session
    const dismissed = sessionStorage.getItem("dastiyab_home_ad_dismissed");
    if (dismissed === "true") {
      setHasDismissed(true);
      return;
    }

    // 3. Fetch live randomized Dastiyab Store products
    fetch("/api/settings/ad-popup", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PopupApiResponse | null) => {
        if (data) {
          if (typeof data.enabled === "boolean") setEnabled(data.enabled);
          if (data.badge) setBadgeText(data.badge);
          if (data.couponCode) setCouponCode(data.couponCode);

          if (Array.isArray(data.products) && data.products.length > 0) {
            setProductsPool(data.products);
            const chosen = pickRandom(data.products);
            setSelectedProduct(chosen);
          }

          if (data.enabled !== false) {
            const timer = setTimeout(() => setIsOpen(true), 1300);
            return () => clearTimeout(timer);
          }
        } else {
          const timer = setTimeout(() => setIsOpen(true), 1300);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {
        const timer = setTimeout(() => setIsOpen(true), 1300);
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

  const handleReopen = () => {
    // When reopened, pick another random product from Dastiyab Store's collection!
    const newPick = pickRandom(productsPool);
    setSelectedProduct(newPick);
    setIsOpen(true);
  };

  const handleCopyCode = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Calculate discount percentage if original_price exists
  const discountPercent = useMemo(() => {
    if (selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price) {
      return Math.round(
        ((selectedProduct.original_price - selectedProduct.price) / selectedProduct.original_price) * 100
      );
    }
    return null;
  }, [selectedProduct]);

  if (!enabled) return null;

  return (
    <>
      {/* 1. Floating Offer Pill (Re-open trigger after dismissal, positioned right above the Chatbot bubble at bottom-left) */}
      {hasDismissed && !isOpen && (
        <button
          onClick={handleReopen}
          className="no-print dastiyab-offer-pill"
          style={{
            position: "fixed",
            bottom: 94,
            left: 24,
            zIndex: 9990,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #09090b 0%, #1c1917 100%)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: 9999,
            padding: "9px 16px",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            animation: "pulseGlow 2.5s infinite"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
            e.currentTarget.style.borderColor = "#fbbf24";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
          }}
          aria-label="View Dastiyab Special Offer"
        >
          <Gift size={15} color="#fbbf24" />
          <span>Dastiyab Deal: <strong style={{ color: "#fbbf24" }}>{couponCode}</strong></span>
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
            background: "rgba(0, 0, 0, 0.7)",
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
              maxWidth: 420,
              background: "#ffffff",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              animation: "adScaleUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh"
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
                zIndex: 30,
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.65)",
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
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.transform = "rotate(90deg) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.65)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <X size={17} strokeWidth={2.5} />
            </button>

            {/* Visual Banner Header */}
            <div
              style={{
                position: "relative",
                height: 180,
                background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              {/* Product Visual Display */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "14px 18px"
                }}
              >
                {/* Main Product Image Card */}
                <div
                  style={{
                    position: "relative",
                    width: 125,
                    height: 150,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.45)",
                    transform: selectedProduct.secondaryImage ? "rotate(-3deg)" : "none",
                    background: "#f4f4f5",
                    flexShrink: 0
                  }}
                >
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Discount ribbon on image */}
                  {(discountPercent || selectedProduct.badge) && (
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        background: "#dc2626",
                        color: "#ffffff",
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "3px 6px",
                        borderRadius: 6,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                      }}
                    >
                      {discountPercent ? `${discountPercent}% OFF` : selectedProduct.badge}
                    </div>
                  )}
                </div>

                {/* Secondary Angle Preview (if available) */}
                {selectedProduct.secondaryImage && (
                  <div
                    style={{
                      width: 110,
                      height: 140,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.45)",
                      transform: "rotate(4deg)",
                      background: "#f4f4f5",
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={selectedProduct.secondaryImage}
                      alt={`${selectedProduct.name} preview`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              {/* Gradient overlay for contrast */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.2) 60%, rgba(9,9,11,0.4) 100%)",
                  pointerEvents: "none"
                }}
              />

              {/* Dastiyab Store Official Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 14,
                  zIndex: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  padding: "4px 8px",
                  borderRadius: 9999,
                  boxShadow: "0 4px 10px rgba(220, 38, 38, 0.4)",
                  textTransform: "uppercase"
                }}
              >
                <Sparkles size={11} color="#fbbf24" />
                {badgeText}
              </div>

              {/* Verification Tag */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 14,
                  zIndex: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(4px)",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 7px",
                  borderRadius: 6
                }}
              >
                <ShieldCheck size={11} color="#34d399" />
                Dastiyab Verified
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: "16px 18px 18px", textAlign: "center", overflowY: "auto" }}>
              {/* Category */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#dc2626",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 4
                }}
              >
                {selectedProduct.categoryName || "Dastiyab Official Store"}
              </div>

              {/* Product Title */}
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.3,
                  marginBottom: 8,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
                title={selectedProduct.name}
              >
                {selectedProduct.name}
              </h3>

              {/* Price & Savings Display */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 12,
                  flexWrap: "wrap"
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>
                  Rs. {selectedProduct.price.toLocaleString()}
                </span>
                {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#9ca3af",
                      textDecoration: "line-through"
                    }}
                  >
                    Rs. {selectedProduct.original_price.toLocaleString()}
                  </span>
                )}
                {discountPercent && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#059669",
                      background: "#d1fae5",
                      padding: "2px 7px",
                      borderRadius: 9999
                    }}
                  >
                    Save Rs. {(selectedProduct.original_price! - selectedProduct.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Coupon Box */}
              {couponCode && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "2px dashed #cbd5e1",
                    borderRadius: 12,
                    padding: "8px 12px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8
                  }}
                >
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}
                    >
                      Exclusive Voucher
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: "#dc2626",
                        letterSpacing: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {couponCode}
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: copied ? "#10b981" : "#111827",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      flexShrink: 0
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Primary Call to Action Button */}
              <Link
                href={`/product/${selectedProduct.slug}`}
                onClick={handleClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 18px",
                  background: "#dc2626",
                  color: "#ffffff",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 6px 16px rgba(220, 38, 38, 0.35)",
                  transition: "all 0.2s ease",
                  marginBottom: 6
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b91c1c";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <ShoppingBag size={16} />
                <span>View Product & Buy Now</span>
                <ArrowRight size={16} />
              </Link>

              {/* Dismiss Link */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  marginTop: 4
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 8px",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#4b5563")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                >
                  No thanks, continue browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Embedded Styles for Keyframe Animations & Responsive Layout */}
      <style jsx global>{`
        @keyframes adFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes adScaleUp {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 0 6px rgba(220, 38, 38, 0);
          }
        }
        @media (max-width: 640px) {
          .dastiyab-offer-pill {
            bottom: 94px !important;
            left: 16px !important;
            padding: 8px 14px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </>
  );
}
