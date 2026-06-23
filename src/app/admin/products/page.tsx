"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Image,
  Star, Settings, Plus, Search, Edit, Trash2, ChevronRight, Eye, ChevronLeft
} from "lucide-react";
import { products } from "@/data/products";
import { ShoppingBag as Brand } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Products", href: "/admin/products", icon: <Package size={18} /> },
  { label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={18} /> },
  { label: "Customers", href: "/admin/customers", icon: <Users size={18} /> },
  { label: "Coupons", href: "/admin/coupons", icon: <Tag size={18} /> },
  { label: "Banners", href: "/admin/banners", icon: <Image size={18} /> },
  { label: "Reviews", href: "/admin/reviews", icon: <Star size={18} /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
];

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 64 : 240, flexShrink: 0, background: "var(--gray-900)", display: "flex", flexDirection: "column", transition: "width 0.3s", position: "relative" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--gray-800)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--red), var(--yellow))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Brand size={20} color="white" />
          </div>
          {!collapsed && <div><div style={{ fontSize: 14, fontWeight: 900, color: "var(--red)" }}>DastiyabStore</div><div style={{ fontSize: 10, color: "var(--yellow)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Panel</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 2, textDecoration: "none", background: link.href === "/admin/products" ? "rgba(230,57,70,0.2)" : "transparent", color: link.href === "/admin/products" ? "var(--red)" : "var(--gray-400)", fontWeight: link.href === "/admin/products" ? 700 : 500, fontSize: 14, transition: "all 0.2s", borderLeft: link.href === "/admin/products" ? "3px solid var(--red)" : "3px solid transparent" }}>
              <span style={{ flexShrink: 0 }}>{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>
        <button onClick={() => setCollapsed(!collapsed)} style={{ position: "absolute", right: -12, top: 76, width: 24, height: 24, borderRadius: "50%", background: "var(--red)", border: "2px solid var(--gray-900)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--gray-900)" }}>Product Management</h1>
            <p style={{ fontSize: 13, color: "var(--gray-500)" }}>{products.length} products in store</p>
          </div>
          <button className="btn-red" style={{ gap: 8 }}>
            <Plus size={16} /> Add New Product
          </button>
        </div>

        {/* Search */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
            <input className="input" style={{ paddingLeft: 40 }} placeholder="Search products by name or category..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 160 }}>
            <option>All Categories</option>
            {["Neck Fan", "AirPods / TWS", "Laptop Stand", "Neckband Earphones", "Portable Fan"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input" style={{ width: 140 }}>
            <option>All Status</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "2px solid var(--gray-200)" }}>
                {["Product", "Category", "Price", "Stock", "Rating", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={p.image} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)", maxWidth: 200 }}>{p.name.slice(0, 40)}...</div>
                        <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span className="badge badge-gray" style={{ fontSize: 12 }}>{p.category}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: "var(--red)", fontSize: 14 }}>Rs. {p.price.toLocaleString()}</div>
                    {p.originalPrice && <div style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through" }}>Rs. {p.originalPrice.toLocaleString()}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: p.inStock ? "#16a34a" : "var(--red)" }}>
                    {p.inStock ? "In Stock" : "Out"}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "var(--yellow-dark)", fontWeight: 700 }}>★</span>
                      <span style={{ fontWeight: 600 }}>{p.rating}</span>
                      <span style={{ color: "var(--gray-400)", fontSize: 12 }}>({p.reviews})</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-full)", background: p.isFeatured ? "#d1fae5" : "var(--gray-100)", color: p.isFeatured ? "#065f46" : "var(--gray-600)" }}>
                      {p.isFeatured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/product/${p.slug}`} target="_blank" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)", textDecoration: "none", transition: "all 0.2s" }}>
                        <Eye size={15} />
                      </Link>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "#dbeafe", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", transition: "all 0.2s" }}>
                        <Edit size={15} />
                      </button>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", transition: "all 0.2s" }}>
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
    </div>
  );
}
