"use client";
import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { products } from "@/data/products";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");

  // Extract unique categories from products data
  const categoriesMap = products.reduce((acc, p) => {
    if (!acc[p.category]) {
      acc[p.category] = { name: p.category, count: 0, products: [] };
    }
    acc[p.category].count += 1;
    acc[p.category].products.push(p);
    return acc;
  }, {} as Record<string, { name: string; count: number; products: any[] }>);

  const categories = Object.values(categoriesMap);
  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Categories</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage your product categories</p>
        </div>
        <button className="btn-gray" style={{ background: "var(--gray-900)", color: "white", gap: 8 }}>
          <Plus size={16} /> Add New Category
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Category Name</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Products Count</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              >
                <td style={{ padding: "16px 24px", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>
                  {c.name}
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-700)" }}>
                  {c.count} Products
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "var(--radius-full)" }}>Active</span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
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
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
