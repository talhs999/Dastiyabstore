"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { products } from "@/data/products";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const filtered = products.filter(p => 
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter === "All Categories" || p.category === categoryFilter)
  );

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>{products.length} products in your store</p>
        </div>
        <button className="btn-gray" style={{ background: "var(--gray-900)", color: "white", gap: 8 }}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search products by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 200, background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option>All Categories</option>
          {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: 160, background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
          <option>All Status</option>
          <option>In Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              {["Product", "Category", "Price", "Stock", "Rating", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <img src={p.image} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid var(--gray-200)" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{p.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-700)", background: "var(--gray-100)", padding: "4px 10px", borderRadius: 12 }}>{p.category}</span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 800, color: "var(--gray-900)", fontSize: 14 }}>Rs. {p.price.toLocaleString()}</div>
                  {p.originalPrice && <div style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through", marginTop: 2 }}>Rs. {p.originalPrice.toLocaleString()}</div>}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: p.inStock ? "#16a34a" : "var(--red)" }}>
                  {p.inStock ? "In Stock" : "Out of Stock"}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--yellow-dark)", fontWeight: 700 }}>★</span>
                    <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{p.rating}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: "var(--radius-full)", background: p.isFeatured ? "#d1fae5" : "var(--gray-100)", color: p.isFeatured ? "#065f46" : "var(--gray-600)", textTransform: "uppercase" }}>
                    {p.isFeatured ? "Featured" : "Standard"}
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/product/${p.slug}`} target="_blank" style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)", textDecoration: "none" }}>
                      <Eye size={15} />
                    </Link>
                    <button style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-900)" }}>
                      <Edit size={15} />
                    </button>
                    <button style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
