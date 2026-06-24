"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Headphones, Wind, Laptop, Monitor, Home, Package, Star, Tag, Sliders } from "lucide-react";

import * as LucideIcons from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Props {
  currentCategory?: string;
}

export default function ShopSidebar({ currentCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialMin = searchParams.get("min") ? Number(searchParams.get("min")) : 0;
  const initialMax = searchParams.get("max") ? Number(searchParams.get("max")) : 15000;
  const initialRating = searchParams.get("rating") ? Number(searchParams.get("rating")) : 0;
  const initialTags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];

  const [priceRange, setPriceRange] = useState([initialMin, initialMax]);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [openSections, setOpenSections] = useState({ categories: true, price: true, rating: true, tags: true });
  
  const [dbCategories, setDbCategories] = useState<any[]>([
    { name: "All Products", href: "/shop", icon: <Package size={16} /> }
  ]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("name");
        if (data && !error) {
          const mapped = data.map((c: any) => {
            const IconComponent = (LucideIcons as any)[c.icon] || LucideIcons.Package;
            return {
              name: c.name,
              href: `/shop/${c.slug}`,
              icon: <IconComponent size={16} />
            };
          });
          setDbCategories([
            { name: "All Products", href: "/shop", icon: <Package size={16} /> },
            ...mapped
          ]);
        }
      } catch (err) {
        console.error("Error fetching sidebar categories", err);
      }
    }
    fetchCategories();
  }, []);

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Helper to update URL params
  const updateURL = (params: Record<string, string | number | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || value === 0) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  // Sync state to URL (price is handled separately via onMouseUp to avoid spamming)
  useEffect(() => {
    updateURL({
      rating: selectedRating,
      tags: selectedTags.length > 0 ? selectedTags.join(",") : null,
    });
  }, [selectedRating, selectedTags]);

  const handlePriceDragEnd = () => {
    updateURL({ min: priceRange[0], max: priceRange[1] === 15000 ? null : priceRange[1] });
  };

  const handlePriceInput = (index: 0 | 1, val: number) => {
    const newRange = [...priceRange];
    newRange[index] = val;
    setPriceRange(newRange);
    updateURL({ min: newRange[0], max: newRange[1] === 15000 ? null : newRange[1] });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <aside style={{ width: 260, flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "12px 16px", background: "var(--red)", borderRadius: "var(--radius)", color: "white" }}>
        <Sliders size={18} />
        <span style={{ fontWeight: 700, fontSize: 15 }}>Filters</span>
        {(selectedRating > 0 || selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < 15000) && (
          <button onClick={() => { setPriceRange([0, 15000]); setSelectedRating(0); setSelectedTags([]); router.push(pathname); }} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: 12, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>
            Clear
          </button>
        )}
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
            {dbCategories.map(cat => (
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
            <input type="range" min={0} max={15000} value={priceRange[1]} 
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              onMouseUp={handlePriceDragEnd}
              onTouchEnd={handlePriceDragEnd}
              style={{ width: "100%", accentColor: "var(--red)", cursor: "pointer" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input type="number" placeholder="Min" value={priceRange[0]} onChange={e => handlePriceInput(0, +e.target.value)}
                className="input" style={{ flex: 1, fontSize: 13, padding: "8px 10px" }} />
              <input type="number" placeholder="Max" value={priceRange[1]} onChange={e => handlePriceInput(1, +e.target.value)}
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
                <div className="stars" style={{ display: "flex" }}>
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
          {["In Stock", "On Sale", "New Arrivals", "Best Seller", "COD Only"].map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button key={tag} onClick={() => toggleTag(tag)}
                style={{ 
                  padding: "6px 12px", border: "1px solid", 
                  borderColor: isSelected ? "var(--red)" : "var(--gray-200)", 
                  borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600, 
                  background: isSelected ? "var(--red)" : "white", 
                  color: isSelected ? "white" : "var(--gray-600)", 
                  cursor: "pointer", transition: "all 0.2s" 
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
