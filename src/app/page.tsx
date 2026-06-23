"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ChevronRight, Truck, RotateCcw, Shield, Headphones,
  Star, Zap, Package, Wind, Laptop, Monitor, Home, ShoppingCart,
  TrendingUp, Award, Heart, Menu, Fan, Smartphone, Cpu, LayoutGrid, Music
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getBestSellers } from "@/data/products";

/* ─── DATA ─── */
const heroSlides = [
  {
    badge: "Summer Special", title: "Stay Cool with\nNeck Fan",
    subtitle: "Wearable 360° bladeless neck fan — perfect for Pakistani summers",
    cta: "Shop Now", href: "/shop/neck-fan",
    bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)", accent: "var(--red)",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
  },
  {
    badge: "Best Seller", title: "Premium TWS\nEarbuds",
    subtitle: "30-hour battery | ANC | Crystal clear sound — true wireless freedom",
    cta: "Explore", href: "/shop/airpods",
    bg: "linear-gradient(135deg, #fff9e6 0%, #fff0f0 100%)", accent: "var(--yellow-dark)",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&q=80",
  },
  {
    badge: "Work From Home", title: "Ergonomic\nLaptop Stand",
    subtitle: "Improve posture & productivity with our adjustable aluminum laptop stand",
    cta: "Order Now", href: "/shop/laptop-stand",
    bg: "linear-gradient(135deg, #f0fff4 0%, #fff5f5 100%)", accent: "var(--red)",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=80",
  },
];

