"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart, Heart, User, Search, Menu, X, ChevronDown,
  Phone, MapPin, Truck, Star, Bell, Headphones, Monitor,
  Wind, Laptop, Package, Home, ChevronRight, LogIn, Settings,
  ShoppingBag, Clock, Plus, Minus, Gift
} from "lucide-react";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { useRouter, usePathname } from "next/navigation";
import { products } from "@/data/products";
import { useSettings } from "@/components/SettingsProvider";

const categories = [
  { name: "Neckband Earphones", icon: <Headphones size={16} />, href: "/shop/neckband" },
  { name: "AirPods / TWS", icon: <Headphones size={16} />, href: "/shop/airpods" },
  { name: "Neck Fan", icon: <Wind size={16} />, href: "/shop/neck-fan" },
  { name: "Portable Fan", icon: <Wind size={16} />, href: "/shop/portable-fan" },
  { name: "Laptop Stand", icon: <Laptop size={16} />, href: "/shop/laptop-stand" },
  { name: "Mobile Accessories", icon: <Monitor size={16} />, href: "/shop/mobile-accessories" },
  { name: "Home Gadgets", icon: <Home size={16} />, href: "/shop/home-gadgets" },
  { name: "All Products", icon: <Package size={16} />, href: "/shop" },
];

