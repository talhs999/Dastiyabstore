"use client";
import Link from "next/link";
import { ChevronRight, Package, Clock, Heart, User, MapPin, LogOut, ShoppingBag } from "lucide-react";


const mockOrders = [
  { id: "#DS-001", date: "June 23, 2026", status: "Pending", total: 2499, items: 1, product: "DastiyabBuds Pro" },
  { id: "#DS-002", date: "June 18, 2026", status: "Delivered", total: 1499, items: 1, product: "Neck Fan 360°" },
  { id: "#DS-003", date: "June 10, 2026", status: "Delivered", total: 1999, items: 1, product: "Laptop Stand" },
];

const statusColors: Record<string, string> = { Pending: "var(--yellow-dark)", Delivered: "#16a34a", Shipped: "#7c3aed" };

export default function AccountOrdersPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--gray-500)", marginBottom: 32 }}>
        <Link href="/" style={{ color: "var(--gray-500)", textDecoration: "none" }}>Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: "var(--gray-900)", fontWeight: 600 }}>My Account</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 28 }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-md)", border: "1px solid var(--gray-200)" }}>
            {/* Profile */}
            <div style={{ background: "linear-gradient(135deg, var(--red), #c62333)", padding: "24px 20px", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <User size={28} color="white" />
              </div>
              <div style={{ fontWeight: 800, color: "white", fontSize: 15 }}>Muhammad Ali</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>ali@example.com</div>
            </div>
            {/* Nav */}
            <div style={{ padding: 8 }}>
              {[
                { label: "My Orders", href: "/account/orders", icon: <ShoppingBag size={16} />, active: true },
                { label: "My Profile", href: "/account/profile", icon: <User size={16} /> },
                { label: "Addresses", href: "/account/addresses", icon: <MapPin size={16} /> },
                { label: "Wishlist", href: "/account/wishlist", icon: <Heart size={16} /> },
              ].map(item => (
                <Link key={item.label} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
                  borderRadius: 8, textDecoration: "none", marginBottom: 2,
                  background: item.active ? "#fff0f0" : "transparent",
                  color: item.active ? "var(--red)" : "var(--gray-700)",
                  fontWeight: item.active ? 700 : 500, fontSize: 14,
                  transition: "all 0.2s",
                }}>
                  <span style={{ color: item.active ? "var(--red)" : "var(--gray-500)" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="divider" style={{ margin: "8px 0" }} />
              <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 8, width: "100%", border: "none", background: "none", cursor: "pointer", color: "var(--gray-600)", fontSize: 14, fontWeight: 500 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--gray-900)", marginBottom: 20 }}>
            My <span style={{ color: "var(--red)" }}>Orders</span>
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mockOrders.map(order => (
              <div key={order.id} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: "var(--red)", fontSize: 15 }}>{order.id}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: `${statusColors[order.status] || "var(--gray-400)"}20`, color: statusColors[order.status] || "var(--gray-600)" }}>{order.status}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--gray-700)", fontWeight: 600, marginBottom: 4 }}>{order.product}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--gray-500)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {order.date}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Package size={12} /> {order.items} item{order.items > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--red)" }}>Rs. {order.total.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8 }}>COD</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px", border: "1px solid var(--gray-200)" }}>Track</button>
                      {order.status === "Delivered" && (
                        <button className="btn-red" style={{ fontSize: 12, padding: "6px 14px" }}>Reorder</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 240px 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
