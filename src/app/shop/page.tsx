"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Grid, List, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ShopSidebar from "@/components/ShopSidebar";
import { products } from "@/data/products";

const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Most Popular", "Top Rated"];

export default function ShopPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Newest First");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchParams = useSearchParams();

  const filteredProducts = useMemo(() => {
    const q = searchParams.get("q")?.toLowerCase();
    const min = searchParams.get("min") ? Number(searchParams.get("min")) : 0;
    const max = searchParams.get("max") ? Number(searchParams.get("max")) : 15000;
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : 0;
    const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];

    let filtered = products.filter(p => {
      // Search query
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      // Price range
      if (p.price < min || p.price > max) return false;
      // Rating
      if (rating > 0 && p.rating < rating) return false;
      // Tags
      if (tags.length > 0) {
        let tagMatch = true;
        if (tags.includes("In Stock") && !p.inStock) tagMatch = false;
        if (tags.includes("On Sale") && !p.originalPrice) tagMatch = false;
        if (tags.includes("New Arrivals") && !p.isNew) tagMatch = false;
        if (tags.includes("Best Seller") && !p.isBestSeller) tagMatch = false;
        if (!tagMatch) return false;
      }
      return true;
    });

    // Sorting
    if (sort === "Price: Low to High") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "Most Popular") filtered.sort((a, b) => b.reviews - a.reviews);
    else if (sort === "Top Rated") filtered.sort((a, b) => b.rating - a.rating);
    // Newest First is default, we can assume original array order or by id.

    return filtered;
  }, [searchParams, sort]);

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
              <h1 style={{ fontWeight: 800, fontSize: 22, color: "var(--gray-900)" }}>
                {searchParams.get("q") ? `Search: "${searchParams.get("q")}"` : "All Products"}
              </h1>
              <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{filteredProducts.length} products found</p>
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
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No products found</h3>
              <p style={{ color: "var(--gray-500)" }}>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(240px, 1fr))" : "1fr", gap: 20 }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
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