export default function Navbar() {
  const { freeDelivery, promoBanner = [] } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { items: wishlistItems } = useWishlist();
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [accountHref, setAccountHref] = useState("/login");
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }
    return () => document.body.classList.remove("mobile-menu-open");
  }, [mobileOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setDbCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const checkSessions = () => {
      const adminSession = typeof document !== "undefined" && document.cookie.includes("admin_session=true");
      const customerSession = typeof window !== "undefined" && localStorage.getItem("customer_session");
      if (adminSession) {
        setAccountHref("/admin");
      } else if (customerSession) {
        setAccountHref("/account/orders");
      } else {
        setAccountHref("/login");
      }
    };
    checkSessions();
    window.addEventListener("storage", checkSessions);
    const interval = setInterval(checkSessions, 1000);
    return () => {
      window.removeEventListener("storage", checkSessions);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.length > 0) {
              const mappedResults = data.map((p: any) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: Number(p.price),
                image: p.image,
                category: p.category_name || "",
              }));
              setSearchResults(mappedResults);
            } else {
              setSearchResults([]);
            }
            return;
          }
        }
        
      } catch (err) {
        console.error("Error searching products:", err);
        const localResults = products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5);
        setSearchResults(localResults);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchResults([]); // Hide dropdown on enter
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
          <div className="animate-marquee" style={{ display: "flex", width: "fit-content", animation: "marquee 20s linear infinite" }}>
            {[
              ...(freeDelivery?.is_active ? [`Free Delivery on orders above Rs. ${freeDelivery.threshold}`] : []),
              ...promoBanner,
              ...(freeDelivery?.is_active ? [`Free Delivery on orders above Rs. ${freeDelivery.threshold}`] : []),
              ...promoBanner
            ].map((t, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginRight: 64, whiteSpace: "nowrap" }}>
                <Truck size={14} />
                {t}
                <span style={{ opacity: 0.4, marginLeft: 8 }}>|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "var(--white)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.1)" : "0 1px 0 var(--gray-200)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, height: 70 }}>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--gray-700)", padding: 4 }}
              className="mobile-only"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ position: "relative", height: 48, width: 48, flexShrink: 0, marginLeft: -6 }}>
                <Image src="/icon.png" alt="Dastiyab Store Logo" fill sizes="48px" style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                <span style={{ color: "var(--red)" }}>Dastiyab</span> <span style={{ color: "#FFB703" }}>Store</span>
              </span>
            </Link>

            {/* Categories Dropdown removed — see Home Page sidebar and Shop sidebar */}

            {/* Search Bar */}
            <div style={{ flex: 1, maxWidth: 520, position: "relative" }} className="desktop-only">
              <form onSubmit={handleSearch} style={{
                display: "flex", alignItems: "center",
                background: "var(--gray-50)", border: "2px solid var(--gray-200)",
                borderRadius: "var(--radius-full)", overflow: "hidden",
                transition: "all var(--transition)",
              }}>
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, padding: "10px 16px", border: "none",
                    background: "transparent", fontSize: 14, fontFamily: "inherit",
                    outline: "none", color: "var(--gray-900)",
                  }}
                />
                <button type="submit" style={{
                  padding: "10px 18px", background: "var(--red)", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  color: "white", fontSize: 14, fontWeight: 600,
                }}>
                  <Search size={16} />
                  Search
                </button>
              </form>
              
              {/* Live Search Suggestions */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8,
                  background: "white", borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)", border: "1px solid var(--gray-200)",
                  zIndex: 200, overflow: "hidden",
                }}>
                  {searchResults.map(p => (
                    <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => setSearchQuery("")} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      textDecoration: "none", borderBottom: "1px solid var(--gray-100)",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div style={{ position: "relative", width: 40, height: 40 }}>
                        <Image src={p.image} alt={p.name} fill sizes="40px" style={{ objectFit: "cover", borderRadius: 6 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{p.category}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)" }}>Rs. {p.price.toLocaleString()}</div>
                    </Link>
                  ))}
                  <button onClick={handleSearch} style={{
                    width: "100%", padding: 12, background: "var(--gray-50)",
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: "var(--red)", textAlign: "center"
                  }}>
                    View all results
                  </button>
                </div>
              )}
            </div>

            {/* Right Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
              {/* Mobile Search */}
              <button
                id="mobile-search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                className="mobile-only icon-btn"
                style={{ display: "none" }}
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link href="/account/wishlist" className="icon-btn tooltip-wrap desktop-only" style={{ textDecoration: "none", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%", color: "var(--gray-700)", transition: "all var(--transition)" }}>
                <Heart size={22} />
                <span className="tooltip">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span style={{
                    position: "absolute", top: 0, right: 0,
                    background: "var(--red)", color: "white",
                    width: 18, height: 18, borderRadius: "50%",
                    fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link href={accountHref} className="icon-btn tooltip-wrap desktop-only" style={{ textDecoration: "none", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%", color: "var(--gray-700)", transition: "all var(--transition)" }}>
                <User size={22} />
                <span className="tooltip">Account</span>
              </Link>

              {/* Cart */}
              <button
                id="cart-btn"
                onClick={() => setCartOpen(!cartOpen)}
                style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px 8px 12px", background: "var(--red)",
                  color: "white", border: "none", borderRadius: "var(--radius-full)",
                  cursor: "pointer", fontWeight: 700, fontSize: 14,
                  transition: "all var(--transition)",
                }}
              >
                <ShoppingCart size={18} />
                <span className="desktop-only">Cart</span>
                {totalItems > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    background: "var(--yellow)", color: "var(--black)",
                    width: 20, height: 20, borderRadius: "50%",
                    fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="animate-fade-down mobile-only" style={{ padding: "0 0 12px", position: "relative" }}>
              <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", background: "var(--gray-50)", border: "2px solid var(--red)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: "10px 16px", border: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--gray-900)" }}
                />
                <button type="submit" style={{ padding: "10px 16px", height: "100%", background: "var(--red)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Search size={16} />
                </button>
              </form>
              
              {/* Mobile Live Search Suggestions */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                  background: "white", borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)", border: "1px solid var(--gray-200)",
                  zIndex: 200, overflow: "hidden",
                }}>
                  {searchResults.map(p => (
                    <Link key={p.id} href={`/product/${p.slug || p.id}`} onClick={() => { setSearchQuery(""); setSearchOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      textDecoration: "none", borderBottom: "1px solid var(--gray-100)",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div style={{ position: "relative", width: 40, height: 40, borderRadius: 6, background: "var(--gray-50)", overflow: "hidden" }}>
                        <Image src={p.image} alt={p.name} fill sizes="40px" style={{ objectFit: "contain" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{p.category}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)" }}>Rs. {p.price.toLocaleString()}</div>
                    </Link>
                  ))}
                  <button onClick={handleSearch} style={{
                    width: "100%", padding: 12, background: "var(--gray-50)",
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: "var(--red)", textAlign: "center"
                  }}>
                    View all results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav Links (Desktop) */}
        <div style={{ borderTop: "1px solid var(--gray-100)", background: "var(--white)" }} className="desktop-only">
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 4, height: 44 }}>
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              ...dbCategories.filter(c => c.is_in_header).map(c => ({
                label: c.name,
                href: `/shop/${c.slug}`,
                badge: c.header_badge
              })),
              { label: "Custom Gifts", href: "/gifts", badge: "New" },
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link: any) => (
              <Link key={link.label} href={link.href} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8,
                textDecoration: "none", color: "var(--gray-600)",
                fontSize: 14, fontWeight: 500, transition: "all var(--transition)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--gray-600)"; (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                {link.label}
                {link.badge && <span className="badge badge-red" style={{ fontSize: 10, padding: "2px 7px" }}>{link.badge}</span>}
              </Link>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--gray-500)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={13} color="var(--red)" />
                <strong style={{ color: "var(--gray-700)" }}>0316-2975195</strong>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} color="var(--red)" />
                Karachi, Pakistan
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          <div className="overlay" onClick={() => setCartOpen(false)} />
          <div className="animate-fade-right" style={{
            position: "fixed", right: 0, top: 0, bottom: 0, height: "100dvh", width: 380,
            background: "var(--white)", zIndex: 200, boxShadow: "var(--shadow-xl)",
            display: "flex", flexDirection: "column", maxWidth: "100vw",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 18 }}>My Cart</h3>
                <p style={{ fontSize: 13, color: "var(--gray-500)" }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ background: "var(--gray-100)", border: "none", cursor: "pointer", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <ShoppingCart size={48} color="var(--gray-300)" style={{ margin: "0 auto 16px" }} />
                  <p style={{ color: "var(--gray-400)", fontWeight: 500 }}>Your cart is empty</p>
                  <Link href="/shop" onClick={() => setCartOpen(false)} className="btn-red" style={{ marginTop: 20, textDecoration: "none", display: "inline-flex" }}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {items.map((item, index) => (
                    <div key={`${item.id}-${item.color || index}`} style={{ display: "flex", gap: 12, padding: 12, background: "var(--gray-50)", borderRadius: "var(--radius)" }}>
                      <div style={{ position: "relative", width: 64, height: 64 }}>
                        <Image src={item.image} alt={item.name} fill sizes="64px" style={{ objectFit: "cover", borderRadius: 8 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.name}</p>
                        {item.color && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.colorHex || "#ccc", border: "1px solid var(--gray-200)" }}></div>
                            <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{item.color}</span>
                          </div>
                        )}
                        <p style={{ color: "var(--red)", fontWeight: 700, fontSize: 15 }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                          <button onClick={() => updateQuantity(item.id, item.color, Math.max(1, item.quantity - 1))} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--gray-200)", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--gray-600)" }}><Minus size={12} /></button>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--gray-200)", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--gray-600)" }}><Plus size={12} /></button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.color)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", alignSelf: "flex-start" }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: "1px solid var(--gray-200)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>Total:</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "var(--red)" }}>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-red" style={{ width: "100%", justifyContent: "center", textDecoration: "none", display: "flex" }}>
                  Proceed to Checkout
                </Link>
                <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-outline-red" style={{ width: "100%", justifyContent: "center", marginTop: 8, textDecoration: "none", display: "flex" }}>
                  View Full Cart
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <div className="animate-fade-left" style={{
            position: "fixed", left: 0, top: 0, bottom: 0, height: "100dvh", width: 300,
            background: "var(--white)", zIndex: 200, boxShadow: "var(--shadow-xl)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{ position: "relative", height: 40, width: 40, flexShrink: 0, marginLeft: -6 }}>
                  <Image src="/icon.png" alt="Dastiyab Store Logo" fill sizes="40px" style={{ objectFit: "contain" }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--red)" }}>Dastiyab</span> <span style={{ color: "#FFB703" }}>Store</span>
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: "var(--gray-100)", border: "none", cursor: "pointer", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px", marginBottom: 4 }}>Navigation</p>
              {[
                { label: "Home", href: "/", icon: <Home size={16} /> }, 
                { label: "Shop All", href: "/shop", icon: <Package size={16} /> }, 
                { label: "Wishlist", href: "/account/wishlist", icon: <Heart size={16} />, badge: wishlistItems.length > 0 ? wishlistItems.length : null },
                { label: "My Account", href: accountHref, icon: <User size={16} /> },
                { label: "Custom Gifts", href: "/gifts", icon: <Gift size={16} />, badge: "New" },
                { label: "About Us", href: "/about", icon: <Star size={16} /> }, 
                { label: "Contact", href: "/contact", icon: <Phone size={16} /> }
              ].map(link => (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--gray-700)", fontWeight: 500, transition: "all var(--transition)", marginBottom: 2 }}>
                  <span style={{ color: "var(--red)" }}>{link.icon}</span>
                  <span style={{ flex: 1 }}>{link.label}</span>
                  {link.badge && <span className="badge badge-red" style={{ fontSize: 10, padding: "2px 7px" }}>{link.badge}</span>}
                </Link>
              ))}
              <div className="divider" style={{ margin: "12px 0" }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px", marginBottom: 4 }}>Categories</p>
              {(dbCategories.length > 0 ? dbCategories : categories.map(c => ({ name: c.name, slug: c.href.split("/shop/")[1] }))).map(cat => (
                <Link key={cat.name} href={`/shop/${cat.slug}`} onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--gray-600)", fontSize: 14, fontWeight: 500, transition: "all var(--transition)", marginBottom: 2 }}>
                  <span style={{ color: "var(--red)" }}><Package size={16} /></span>
                  {cat.name}
                  {cat.header_badge && <span className="badge badge-red" style={{ fontSize: 9, padding: "2px 6px", marginLeft: "auto" }}>{cat.header_badge}</span>}
                </Link>
              ))}
            </nav>
            <div style={{ padding: 16, borderTop: "1px solid var(--gray-200)", display: "flex", gap: 8 }}>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline-red" style={{ flex: 1, justifyContent: "center", textDecoration: "none", display: "flex", padding: "10px 16px" }}>
                <LogIn size={16} /> Login
              </Link>
              <Link href="/login?tab=register" onClick={() => setMobileOpen(false)} className="btn-red" style={{ flex: 1, justifyContent: "center", textDecoration: "none", display: "flex", padding: "10px 16px" }}>
                Register
              </Link>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          #mobile-menu-btn { display: flex !important; }
          #mobile-search-btn { display: flex !important; }
          .icon-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: var(--gray-700); }
          .icon-btn:hover { background: var(--gray-100); }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
          .icon-btn { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: var(--gray-700); transition: all var(--transition); }
          .icon-btn:hover { background: var(--gray-100); color: var(--red); }
        }
      `}</style>
    </>
  );
}
