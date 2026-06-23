"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Headphones, Wind, Laptop, Monitor, Home, Package, Star, Tag, Sliders } from "lucide-react";

const categories = [
  { name: "All Products", href: "/shop", icon: <Package size={16} />, count: 48 },
  { name: "Neckband Earphones", href: "/shop/neckband", icon: <Headphones size={16} />, count: 12 },
  { name: "AirPods / TWS", href: "/shop/airpods", icon: <Headphones size={16} />, count: 10 },
  { name: "Neck Fan", href: "/shop/neck-fan", icon: <Wind size={16} />, count: 8 },
  { name: "Portable Fan", href: "/shop/portable-fan", icon: <Wind size={16} />, count: 6 },
  { name: "Laptop Stand", href: "/shop/laptop-stand", icon: <Laptop size={16} />, count: 7 },
  { name: "Mobile Accessories", href: "/shop/mobile-accessories", icon: <Monitor size={16} />, count: 3 },
  { name: "Home Gadgets", href: "/shop/home-gadgets", icon: <Home size={16} />, count: 2 },
];

interface Props {
  currentCategory?: string;
  onPriceChange?: (min: number, max: number) => void;
  onRatingChange?: (rating: number) => void;
  onSortChange?: (sort: string) => void;
}

export default function ShopSidebar({ currentCategory, onPriceChange, onRatingChange, onSortChange }: Props) {
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [openSections, setOpenSections] = useState({ categories: true, price: true, rating: true, brands: false });

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside style={{ width: 260, flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "12px 16px", background: "var(--red)", borderRadius: "var(--radius)", color: "white" }}>
        <Sliders size={18} />
        <span style={{ fontWeight: 700, fontSize: 15 }}>Filters</span>
      </div>

      {/* Categories */}
      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", overflow: "hidden", marginBottom: 16 }}>
        <button onClick={() => toggle("categories")} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={16} color="var(--red)" /> Categories
          </span>
          {openSections.categories ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {openSections.categories && (
          <div style={{ padding: "0 8px 8px" }}>
            {categories.map(cat => (
              <Link
                key={cat.name}
                href={cat.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 8,
                  textDecoration: "none",
                  color: currentCategory === cat.name ? "var(--red)" : "var(--gray-600)",
                  background: currentCategory === cat.name ? "#fff0f0" : "transparent",
                  fontWeight: currentCategory === cat.name ? 700 : 500,
                  fontSize: 14, transition: "all 0.2s",
                }}
              >
                <span style={{ color: "var(--red)" }}>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.name}</span>
                <span style={{ fontSize: 11, color: "var(--gray-400)", background: "var(--gray-100)", padding: "1px 6px", borderRadius: 4 }}>{cat.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", overflow: "hidden", marginBottom: 16 }}>
        <button onClick={() => toggle("price")} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={16} color="var(--red)" /> Price Range
          </span>
          {openSections.price ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {openSections.price && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>Rs. {priceRange[0].toLocaleString()}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>Rs. {priceRange[1].toLocaleString()}</span>
            </div>
            <input type="range" min={0} max={15000} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              style={{ width: "100%", accentColor: "var(--red)" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input type="number" placeholder="Min" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                className="input" style={{ flex: 1, fontSize: 13, padding: "8px 10px" }} />
              <input type="number" placeholder="Max" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                className="input" style={{ flex: 1, fontSize: 13, padding: "8px 10px" }} />
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", overflow: "hidden", marginBottom: 16 }}>
        <button onClick={() => toggle("rating")} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Star size={16} color="var(--red)" /> Customer Rating
          </span>
          {openSections.rating ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {openSections.rating && (
          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {[5, 4, 3, 2, 1].map(r => (
              <button key={r} onClick={() => setSelectedRating(r === selectedRating ? 0 : r)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 8, border: "none",
                  background: selectedRating === r ? "#fff0f0" : "transparent",
                  cursor: "pointer", width: "100%", textAlign: "left",
                  transition: "background 0.2s",
                }}>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} fill={s <= r ? "var(--yellow)" : "none"} color={s <= r ? "var(--yellow)" : "var(--gray-300)"} />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>& Up</span>
                {selectedRating === r && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tags */}
      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", padding: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-800)", marginBottom: 12 }}>Quick Filters</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["In Stock", "On Sale", "New Arrivals", "Best Seller", "COD Only"].map(tag => (
            <button key={tag} style={{ padding: "6px 12px", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600, background: "white", color: "var(--gray-600)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; (e.currentTarget as HTMLElement).style.color = "var(--gray-600)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
