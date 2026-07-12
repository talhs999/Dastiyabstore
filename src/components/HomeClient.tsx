"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import * as Icons from "lucide-react";
import {
  ArrowRight, ChevronRight, ChevronLeft, Truck, RotateCcw, Shield, Headphones,
  Star, Zap, Package, Wind, Laptop, Monitor, Home, ShoppingCart,
  TrendingUp, Award, Heart, Menu, Fan, Smartphone, Cpu, LayoutGrid, Music
} from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getBestSellers } from "@/data/products";

function DynamicIcon({ name, size = 20 }: { name: string, size?: number }) {
  const Icon = (Icons as any)[name] || Icons.Package;
  return <Icon size={size} />;
}

function InstagramCarousel({ posts }: { posts: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Auto-scroll logic (Continuous Seamless Loop)
  useEffect(() => {
    if (!scrollRef.current || posts.length <= 1 || isInteracting) return;
    
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollCarousel = (time: number) => {
      if (scrollRef.current) {
        const deltaTime = time - lastTime;
        if (deltaTime > 16) {
          scrollRef.current.scrollLeft += 1;
          
          if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
            scrollRef.current.scrollLeft = 0;
          }
          lastTime = time;
        }
      }
      animationFrameId = requestAnimationFrame(scrollCarousel);
    };

    animationFrameId = requestAnimationFrame(scrollCarousel);
    return () => cancelAnimationFrame(animationFrameId);
  }, [posts, isInteracting]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  if (!posts || posts.length === 0) return null;

  return (
    <div 
      style={{ position: "relative", padding: "0 10px" }}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => { setTimeout(() => setIsInteracting(false), 2000); }}
    >
      {posts.length > 1 && (
        <button 
          onClick={scrollLeft}
          style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "white", border: "1px solid var(--gray-200)", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Icons.ChevronLeft size={24} color="var(--gray-700)" />
        </button>
      )}

      <div ref={scrollRef} className="insta-carousel hide-scroll" style={{ 
        display: "flex", gap: 24, overflowX: "auto", paddingBottom: 20, marginTop: 40, 
        padding: "0 8px", justifyContent: "flex-start"
      }}>
        {posts.map((post) => (
          <div key={`orig-${post.id}`} style={{ 
            flexShrink: 0, width: 326, borderRadius: 12, 
            overflow: "hidden", border: "1px solid var(--gray-200)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            background: "white"
          }}>
            <iframe
              src={`https://www.instagram.com/p/${post.shortcode}/embed`}
              width="100%"
              height="540"
              frameBorder="0"
              scrolling="no"
              style={{ border: "none", background: "white", display: "block" }}
            />
          </div>
        ))}
        {posts.length > 1 && posts.map((post) => (
          <div key={`dup-${post.id}`} style={{ 
            flexShrink: 0, width: 326, borderRadius: 12, 
            overflow: "hidden", border: "1px solid var(--gray-200)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            background: "white"
          }}>
            <iframe
              src={`https://www.instagram.com/p/${post.shortcode}/embed`}
              width="100%"
              height="540"
              frameBorder="0"
              scrolling="no"
              style={{ border: "none", background: "white", display: "block" }}
            />
          </div>
        ))}
      </div>

      {posts.length > 1 && (
        <button 
          onClick={scrollRight}
          style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "white", border: "1px solid var(--gray-200)", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Icons.ChevronRight size={24} color="var(--gray-700)" />
        </button>
      )}
    </div>
  );
}

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
function CategorySidebar({ categories }: { categories: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const activeCat = categories.find(c => c.name === hoveredCat);

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
          {categories.map(cat => (
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
              <DynamicIcon name={cat.sidebar_icon} size={20} />
              {cat.header_badge && (
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
                {categories.map(cat => (
                  <Link
                    key={cat.name}
                    href={`/shop/${cat.slug}`}
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
                      <DynamicIcon name={cat.sidebar_icon} size={16} />
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600, flex: 1,
                      color: hoveredCat === cat.name ? "var(--red)" : "var(--gray-800)",
                      transition: "color 0.12s",
                    }}>
                      {cat.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {cat.header_badge && (
                        <span style={{ fontSize: 9, fontWeight: 800, background: "var(--red)", color: "white", padding: "2px 5px", borderRadius: 3, textTransform: "uppercase" }}>
                          {cat.header_badge}
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
                  {activeCat.image && <Image src={activeCat.image} alt={activeCat.name} fill sizes="300px" style={{ objectFit: "cover" }} />}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, transparent 100%)",
                    padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginBottom: 2 }}>{activeCat.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{activeCat.sidebar_desc}</div>
                  </div>
                </div>
                {/* Products */}
                <div style={{ padding: "12px 13px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Popular Items
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 11 }}>
                    {(activeCat.sidebar_popular_items || []).length > 0
                      ? (activeCat.sidebar_popular_items || []).map((p: string, i: number) => (
                        <Link key={i} href={`/shop/${activeCat.slug}`} style={{
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
                      : <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Browse all products</p>
                    }
                  </div>
                  <Link href={`/shop/${activeCat.slug}`} style={{
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
export default function HomeClient({ initialData }: { initialData: any }) {
  const { freeDelivery } = useSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Use the fetched data directly as initial values instead of states
  const banners = initialData?.bannerSlides && initialData.bannerSlides.length > 0 ? initialData.bannerSlides : heroSlides;
  const featured = initialData?.featured && initialData.featured.length > 0 ? initialData.featured : getFeaturedProducts();
  const bestSellers = initialData?.bestSellers && initialData.bestSellers.length > 0 ? initialData.bestSellers : getBestSellers();
  
  const sidebarCategories = initialData?.categories ? [
    ...initialData.categories,
    { name: "All Products", slug: "", sidebar_icon: "LayoutGrid", is_in_sidebar: true, sidebar_popular_items: [], sidebar_desc: "Browse the full catalog" }
  ] : [];

  const instagramPosts = initialData?.instagram || [];
  
  const promoBanner = initialData?.promoBanner || {
    enabled: true,
    badge1: "Limited Time",
    badge2: "Up to 50% Off",
    title: "Summer Sale —",
    titleHighlight: "Neck Fans",
    titleEnd: "Up to 50% Off",
    subtitle: "Beat the heat with our best-selling wearable neck fans. Limited stock available!",
    buttonText: "Shop Neck Fans",
    buttonLink: "/shop/neck-fan",
    buttonBg: "var(--yellow)",
    buttonTextCol: "var(--black)",
    bgStyle: "linear-gradient(135deg, var(--red) 0%, #c62333 40%, #9b1526 100%)",
    bullet1: "Free Delivery Included",
    bullet2: "Cash on Delivery",
    bullet3: "7-Day Easy Returns"
  };

  const bentoGrid = initialData?.bentoGrid && Array.isArray(initialData.bentoGrid) && initialData.bentoGrid.length === 5 
    ? initialData.bentoGrid 
    : null;

  const dynamicStats = initialData?.statsStrip && Array.isArray(initialData.statsStrip) && initialData.statsStrip.length === 4 
    ? initialData.statsStrip 
    : null;

  const siteReviews = initialData?.siteReviews && Array.isArray(initialData.siteReviews)
    ? initialData.siteReviews 
    : [];

  const scrollReviews = (dir: "left" | "right") => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const slide = banners[activeSlide] || heroSlides[0];

  return (
    <div style={{ overflowX: "hidden" }}>

      {/* ── FIXED CATEGORY SIDEBAR (overlay, not in layout) ── */}
      <div className="desktop-only">
        <CategorySidebar categories={sidebarCategories} />
      </div>

      {/* ── HERO ── */}
      <section style={{ background: slide.bg, transition: "background 0.8s ease", minHeight: 520 }}>
        <div className="hero-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 0", alignItems: "center", minHeight: 520 }}>

          {/* Text */}
          <div key={activeSlide} className="animate-fade-left">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span className="badge badge-yellow" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={12} fill="var(--black)" /> {slide.badge}
              </span>
              <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Jo Chahiye, Wahi Dastiyab</span>
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 900, lineHeight: 1.1, color: "var(--gray-900)", marginBottom: 16, whiteSpace: "pre-line" }}>
              {slide.title.split("\\n").map((line: string, i: number) =>
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
              {[
                ...(freeDelivery?.is_active ? [{ icon: <Truck size={14} />, text: `Free Delivery Rs. ${freeDelivery.threshold}+` }] : []),
                { icon: <Shield size={14} />, text: "100% Authentic" },
                { icon: <RotateCcw size={14} />, text: "Easy Returns" }
              ].map((t, i) => (
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
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--gray-900)" }}>{slide.floatingTagTitle || "Best Seller"}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{slide.floatingTagSubtitle || "500+ sold this week"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 32px", display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8 }}>
          {banners.map((_: any, i: number) => (
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
        <div className="stats-grid" style={{ 
          maxWidth: 1280, 
          margin: "0 auto",
          gap: "24px"
        }}>
          {(dynamicStats || stats).map((s: any, i: number) => {
            const iconName = s.icon || "Heart";
            const IconComp = (Icons as any)[iconName] || Icons.Heart;
            const target = dynamicStats ? parseFloat(s.value) : s.target;
            const suffix = dynamicStats ? s.suffix : s.suffix;
            const decimals = dynamicStats ? (s.value && s.value.includes(".") ? 1 : 0) : (s.decimals || 0);
            return (
              <div key={i} style={{ textAlign: "center", color: "white" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, opacity: 0.8 }}><IconComp size={20} /></div>
                <div style={{ fontSize: 26, fontWeight: 900 }}><AnimatedCounter target={target} suffix={suffix} decimals={decimals} /></div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ padding: "72px 24px", background: "var(--gray-50)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="header-flex" style={{ marginBottom: 40 }}>
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
            {featured.map((product: any) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      {promoBanner?.enabled && (
      <section style={{ padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="promo-grid" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: promoBanner.bgStyle, padding: "48px 48px", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {promoBanner.badge1 && <span className="badge badge-yellow" style={{ fontSize: 12 }}>{promoBanner.badge1}</span>}
                {promoBanner.badge2 && <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12 }}>{promoBanner.badge2}</span>}
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 44px)", fontWeight: 900, color: "white", marginBottom: 12 }}>
                {promoBanner.title} <span style={{ color: "var(--yellow)" }}>{promoBanner.titleHighlight}</span> {promoBanner.titleEnd}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, marginBottom: 24 }}>
                {promoBanner.subtitle}
              </p>
              <Link href={promoBanner.buttonLink || "#"} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: promoBanner.buttonBg, color: promoBanner.buttonTextCol, padding: "14px 28px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                <ShoppingCart size={18} /> {promoBanner.buttonText}
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[promoBanner.bullet1, promoBanner.bullet2, promoBanner.bullet3].filter(Boolean).map((t: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                  <Shield size={16} color="var(--yellow)" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── BEST SELLERS ── */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="header-flex" style={{ marginBottom: 40 }}>
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
            {bestSellers.map((product: any) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ── CUSTOMIZED GIFTS SECTION ── */}
      <section style={{ padding: "80px 0", background: "linear-gradient(to bottom, #fff5f5, #fffcf0)", overflow: "hidden", position: "relative" }}>
        {/* Abstract background accents */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
        
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12, background: "rgba(220,38,38,0.08)", padding: "6px 16px", borderRadius: 20 }}>
              <Heart size={14} color="var(--red)" fill="var(--red)" />
              <span style={{ color: "var(--red)", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>Premium & Customized</span>
            </div>
            <h2 style={{ color: "var(--gray-900)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
              The Perfect <span className="gradient-text">Gift</span> <br/>For Every Occasion
            </h2>
            <p style={{ color: "var(--gray-600)", fontSize: "clamp(15px, 2vw, 18px)", marginBottom: 32, lineHeight: 1.6 }}>
              Surprise your loved ones with our beautifully crafted, customized gifts. From birthdays to anniversaries, we have something special for everyone.
            </p>
            <Link href="/gifts" className="btn-red" style={{ display: "inline-flex", padding: "16px 36px", fontSize: 16, textDecoration: "none", boxShadow: "0 10px 25px rgba(220,38,38,0.25)" }}>
              Explore Gifts Collection <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </Link>
          </div>
          
          {/* Auto-scrolling Image Marquee */}
          <div className="gifts-marquee-wrapper" style={{ overflow: "hidden", width: "100%" }}>
            <style>{`
              @keyframes scrollMarquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-280px * 11 - 16px * 11)); }
              }
              .gifts-marquee {
                animation: scrollMarquee 40s linear infinite;
                will-change: transform;
              }
              .gifts-marquee:hover {
                animation-play-state: paused;
              }
              .gift-img-card {
                width: 280px;
                height: 380px;
                border-radius: 20px;
                overflow: hidden;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                border: 1px solid rgba(0,0,0,0.05);
              }
              .gift-img-card:hover {
                transform: translateY(-12px) scale(1.03);
                border-color: rgba(220,38,38,0.2);
                box-shadow: 0 20px 40px rgba(220,38,38,0.15);
              }
              @media (max-width: 768px) {
                .gift-img-card {
                  width: 220px;
                  height: 300px;
                }
                @keyframes scrollMarquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(calc(-220px * 11 - 16px * 11)); }
                }
              }
            `}</style>
            
            <div className="gifts-marquee" style={{ display: "flex", gap: 16, width: "max-content", padding: "20px 0" }}>
              {/* Array of 11 images, duplicated to create a seamless loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => (
                <Link href="/gifts" key={i} className="gift-img-card">
                  <Image 
                    src={`/images/gifts/gift-${num}.jpeg`} 
                    alt={`Customized Gift ${num}`} 
                    fill 
                    sizes="(max-width: 768px) 220px, 280px" 
                    style={{ objectFit: "cover" }} 
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Premium Box</span>
                      <span style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: 12, color: "white", fontSize: 11, fontWeight: 600 }}>Gift Set</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
              { icon: <Truck size={24} />, title: "Reliable Delivery", desc: `Delivery across Pakistan within 5-7 working days. Karachi deliveries in 2-3 days.` },
              { icon: <Shield size={24} />, title: "100% Authentic Products", desc: "All products are tested and verified. Quality guaranteed or your money back." },
              { icon: <RotateCcw size={24} />, title: "Hassle-Free Returns", desc: "Not satisfied? Request a return or exchange within 5 days." },
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
            {(() => { const b = bentoGrid ? bentoGrid[0] : null; return (
            <div className="bento-card bento-main" style={{ background: b?.bg || "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ position: "relative", zIndex: 2 }}>
                <span className="badge badge-yellow" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <Zap size={12} fill="var(--black)" /> {b?.badge || "Season's Hot Product"}
                </span>
                <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, lineHeight: 1.1, color: "var(--gray-900)", marginBottom: 16 }}>
                  {b?.title || "Stay Cool with"}<br /><span style={{ color: b?.accentColor || "var(--red)" }}>{b?.titleHighlight || "Neck Fan"}</span>
                </h2>
                <p style={{ fontSize: 15, color: "var(--gray-600)", marginBottom: 32, lineHeight: 1.6, maxWidth: 320 }}>
                  {b?.subtitle || "Wearable 360° bladeless neck fan — perfect for Pakistani summers."}
                </p>
                <Link href={b?.buttonLink || "/shop/neck-fan"} className="btn-red" style={{ fontSize: 15, padding: "12px 28px", textDecoration: "none", display: "inline-flex" }}>
                  {b?.buttonText || "Shop Now"} <ArrowRight size={16} style={{ marginLeft: 8 }} />
                </Link>
              </div>
            </div>
            ); })()}

            {/* Block 2: Wide Top */}
            {(() => { const b = bentoGrid ? bentoGrid[1] : null; return (
            <div className="bento-card bento-wide bento-wide-inner" style={{ background: b?.bg || "#e0f2fe", padding: "32px", overflow: "hidden" }}>
              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8, whiteSpace: "pre-line" }}>
                  {(b?.title || "Mobile\nAccessories").replace(/\\n/g, "\n")}
                </h3>
                <p style={{ fontSize: 14, color: b?.accentColor || "#0ea5e9", marginBottom: 20 }}>{b?.subtitle || "Chargers, Cables & More"}</p>
                <Link href={b?.buttonLink || "/shop/mobile-accessories"} className="btn-red" style={{ fontSize: 13, padding: "10px 20px", textDecoration: "none", display: "inline-block", background: b?.accentColor || "#0ea5e9" }}>
                  {b?.buttonText || "Explore"} <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
                </Link>
              </div>
              <div className="bento-wide-img">
                <Image src={b?.image || "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80"} alt={b?.title || "Mobile Accessories"} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
              </div>
            </div>
            ); })()}

            {/* Block 3: Small Top */}
            {(() => { const b = bentoGrid ? bentoGrid[2] : null; return (
            <div className="bento-card bento-small" style={{ background: b?.bg || "#fff0f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 4 }}>{b?.title || "Home"}</h4>
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 16 }}>{b?.subtitle || "Smart gadgets"}</p>
              <div className="bento-small-img" style={{ marginBottom: 16 }}>
                <Image src={b?.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"} alt={b?.title || "Home Products"} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: "cover" }} />
              </div>
              <Link href={b?.buttonLink || "/shop/home-gadgets"} style={{ color: b?.accentColor || "var(--red)", fontSize: 12, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1 }}>
                {b?.buttonText || "Learn More"} <ChevronRight size={12} style={{ display: "inline" }} />
              </Link>
            </div>
            ); })()}

            {/* Block 4: Small Bottom */}
            {(() => { const b = bentoGrid ? bentoGrid[3] : null; return (
            <div className="bento-card bento-small" style={{ background: b?.bg || "#f0fdf4", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 4 }}>{b?.title || "Computer"}</h4>
                <p style={{ fontSize: 12, color: "var(--gray-500)" }}>{b?.subtitle || "Stands, Hubs & More"}</p>
              </div>
              <div className="bento-small-img" style={{ marginTop: "auto" }}>
                <Image src={b?.image || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80"} alt={b?.title || "Computer Accessories"} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: "cover" }} />
              </div>
              <Link href={b?.buttonLink || "/shop/laptop-stand"} style={{ color: b?.accentColor || "#16a34a", fontSize: 12, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, marginTop: 12 }}>
                {b?.buttonText || "Explore"} <ChevronRight size={12} style={{ display: "inline" }} />
              </Link>
            </div>
            ); })()}

            {/* Block 5: Wide Bottom */}
            {(() => { const b = bentoGrid ? bentoGrid[4] : null; return (
            <div className="bento-card bento-wide bento-wide-inner" style={{ background: b?.bg || "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)", padding: "32px" }}>
              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8, whiteSpace: "pre-line" }}>
                  {(b?.title || "Explore All\nCategories").replace(/\\n/g, "\n")}
                </h3>
                <p style={{ fontSize: 14, color: b?.accentColor || "#8b5cf6", marginBottom: 20 }}>{b?.subtitle || "Find everything you need in one place."}</p>
                <Link href={b?.buttonLink || "/shop"} className="btn-yellow" style={{ fontSize: 13, padding: "10px 20px", textDecoration: "none", display: "inline-block", color: "var(--black)", background: "var(--yellow)" }}>
                  {b?.buttonText || "Browse Catalog"} <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
                </Link>
              </div>
              <div className="bento-wide-img">
                <Image src={b?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"} alt={b?.title || "All Categories"} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
              </div>
            </div>
            ); })()}

          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ 
        padding: "32px 24px", 
        background: "linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.95)), url('/reviews-bg2.png') center/cover no-repeat",
        position: "relative"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32, gap: 20 }}>
            <div className="section-header" style={{ marginBottom: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--yellow)" }}></span>
                <span style={{ color: "var(--yellow)", fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>REVIEWS</span>
              </div>
              <h2 style={{ color: "var(--white)", textShadow: "0 2px 10px rgba(0,0,0,0.5)", fontSize: "clamp(32px, 4vw, 48px)" }}>What Our <span className="gradient-text">Customers Say</span></h2>
              <p style={{ color: "var(--white)", opacity: 0.9, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>Real reviews from verified buyers across Pakistan</p>
            </div>
          </div>
          
          {siteReviews.length === 0 ? (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 16, padding: "40px 32px", textAlign: "center", maxWidth: 600 }}>
                <h3 style={{ color: "var(--yellow)", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Customer Reviews Coming Soon!</h3>
                <p style={{ color: "var(--white)", opacity: 0.8, fontSize: 16, lineHeight: 1.5 }}>
                  We are preparing some amazing products and gathering feedback from our valuable customers. 
                  Real reviews from verified buyers will appear here shortly!
                </p>
              </div>
            </div>
          ) : (
            <div 
              className="reviews-slider"
              ref={reviewsRef}
              style={{ 
                display: "flex", 
                gap: 24, 
                overflowX: "auto", 
                scrollSnapType: "x mandatory", 
                paddingBottom: 24, 
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none" // Firefox
              }}
            >
              <style>{`
                .reviews-slider::-webkit-scrollbar { display: none; }
              `}</style>
              {siteReviews.map((r: any, i: number) => (
              <div key={i} style={{ 
                flex: "0 0 340px", 
                scrollSnapAlign: "start",
                background: "white", 
                borderRadius: "16px", 
                padding: 32, 
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                {/* Header: Avatar, Name, Time, Logo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: r.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20 }}>
                      {r.name.charAt(0)}
                    </div>
                    {/* Name & Location */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: 16, lineHeight: 1.2 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{r.city} • Local Guide</div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < (r.rating || 5) ? "var(--yellow)" : "none"} strokeWidth={i < (r.rating || 5) ? 0 : 2} color="var(--yellow)" />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{r.time}</span>
                </div>

                {/* Review Text */}
                <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{r.text}</p>

                {/* Product Badge */}
                <div>
                  <span className="badge" style={{ fontSize: 12, background: "#f3f4f6", color: "#4b5563", padding: "6px 10px", borderRadius: 6, fontWeight: 600 }}>Purchased: {r.product}</span>
                </div>
              </div>
            ))}
            </div>
          )}
          
          {siteReviews.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
              <button onClick={() => scrollReviews("left")} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollReviews("right")} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── INSTAGRAM FEED SECTION ── */}
      <section style={{ padding: "80px 5%", background: "white", borderTop: "1px solid var(--gray-100)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--gray-900)", marginBottom: 12, letterSpacing: "-1px" }}>
            Follow Us on <span style={{ color: "var(--red)" }}>Instagram</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--gray-600)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Stay updated with our latest gadgets, exclusive offers, and tech tips. 
            Follow <a href="https://www.instagram.com/dastiyabstore/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--red)", fontWeight: 700, textDecoration: "none" }}>@dastiyabstore</a>
          </p>
          
          {/* Instagram Carousel Widget */}
             <InstagramCarousel posts={instagramPosts} />
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
        
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Hide fixed sidebar on mobile */
        @media (max-width: 900px) {
          #cat-sidebar-fixed { display: none !important; }
        }
        
        /* === BENTO GRID === */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(2, minmax(240px, auto));
          gap: 24px;
        }
        .bento-card {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }
        .bento-main {
          grid-column: span 2;
          grid-row: span 2;
        }
        .bento-wide {
          grid-column: span 2;
        }
        .bento-small {
          grid-column: span 1;
        }
        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
          }
          .bento-main {
            grid-column: span 2;
            grid-row: auto;
            min-height: 380px;
          }
          .bento-wide {
            grid-column: span 2;
          }
          .bento-small {
            grid-column: span 1;
          }
        }
        @media (max-width: 640px) {
          .bento-grid {
            display: flex;
            flex-direction: column;
          }
          .bento-main, .bento-wide, .bento-small {
            min-height: 280px;
          }
        }
      `}</style>
    </div>
  );
}
