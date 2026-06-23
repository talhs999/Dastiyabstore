"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Image, Star, Settings,
  Search, ChevronRight, ChevronLeft, Clock, CheckCircle, Truck, RotateCcw, Eye,
  Phone
} from "lucide-react";
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

const orders = [
  { id: "#DS-001", customer: "Ahmed Raza", phone: "0311-2345678", city: "Lahore", amount: 2499, status: "Pending", product: "DastiyabBuds Pro", date: "2026-06-23" },
  { id: "#DS-002", customer: "Fatima Khan", phone: "0333-9876543", city: "Karachi", amount: 1499, status: "Shipped", product: "Neck Fan 360°", date: "2026-06-22" },
  { id: "#DS-003", customer: "Ali Hassan", phone: "0321-1112233", city: "Islamabad", amount: 1999, status: "Delivered", product: "Laptop Stand", date: "2026-06-20" },
  { id: "#DS-004", customer: "Sara Ahmed", phone: "0300-9988776", city: "Multan", amount: 899, status: "Confirmed", product: "Neckband X1", date: "2026-06-22" },
  { id: "#DS-005", customer: "Omar Malik", phone: "0345-5544332", city: "Faisalabad", amount: 699, status: "Pending", product: "USB Fan", date: "2026-06-23" },
  { id: "#DS-006", customer: "Nadia Iqbal", phone: "0302-7788990", city: "Lahore", amount: 2499, status: "Returned", product: "DastiyabBuds Pro", date: "2026-06-18" },
  { id: "#DS-007", customer: "Tariq Hussain", phone: "0301-3344556", city: "Quetta", amount: 1299, status: "Confirmed", product: "DastiyabBuds Lite", date: "2026-06-21" },
];

const statusOptions = ["Pending", "Confirmed", "Shipped", "Delivered", "Returned"];
const statusColors: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "#fef3c7", color: "#92400e" },
  Confirmed: { bg: "#dbeafe", color: "#1e40af" },
  Shipped: { bg: "#ede9fe", color: "#5b21b6" },
  Delivered: { bg: "#d1fae5", color: "#065f46" },
  Returned: { bg: "#fee2e2", color: "#991b1b" },
};

export default function AdminOrdersPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [orderList, setOrderList] = useState(orders);

  const filtered = orderList.filter(o =>
    (filterStatus === "All" || o.status === filterStatus) &&
    (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = (id: string, status: string) => {
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      <aside style={{ width: collapsed ? 64 : 240, flexShrink: 0, background: "var(--gray-900)", display: "flex", flexDirection: "column", transition: "width 0.3s", position: "relative" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--gray-800)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--red), var(--yellow))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Brand size={20} color="white" /></div>
          {!collapsed && <div><div style={{ fontSize: 14, fontWeight: 900, color: "var(--red)" }}>DastiyabStore</div><div style={{ fontSize: 10, color: "var(--yellow)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Panel</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 2, textDecoration: "none", background: link.href === "/admin/orders" ? "rgba(230,57,70,0.2)" : "transparent", color: link.href === "/admin/orders" ? "var(--red)" : "var(--gray-400)", fontWeight: link.href === "/admin/orders" ? 700 : 500, fontSize: 14, transition: "all 0.2s", borderLeft: link.href === "/admin/orders" ? "3px solid var(--red)" : "3px solid transparent" }}>
              <span style={{ flexShrink: 0 }}>{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>
        <button onClick={() => setCollapsed(!collapsed)} style={{ position: "absolute", right: -12, top: 76, width: 24, height: 24, borderRadius: "50%", background: "var(--red)", border: "2px solid var(--gray-900)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      <div style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--gray-900)" }}>Order Management</h1>
            <p style={{ fontSize: 13, color: "var(--gray-500)" }}>{orders.length} total orders</p>
          </div>
          {/* Status filter tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["All", ...statusOptions].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "7px 14px", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: filterStatus === s ? "var(--red)" : "white",
                color: filterStatus === s ? "white" : "var(--gray-600)",
                boxShadow: "var(--shadow-sm)", transition: "all 0.2s",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ background: "white", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
          <Search size={16} color="var(--gray-400)" />
          <input style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "inherit" }} placeholder="Search by order ID or customer name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Orders Table */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "2px solid var(--gray-200)" }}>
                {["Order ID", "Customer", "Product", "Amount", "Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const sc = statusColors[o.status];
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--red)", fontSize: 13 }}>{o.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{o.customer}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={11} /> {o.phone} | {o.city}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-700)" }}>{o.product}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 14, color: "var(--red)" }}>Rs. {o.amount.toLocaleString()}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--gray-500)" }}>{o.date}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{
                        padding: "5px 10px", borderRadius: "var(--radius-full)", border: "none",
                        background: sc.bg, color: sc.color, fontWeight: 700, fontSize: 12, cursor: "pointer", outline: "none",
                      }}>
                        {statusOptions.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button style={{ width: 32, height: 32, borderRadius: 8, background: "var(--gray-100)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)" }}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--gray-400)" }}>
              No orders found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
