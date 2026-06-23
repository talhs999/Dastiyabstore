"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: catData } = await supabase.from("categories").select("*");
    if (catData) setCategories(catData);

    const { data: prodData } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
    if (prodData) setProducts(prodData);
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filtered = products.filter(p => 
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.categories?.name || "").toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter === "All Categories" || p.categories?.name === categoryFilter)
  );

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>{products.length} products in your store</p>
        </div>
        <Link href="/admin/products/new" className="btn-gray" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-900)", color: "white", padding: "10px 16px", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 600, textDecoration: "none" }}>
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search products by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 200, background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option>All Categories</option>
          {categories.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              {["Product", "Category", "Price", "Stock", "Rating", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading products...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No products found.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <img src={p.image} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid var(--gray-200)" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>...{p.id.split("-")[0]}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-700)", background: "var(--gray-100)", padding: "4px 10px", borderRadius: 12 }}>{p.categories?.name || "Uncategorized"}</span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 800, color: "var(--gray-900)", fontSize: 14 }}>Rs. {p.price.toLocaleString()}</div>
                  {p.original_price && <div style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through", marginTop: 2 }}>Rs. {p.original_price.toLocaleString()}</div>}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: p.in_stock ? "#16a34a" : "var(--red)" }}>
                  {p.in_stock ? "In Stock" : "Out of Stock"}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--yellow-dark)", fontWeight: 700 }}>★</span>
                    <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{p.rating}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: "var(--radius-full)", background: p.is_featured ? "#d1fae5" : "var(--gray-100)", color: p.is_featured ? "#065f46" : "var(--gray-600)", textTransform: "uppercase" }}>
                    {p.is_featured ? "Featured" : "Standard"}
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/product/${p.slug}`} target="_blank" style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)", textDecoration: "none", transition: "all 0.2s" }} title="View">
                      <Eye size={15} />
                    </Link>
                    <Link href={`/admin/products/${p.id}`} style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-900)", transition: "all 0.2s" }} title="Edit">
                      <Edit size={15} />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", transition: "all 0.2s" }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
