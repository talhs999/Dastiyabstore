"use client";
import { useState, use, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Grid, List, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ShopSidebar from "@/components/ShopSidebar";
import { products } from "@/data/products";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Most Popular", "Top Rated"];

const categoryMap: Record<string, string> = {
  "neck-fan": "Neck Fan",
  "laptop-stand": "Laptop Stand",
  "airpods": "AirPods / TWS",
  "neckband": "Neckband Earphones",
  "portable-fan": "Portable Fan",
  "mobile-accessories": "Mobile Accessories",
  "home-gadgets": "Home Gadgets",
};

function CategoryContent({ params }: { params: Promise<{ category: string }> }) {
  const unwrappedParams = use(params);
  const categorySlug = unwrappedParams.category;
  
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Newest First");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>(products);

  const searchParams = useSearchParams();
  const categoryName = categoryMap[categorySlug] || categorySlug.replace("-", " ");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(name)");

        if (data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            image: p.image,
            images: p.images,
            rating: Number(p.rating || 0),
            reviews: Number(p.reviews || 0),
            badge: p.badge,
            badgeType: p.badge_type,
            isNew: p.is_new,
            inStock: p.in_stock !== undefined ? p.in_stock : true,
            stock_quantity: p.stock_quantity,
            category: p.categories?.name || "",
            description: p.description || "",
            specs: p.specs,
            features: p.features,
            isFeatured: p.is_featured,
            isBestSeller: p.is_best_seller,
          }));
          setDbProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching shop products:", err);
      }
    }
    fetchProducts();
  }, []);
  
  const filteredProducts = useMemo(() => {
    const q = searchParams.get("q")?.toLowerCase();
    const min = searchParams.get("min") ? Number(searchParams.get("min")) : 0;
    const max = searchParams.get("max") ? Number(searchParams.get("max")) : 15000;
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : 0;
    const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];

    let filtered = dbProducts.filter(p => {
      // Must match category
      if (p.category !== categoryMap[categorySlug] && p.category.toLowerCase() !== categoryName.toLowerCase()) return false;

      // Search query
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
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
    if (sort === "Price: Low to High") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "Most Popular") filtered.sort((a, b) => b.reviews - a.reviews);
    else if (sort === "Top Rated") filtered.sort((a, b) => b.rating - a.rating);

    return filtered;
  }, [categorySlug, categoryName, searchParams, sort]);

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
          <ShopSidebar currentCategory={categoryName} />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 22, color: "var(--gray-900)", textTransform: "capitalize" }}>{categoryName}</h1>
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
          {filteredProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(240px, 1fr))" : "1fr", gap: 20 }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
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
        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function CategoryPage(props: { params: Promise<{ category: string }> }) {
  return (
    <Suspense fallback={<div style={{ padding: "100px 40px", textAlign: "center", color: "var(--gray-500)", fontSize: 16 }}>Loading Category...</div>}>
      <CategoryContent {...props} />
    </Suspense>
  );
}
