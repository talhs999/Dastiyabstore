"use client";
import { useState } from "react";
import { Grid, List, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ShopSidebar from "@/components/ShopSidebar";
import { products } from "@/data/products";

const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Most Popular", "Top Rated"];

export default function ShopPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Newest First");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "var(--gray-500)" }}>
        <a href="/" style={{ color: "var(--gray-500)", textDecoration: "none" }}>Home</a>
        <span>/</span>
        <span style={{ color: "var(--gray-900)", fontWeight: 600 }}>All Products</span>
      </div>

      <div style={{ display: "flex", gap: 32 }}>
        {/* Sidebar (Desktop) */}
        <div style={{ display: "block" }} className="desktop-only">
          <ShopSidebar />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 22, color: "var(--gray-900)" }}>All Products</h1>
              <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{products.length} products found</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Mobile Filter */}
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-only btn-outline-red" style={{ display: "none", gap: 8 }}>
                <SlidersHorizontal size={16} /> Filter
              </button>
              {/* Sort */}
              <div style={{ position: "relative" }}>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{
                  padding: "9px 36px 9px 14px", border: "2px solid var(--gray-200)", borderRadius: "var(--radius)",
                  fontSize: 14, fontFamily: "inherit", background: "white", cursor: "pointer",
                  color: "var(--gray-700)", fontWeight: 500, outline: "none", appearance: "none",
                }}>
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--gray-500)" }} />
              </div>
              {/* View Toggle */}
              <div style={{ display: "flex", border: "2px solid var(--gray-200)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <button onClick={() => setView("grid")} style={{ padding: "7px 12px", border: "none", cursor: "pointer", background: view === "grid" ? "var(--red)" : "white", color: view === "grid" ? "white" : "var(--gray-500)", transition: "all 0.2s" }}>
                  <Grid size={16} />
                </button>
                <button onClick={() => setView("list")} style={{ padding: "7px 12px", border: "none", cursor: "pointer", background: view === "list" ? "var(--red)" : "white", color: view === "list" ? "white" : "var(--gray-500)", transition: "all 0.2s" }}>
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(240px, 1fr))" : "1fr", gap: 20 }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
