"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Image,
  Star, Settings, ChevronRight, TrendingUp, TrendingDown, DollarSign,
  Clock, CheckCircle, Truck, RotateCcw, AlertTriangle, Menu, X, ShoppingBag as Brand
} from "lucide-react";
import { products } from "@/data/products";

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

const stats = [
  { label: "Total Revenue", value: "Rs. 428,000", change: "+12%", up: true, icon: <DollarSign size={20} />, color: "var(--red)" },
  { label: "Total Orders", value: "342", change: "+8%", up: true, icon: <ShoppingBag size={20} />, color: "#8b5cf6" },
  { label: "Customers", value: "1,240", change: "+15%", up: true, icon: <Users size={20} />, color: "#0891b2" },
  { label: "Pending Orders", value: "28", change: "-3%", up: false, icon: <Clock size={20} />, color: "var(--yellow-dark)" },
];

const recentOrders = [
  { id: "#DS-001", customer: "Ahmed Raza", city: "Lahore", amount: 2499, status: "Pending", product: "DastiyabBuds Pro" },
  { id: "#DS-002", customer: "Fatima Khan", city: "Karachi", amount: 1499, status: "Shipped", product: "Neck Fan 360°" },
  { id: "#DS-003", customer: "Ali Hassan", city: "Islamabad", amount: 1999, status: "Delivered", product: "Laptop Stand" },
  { id: "#DS-004", customer: "Sara Ahmed", city: "Multan", amount: 899, status: "Confirmed", product: "Neckband X1" },
  { id: "#DS-005", customer: "Omar Malik", city: "Faisalabad", amount: 699, status: "Pending", product: "USB Fan" },
];

const statusColors: Record<string, string> = {
  Pending: "var(--yellow-dark)", Confirmed: "#2563eb", Shipped: "#7c3aed", Delivered: "#16a34a", Returned: "var(--red)"
};

function AdminSidebar({ active, collapsed, onToggle }: { active: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 240, flexShrink: 0,
      background: "var(--gray-900)", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      transition: "width 0.3s ease", position: "relative",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--gray-800)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--red), var(--yellow))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Brand size={20} color="white" />
        </div>
        {!collapsed && <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--red)", lineHeight: 1 }}>DastiyabStore</div>
          <div style={{ fontSize: 10, color: "var(--yellow)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Panel</div>
        </div>}
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {navLinks.map(link => {
          const isActive = active === link.href;
          return (
            <Link key={link.href} href={link.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, marginBottom: 2,
              textDecoration: "none",
              background: isActive ? "rgba(230,57,70,0.2)" : "transparent",
              color: isActive ? "var(--red)" : "var(--gray-400)",
              fontWeight: isActive ? 700 : 500, fontSize: 14,
              transition: "all 0.2s", borderLeft: isActive ? "3px solid var(--red)" : "3px solid transparent",
            }}>
              <span style={{ flexShrink: 0 }}>{link.icon}</span>
              {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
      {/* Collapse toggle */}
      <button onClick={onToggle} style={{
        position: "absolute", right: -12, top: 76,
        width: 24, height: 24, borderRadius: "50%",
        background: "var(--red)", border: "2px solid var(--gray-900)",
        color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}>
        {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
      </button>
    </aside>
  );
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      <AdminSidebar active="/admin" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--gray-900)" }}>Dashboard</h1>
            <p style={{ color: "var(--gray-500)", fontSize: 14 }}>Welcome back! Here's what's happening today.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--gray-700)", fontSize: 13, fontWeight: 600 }}>
              View Store
            </Link>
            <span style={{ fontSize: 13, color: "var(--gray-500)", background: "white", padding: "8px 16px", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-PK", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  {s.icon}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: s.up ? "#16a34a" : "var(--red)", background: s.up ? "#d1fae5" : "#fee2e2", padding: "3px 8px", borderRadius: "var(--radius-full)" }}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {s.change}
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginBottom: 24 }}>
          {/* Recent Orders */}
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 17 }}>Recent Orders</h2>
              <Link href="/admin/orders" style={{ fontSize: 13, color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>View All</Link>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--gray-100)" }}>
                  {["Order", "Customer", "Product", "Amount", "Status"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  >
                    <td style={{ padding: "12px 12px", fontWeight: 700, color: "var(--red)", fontSize: 13 }}>{o.id}</td>
                    <td style={{ padding: "12px 12px", fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{o.customer}</div>
                      <div style={{ color: "var(--gray-400)", fontSize: 12 }}>{o.city}</div>
                    </td>
                    <td style={{ padding: "12px 12px", fontSize: 13, color: "var(--gray-600)" }}>{o.product}</td>
                    <td style={{ padding: "12px 12px", fontWeight: 700, fontSize: 13 }}>Rs. {o.amount.toLocaleString()}</td>
                    <td style={{ padding: "12px 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: `${statusColors[o.status]}20`, color: statusColors[o.status] }}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Low Stock & Quick Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Low Stock Alerts */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={16} color="var(--yellow-dark)" />
                <h3 style={{ fontWeight: 800, fontSize: 15 }}>Low Stock Alert</h3>
              </div>
              {products.slice(0, 3).map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>
                  <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)", marginBottom: 2 }}>{p.name.slice(0, 28)}...</div>
                    <div style={{ fontSize: 12, color: "var(--yellow-dark)", fontWeight: 600 }}>Low Stock — 5 left</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Status Distribution */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Order Status</h3>
              {[
                { label: "Pending", count: 28, color: "var(--yellow-dark)", icon: <Clock size={14} /> },
                { label: "Confirmed", count: 45, color: "#2563eb", icon: <CheckCircle size={14} /> },
                { label: "Shipped", count: 183, color: "#7c3aed", icon: <Truck size={14} /> },
                { label: "Delivered", count: 264, color: "#16a34a", icon: <CheckCircle size={14} /> },
                { label: "Returned", count: 22, color: "var(--red)", icon: <RotateCcw size={14} /> },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--gray-700)" }}>{s.label}</span>
                  <div style={{ flex: 2, height: 6, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.count / 342) * 100}%`, background: s.color, borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-700)", minWidth: 28 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:1024px){div[style*="grid-template-columns: repeat(4, 1fr)"]{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:768px){div[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