const sidebarCategories = [
  { name: "Neckband Earphones", iconEl: <Headphones size={20} />, iconSm: <Headphones size={16} />, href: "/shop/neckband", count: 12, badge: null, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", desc: "Wireless neckband earphones with super bass & mic", products: ["DastiyabSound X1", "Bass Pro X2", "Sport Flex"] },
  { name: "AirPods / TWS Earbuds", iconEl: <Music size={20} />, iconSm: <Music size={16} />, href: "/shop/airpods", count: 10, badge: null, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80", desc: "True wireless earbuds with ANC & long battery life", products: ["DastiyabBuds Pro", "DastiyabBuds Lite", "AirMax"] },
  { name: "Neck Fan", iconEl: <Wind size={20} />, iconSm: <Wind size={16} />, href: "/shop/neck-fan", count: 8, badge: "Hot", image: "https://images.unsplash.com/photo-1625765503151-c1a10cc57b44?w=300&q=80", desc: "Bladeless wearable neck fans for summer cooling", products: ["NeckCool Pro", "360° AirWrap", "SlimFan Mini"] },
  { name: "Portable Fan", iconEl: <Fan size={20} />, iconSm: <Fan size={16} />, href: "/shop/portable-fan", count: 6, badge: null, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", desc: "USB & rechargeable portable desk fans", products: ["USB Desk Fan", "Handheld Mini Fan", "Tower Fan"] },
  { name: "Laptop Stand", iconEl: <Laptop size={20} />, iconSm: <Laptop size={16} />, href: "/shop/laptop-stand", count: 7, badge: null, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80", desc: "Adjustable aluminum stands for all laptop sizes", products: ["Aluminum Pro Stand", "Foldable Lite", "XL Stand"] },
  { name: "Mobile Accessories", iconEl: <Smartphone size={20} />, iconSm: <Smartphone size={16} />, href: "/shop/mobile-accessories", count: 3, badge: null, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&q=80", desc: "Cables, cases, chargers and more", products: ["Type-C Cable", "Fast Charger", "Phone Stand"] },
  { name: "Home Gadgets", iconEl: <Cpu size={20} />, iconSm: <Cpu size={16} />, href: "/shop/home-gadgets", count: 2, badge: null, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", desc: "Smart home gadgets for everyday life", products: ["Smart Plug", "LED Strip"] },
  { name: "All Products", iconEl: <LayoutGrid size={20} />, iconSm: <LayoutGrid size={16} />, href: "/shop", count: 48, badge: null, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", desc: "Browse the full DastiyabStore catalog", products: [] },
];

const stats = [
  { target: 10000, suffix: "+", label: "Happy Customers", icon: <Heart size={20} /> },
  { target: 500, suffix: "+", label: "Products Sold", icon: <Package size={20} /> },
  { target: 4.8, suffix: "/5", decimals: 1, label: "Average Rating", icon: <Star size={20} /> },
  { target: 48, suffix: "hr", label: "Fast Delivery", icon: <Truck size={20} /> },
];

function AnimatedCounter({ target, suffix = "", decimals = 0 }: { target: number, suffix?: string, decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target]);

  const formattedCount = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return <span>{formattedCount}{suffix}</span>;
}

/* ─── FIXED OVERLAY SIDEBAR ─── */
function CategorySidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const activeCat = sidebarCategories.find(c => c.name === hoveredCat);

  // Position at the very top of the page
  const TOP = 0;

  return (
    <>
      {/* ── ICON STRIP — always visible on left, hidden when expanded ── */}
      {!expanded && (
        <div
          onMouseEnter={() => setExpanded(true)}
          style={{
            position: "fixed",
            left: 0,
            top: TOP,
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: "0",
            boxShadow: "4px 0 16px rgba(0,0,0,0.10)",
            paddingTop: 6,
            paddingBottom: 6,
            gap: 2,
            width: 46,
            borderRight: "1px solid var(--gray-200)",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {sidebarCategories.map(cat => (
            <div
              key={cat.name}
              title={cat.name}
              style={{
                width: 38, height: 38, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: 8, cursor: "pointer",
                color: "var(--gray-500)", position: "relative",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.background = "#fff0f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--gray-500)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {cat.iconEl}
              {cat.badge && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--red)" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── EXPANDED PANEL — overlays page from top ── */}
      {expanded && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500 }}
            onClick={() => { setExpanded(false); setHoveredCat(null); }}
          />
          <div
            onMouseLeave={() => { setExpanded(false); setHoveredCat(null); }}
            className="animate-fade-right"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 501,
              display: "flex",
              gap: 4,
              alignItems: "flex-start",
              height: "100vh",
            }}
          >
            {/* ── MAIN LIST PANEL ── */}
            <div style={{
              width: 260,
              background: "white",
              borderRadius: "0",
              boxShadow: "8px 4px 32px rgba(0,0,0,0.18)",
              overflow: "hidden",
              borderRight: "1px solid var(--gray-200)",
              height: "100vh",
              overflowY: "auto",
            }}>
              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg, var(--red) 0%, #c62333 100%)",
                padding: "13px 18px",
                display: "flex", alignItems: "center", gap: 10,
                position: "sticky", top: 0, zIndex: 2,
              }}>
                <Menu size={17} color="white" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  All Categories
                </span>
              </div>

              {/* Category rows */}
              <div onMouseEnter={() => { }} style={{ paddingTop: 4, paddingBottom: 4 }}>
                {sidebarCategories.map(cat => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onMouseEnter={() => setHoveredCat(cat.name)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 16px", textDecoration: "none",
                      background: hoveredCat === cat.name ? "#fff4f4" : "white",
                      borderLeft: `3px solid ${hoveredCat === cat.name ? "var(--red)" : "transparent"}`,
                      transition: "all 0.12s",
                    }}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: hoveredCat === cat.name ? "#fff0f0" : "var(--gray-100)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: hoveredCat === cat.name ? "var(--red)" : "var(--gray-500)",
                      transition: "all 0.12s",
                    }}>
                      {cat.iconSm}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600, flex: 1,
                      color: hoveredCat === cat.name ? "var(--red)" : "var(--gray-800)",
                      transition: "color 0.12s",
                    }}>
                      {cat.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {cat.badge && (
                        <span style={{ fontSize: 9, fontWeight: 800, background: "var(--red)", color: "white", padding: "2px 5px", borderRadius: 3, textTransform: "uppercase" }}>
                          {cat.badge}
                        </span>
                      )}
                      <ChevronRight size={13} color={hoveredCat === cat.name ? "var(--red)" : "var(--gray-400)"} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── FLYOUT: shows on category hover ── */}
            {hoveredCat && activeCat && (
              <div style={{
                width: 290,
                background: "white",
                borderRadius: 12,
                boxShadow: "6px 4px 32px rgba(0,0,0,0.15)",
                border: "1px solid var(--gray-200)",
                overflow: "hidden",
                maxHeight: `calc(100vh - ${TOP + 20}px)`,
                overflowY: "auto",
              }}>
                {/* Image */}
                <div style={{ height: 115, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  <Image src={activeCat.image} alt={activeCat.name} fill sizes="300px" style={{ objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, transparent 100%)",
                    padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginBottom: 2 }}>{activeCat.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{activeCat.desc}</div>
                  </div>
                </div>
                {/* Products */}
                <div style={{ padding: "12px 13px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Popular Items
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 11 }}>
                    {activeCat.products.length > 0
                      ? activeCat.products.map((p, i) => (
                        <Link key={i} href={activeCat.href} style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                          borderRadius: 7, textDecoration: "none", color: "var(--gray-700)",
                          fontSize: 12, fontWeight: 500,
                          background: "var(--gray-50)", border: "1px solid var(--gray-100)",
                          transition: "all 0.12s",
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-700)"; }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--red)", flexShrink: 0 }} />
                          {p}
                          <ChevronRight size={11} style={{ marginLeft: "auto", opacity: 0.4 }} />
                        </Link>
                      ))
                      : <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Browse all {activeCat.count} products</p>
                    }
                  </div>
                  <Link href={activeCat.href} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px", borderRadius: 8, textDecoration: "none",
                    background: "var(--red)", color: "white", fontWeight: 700, fontSize: 12,
                  }}>
                    View All <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ─── HOME PAGE ─── */
export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const featured = getFeaturedProducts();
  const bestSellers = getBestSellers();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div style={{ overflowX: "hidden" }}>

      {/* ── FIXED CATEGORY SIDEBAR (overlay, not in layout) ── */}
      <CategorySidebar />

      {/* ── HERO ── */}
      <section style={{ background: slide.bg, transition: "background 0.8s ease", minHeight: 520 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", minHeight: 520 }}>

          {/* Text */}
          <div key={activeSlide} className="animate-fade-left">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span className="badge badge-yellow" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={12} fill="var(--black)" /> {slide.badge}
              </span>
              <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Jo Chahiye, Wahi Dastiyab</span>
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 900, lineHeight: 1.1, color: "var(--gray-900)", marginBottom: 16, whiteSpace: "pre-line" }}>
              {slide.title.split("\\n").map((line, i) =>
                i === 0 ? <span key={i}>{line}<br /></span> : <span key={i} style={{ color: slide.accent }}>{line}</span>
              )}
            </h1>
            <p style={{ fontSize: 16, color: "var(--gray-600)", marginBottom: 32, lineHeight: 1.7, maxWidth: 440 }}>
              {slide.subtitle}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href={slide.href} className="btn-red" style={{ fontSize: 16, padding: "14px 32px", textDecoration: "none" }}>
                {slide.cta} <ArrowRight size={18} />
              </Link>
              <Link href="/shop" className="btn-outline-red" style={{ fontSize: 16, padding: "14px 32px", textDecoration: "none" }}>
                View All Products
              </Link>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[{ icon: <Truck size={14} />, text: "Free Delivery Rs. 2000+" }, { icon: <Shield size={14} />, text: "100% Authentic" }, { icon: <RotateCcw size={14} />, text: "Easy Returns" }].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--gray-600)", fontWeight: 500 }}>
                  <span style={{ color: "var(--red)" }}>{t.icon}</span> {t.text}
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div key={`img-${activeSlide}`} className="animate-fade-right" style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", width: "100%" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
              <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-xl)", position: "relative" }}>
                <Image src={slide.image} alt={slide.title} fill sizes="(max-width: 768px) 100vw, 500px" style={{ objectFit: "cover" }} priority />
              </div>
              <div className="animate-float" style={{ position: "absolute", top: -20, right: -20, background: "white", borderRadius: "var(--radius)", padding: "12px 16px", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={18} color="var(--red)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--gray-900)" }}>Best Seller</div>
                  <div style={{ fontSize: 11, color: "var(--gray-500)" }}>500+ sold this week</div>
                </div>
              </div>
              <div className="animate-float delay-300" style={{ position: "absolute", bottom: -16, left: -16, background: "var(--yellow)", borderRadius: "var(--radius)", padding: "10px 14px", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} color="var(--black)" fill="var(--black)" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--black)" }}>COD Available</div>
                  <div style={{ fontSize: 10, color: "rgba(0,0,0,0.6)" }}>Pay on delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 32px", display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} style={{
              width: i === activeSlide ? 28 : 8, height: 8, borderRadius: 4,
              background: i === activeSlide ? "var(--red)" : "var(--gray-300)",
              border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0,
            }} />
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "var(--red)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, opacity: 0.8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}><AnimatedCounter target={s.target} suffix={s.suffix} decimals={s.decimals} /></div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ padding: "72px 24px", background: "var(--gray-50)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <span className="badge badge-yellow" style={{ fontSize: 11, marginBottom: 8, display: "inline-flex", gap: 4 }}><Award size={11} /> Featured</span>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "var(--gray-900)" }}>
                Featured <span style={{ color: "var(--red)" }}>Products</span>
              </h2>
              <p style={{ color: "var(--gray-500)", marginTop: 4 }}>Hand-picked products for you</p>
            </div>
            <Link href="/shop" className="btn-outline-red" style={{ textDecoration: "none" }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {featured.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section style={{ padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: "linear-gradient(135deg, var(--red) 0%, #c62333 40%, #9b1526 100%)", padding: "48px 48px", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span className="badge badge-yellow" style={{ fontSize: 12 }}>Limited Time</span>
                <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12 }}>Up to 50% Off</span>
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 44px)", fontWeight: 900, color: "white", marginBottom: 12 }}>
                Summer Sale — <span style={{ color: "var(--yellow)" }}>Neck Fans</span> Up to 50% Off
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, marginBottom: 24 }}>
                Beat the heat with our best-selling wearable neck fans. Limited stock available!
              </p>
              <Link href="/shop/neck-fan" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--yellow)", color: "var(--black)", padding: "14px 28px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                <ShoppingCart size={18} /> Shop Neck Fans
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Free Delivery Included", "Cash on Delivery", "7-Day Easy Returns"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                  <Shield size={16} color="var(--yellow)" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <span className="badge badge-red" style={{ fontSize: 11, marginBottom: 8, display: "inline-flex", gap: 4 }}><TrendingUp size={11} /> Best Sellers</span>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "var(--gray-900)" }}>
                Customer <span style={{ color: "var(--red)" }}>Favourites</span>
              </h2>
              <p style={{ color: "var(--gray-500)", marginTop: 4 }}>Our most loved products by Pakistani customers</p>
            </div>
            <Link href="/shop" className="btn-outline-red" style={{ textDecoration: "none" }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {bestSellers.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding: "80px 24px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header">
            <h2>Why Choose <span>DastiyabStore?</span></h2>
            <p>We are committed to providing the best shopping experience in Pakistan</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { icon: <Truck size={24} />, title: "Fast Nationwide Delivery", desc: "Delivery across all of Pakistan within 48-72 hours. Free on orders above Rs. 2000." },
              { icon: <Shield size={24} />, title: "100% Authentic Products", desc: "All products are tested and verified. Quality guaranteed or your money back." },
              { icon: <RotateCcw size={24} />, title: "Hassle-Free Returns", desc: "Not satisfied? Return within 5 days — no questions asked. Easy pickup." },
              { icon: <Headphones size={24} />, title: "24/7 Customer Support", desc: "Our support team is always ready via WhatsApp, phone, or email." },
            ].map((f, i) => (
              <div key={i} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow-md)", border: "1px solid var(--gray-200)", transition: "all 0.3s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xl)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; }}
              >
                <div style={{ display: "inline-flex", width: 52, height: 52, borderRadius: "14px", background: "#fff0f0", alignItems: "center", justifyContent: "center", color: "var(--red)", marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ color: "var(--gray-900)", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: "var(--gray-600)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO GRID PROMO ── */}
      <section style={{ padding: "40px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="bento-grid">
            
            {/* Block 1: Main (Season's Hot Product) */}
            <div className="bento-card bento-main" style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ position: "relative", zIndex: 2 }}>
                <span className="badge badge-yellow" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <Zap size={12} fill="var(--black)" /> Season's Hot Product
                </span>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, lineHeight: 1.1, color: "var(--gray-900)", marginBottom: 16 }}>
                  Stay Cool with<br /><span style={{ color: "var(--red)" }}>Neck Fan</span>
                </h2>
                <p style={{ fontSize: 15, color: "var(--gray-600)", marginBottom: 32, lineHeight: 1.6, maxWidth: 320 }}>
                  Wearable 360° bladeless neck fan — perfect for Pakistani summers.
                </p>
                <Link href="/shop/neck-fan" className="btn-red" style={{ fontSize: 15, padding: "12px 28px", textDecoration: "none", display: "inline-flex" }}>
                  Shop Now <ArrowRight size={16} style={{ marginLeft: 8 }} />
                </Link>
              </div>
            </div>

            {/* Block 2: Wide Top (Mobile Accessories) */}
            <div className="bento-card bento-wide" style={{ background: "#e0f2fe", padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden" }}>
              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>
                  Mobile<br />Accessories
                </h3>
                <p style={{ fontSize: 14, color: "#0ea5e9", marginBottom: 20 }}>Chargers, Cables & More</p>
                <Link href="/shop/mobile-accessories" className="btn-red" style={{ fontSize: 13, padding: "10px 20px", textDecoration: "none", display: "inline-block", background: "#0ea5e9" }}>
                  Explore <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
                </Link>
              </div>
              <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0, zIndex: 1, borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                <Image src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80" alt="Mobile Accessories" fill style={{ objectFit: "cover" }} />
              </div>
            </div>

            {/* Block 3: Small Top (Home Products) */}
            <div className="bento-card bento-small" style={{ background: "#fff0f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 4 }}>Home</h4>
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 16 }}>Smart gadgets</p>
              <div style={{ position: "relative", width: "100%", height: "120px", marginBottom: 16, borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" alt="Home Products" fill style={{ objectFit: "cover" }} />
              </div>
              <Link href="/shop/home-gadgets" style={{ color: "var(--red)", fontSize: 12, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1 }}>
                Learn More <ChevronRight size={12} style={{ display: "inline" }} />
              </Link>
            </div>

            {/* Block 4: Small Bottom (Computer Accessories) */}
            <div className="bento-card bento-small" style={{ background: "#f0fdf4", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 4 }}>Computer</h4>
                <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Stands, Hubs & More</p>
              </div>
              <div style={{ position: "relative", width: "100%", height: "120px", marginTop: "auto", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                <Image src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80" alt="Computer Accessories" fill style={{ objectFit: "cover" }} />
              </div>
              <Link href="/shop/laptop-stand" style={{ color: "#16a34a", fontSize: 12, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, marginTop: 12 }}>
                Explore <ChevronRight size={12} style={{ display: "inline" }} />
              </Link>
            </div>

            {/* Block 5: Wide Bottom (All Categories) */}
            <div className="bento-card bento-wide" style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)", padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>
                  Explore All<br />Categories
                </h3>
                <p style={{ fontSize: 14, color: "#8b5cf6", marginBottom: 20 }}>Find everything you need in one place.</p>
                <Link href="/shop" className="btn-yellow" style={{ fontSize: 13, padding: "10px 20px", textDecoration: "none", display: "inline-block", color: "var(--black)", background: "var(--yellow)" }}>
                  Browse Catalog <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
                </Link>
              </div>
              <div style={{ position: "relative", width: "180px", height: "140px", flexShrink: 0, zIndex: 1, borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" alt="All Categories" fill style={{ objectFit: "cover" }} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: "72px 24px", background: "var(--gray-50)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header">
            <h2>What Our <span>Customers Say</span></h2>
            <p>Real reviews from verified buyers across Pakistan</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { name: "Ahmed Raza", city: "Lahore", text: "Neck fan is amazing! Perfect for summer. COD delivery was smooth. Highly recommended!", product: "Neck Fan 360°" },
              { name: "Fatima Malik", city: "Karachi", text: "Laptop stand is very sturdy. Helps with neck pain during long work hours. Great quality!", product: "Aluminum Laptop Stand" },
              { name: "Usman Khan", city: "Islamabad", text: "AirPods sound quality is excellent at this price point. Battery lasts all day. Very happy!", product: "DastiyabBuds Pro" },
            ].map((r, i) => (
              <div key={i} style={{ background: "white", borderRadius: "12px", padding: 24, boxShadow: "0 2px 6px rgba(0,0,0,0.08)", border: "1px solid var(--gray-200)", transition: "all 0.3s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)"; }}
              >
                {/* Header: Avatar, Name, Time, Logo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: i === 0 ? "#e91e63" : i === 1 ? "#9c27b0" : "#2196f3", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>
                      {r.name.charAt(0)}
                    </div>
                    {/* Name & Location */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontWeight: 600, color: "#202124", fontSize: 15, lineHeight: 1.2 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#70757a", marginTop: 2 }}>{r.city} • Local Guide</div>
                    </div>
                  </div>
                  {/* Inline Google Logo */}
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>

                {/* Stars & Time ago */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#fbbc04" color="#fbbc04" />)}
                  </div>
                  <span style={{ fontSize: 13, color: "#70757a" }}>{["a week ago", "3 days ago", "2 weeks ago"][i]}</span>
                </div>

                {/* Review Text */}
                <p style={{ color: "#3c4043", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{r.text}</p>

                {/* Product Badge */}
                <div>
                  <span className="badge badge-gray" style={{ fontSize: 11, background: "#f1f3f4", color: "#3c4043", padding: "4px 8px", borderRadius: 4 }}>Purchased: {r.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BACK TO TOP ── */}
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr auto"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        /* Hide fixed sidebar on mobile */
        @media (max-width: 900px) {
          #cat-sidebar-fixed { display: none !important; }
        }
      `}</style>
    </div>
  );
}
