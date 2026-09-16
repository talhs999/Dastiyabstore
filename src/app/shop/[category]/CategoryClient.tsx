"use client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Grid, List, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ShopSidebar from "@/components/ShopSidebar";
import Link from "next/link";


const categoryMap: Record<string, string> = {
  "neck-fan": "Neck Fan",
  "laptop-stand": "Laptop Stand",
  "airpods-tws": "AirPods / TWS",
  "neckband-earphones": "Neckband Earphones",
  "portable-fan": "Portable Fan",
  "mobile-accessories": "Mobile Accessories",
  "home-gadgets": "Home Gadgets",
  "kitchen-accessiories": "Kitchen Accessories",
};

const sortOptions = ["Recommended", "Newest First", "Price: Low to High", "Price: High to Low", "Most Popular", "Top Rated"];

export default function CategoryClient({ categorySlug, initialProducts }: { categorySlug: string, initialProducts: any[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Recommended");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchParams = useSearchParams();
  const categoryName = categoryMap[categorySlug] || categorySlug.replace("-", " ");

  // Make sure we have a valid array even if initialProducts is undefined/null
  const dbProducts = initialProducts || [];

  const filteredProducts = useMemo(() => {
    const q = searchParams.get("q")?.toLowerCase();
    const min = searchParams.get("min") ? Number(searchParams.get("min")) : 0;
    const max = searchParams.get("max") ? Number(searchParams.get("max")) : 15000;
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : 0;
    const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];

    let filtered = dbProducts.filter(p => {
      // Search query
      if (q) {
        const searchTerms = q.split(/\s+/).filter(Boolean);
        const nameClean = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const descClean = p.description ? p.description.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        
        const matchesAll = searchTerms.every(term => {
          const termClean = term.replace(/[^a-z0-9]/g, '');
          if (!termClean) return true;
          return nameClean.includes(termClean) || descClean.includes(termClean);
        });
        if (!matchesAll) return false;
      }
      
      // Price range
      if (p.price < min || p.price > max) return false;
      // Rating
      if (rating > 0 && p.rating < rating) return false;
      // Tags
      if (tags.length > 0) {
        let tagMatch = true;
        if (tags.includes("In Stock") && !(p.in_stock !== undefined ? p.in_stock : p.inStock)) tagMatch = false;
        if (tags.includes("On Sale") && !p.originalPrice) tagMatch = false;
        if (tags.includes("New Arrivals") && !p.isNew) tagMatch = false;
        if (tags.includes("Best Seller") && !p.isBestSeller) tagMatch = false;
        if (!tagMatch) return false;
      }
      return true;
    });

    // Sorting
    if (sort === "Newest First") {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === "Price: Low to High") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "Price: High to Low") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "Most Popular") {
      filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    } else if (sort === "Top Rated") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    // For "Recommended", we don't sort at all. We just use the randomized order provided by the server!

    return filtered;
  }, [dbProducts, searchParams, sort]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "var(--gray-500)" }}>
        <Link href="/" style={{ color: "var(--gray-500)", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: "var(--gray-500)", textDecoration: "none" }}>Shop</Link>
        <span>/</span>
        <span style={{ color: "var(--gray-900)", fontWeight: 600, textTransform: "capitalize" }}>{categoryName}</span>
      </div>

      <div style={{ display: "flex", gap: 32 }}>
        {/* Sidebar (Desktop) */}
        <div style={{ display: "block" }} className="desktop-only">
          <ShopSidebar currentCategory={categoryName} currentCategorySlug={categorySlug} />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 22, color: "var(--gray-900)", textTransform: "capitalize" }}>{categoryName}</h1>
              <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{filteredProducts.length} products found</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
          {filteredProducts.length > 0 ? (
            <div className={view === "grid" ? "shop-product-grid" : ""} style={view === "list" ? { display: "grid", gridTemplateColumns: "1fr", gap: 20 } : {}}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} view={view as "grid" | "list"} />
              ))}
            </div>
          ) : (
            <div style={{ padding: "64px 0", textAlign: "center", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--gray-300)" }}>
              <p style={{ fontSize: 16, color: "var(--gray-500)", fontWeight: 500 }}>No products found in this category yet.</p>
              <Link href="/shop" className="btn-outline-red" style={{ marginTop: 16, display: "inline-flex", textDecoration: "none" }}>
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .shop-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .shop-product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
          .shop-product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
