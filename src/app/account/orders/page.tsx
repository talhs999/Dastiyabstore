"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Package, Clock, Heart, User, MapPin, LogOut, ShoppingBag, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const statusColors: Record<string, string> = { 
  Pending: "var(--yellow-dark)", 
  Processing: "#3b82f6",
  Shipped: "#7c3aed",
  Completed: "#16a34a", 
  Delivered: "#16a34a",
  Cancelled: "var(--red)" 
};

export default function AccountOrdersPage() {
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verify customer session
    const sessionStr = localStorage.getItem("customer_session");
    if (!sessionStr) {
      window.location.href = "/login";
      return;
    }

    const sessionUser = JSON.parse(sessionStr);
    setCustomer(sessionUser);

    // 2. Fetch actual orders
    async function loadOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(`customer_email.eq.${sessionUser.email},customer_phone.eq.${sessionUser.phone}`)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("customer_session");
    document.cookie = "customer_session=; path=/; max-age=0";
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <Loader2 size={32} className="animate-spin" color="var(--red)" />
        <p style={{ color: "var(--gray-500)", fontWeight: 500 }}>Loading orders...</p>
      </div>
    );
  }

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
              <div style={{ fontWeight: 800, color: "white", fontSize: 15 }}>{customer?.name || "Customer"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{customer?.email || customer?.phone || ""}</div>
            </div>
            {/* Nav */}
            <div style={{ padding: 8 }}>
              {[
                { label: "My Orders", href: "/account/orders", icon: <ShoppingBag size={16} />, active: true },
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
              <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 8, width: "100%", border: "none", background: "none", cursor: "pointer", color: "var(--gray-600)", fontSize: 14, fontWeight: 500 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--gray-900)", marginBottom: 20 }}>
            My <span style={{ color: "var(--red)" }}>Orders</span>
          </h1>
          
          {orders.length === 0 ? (
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 48, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <ShoppingBag size={48} color="var(--gray-300)" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>No orders placed yet</h3>
              <p style={{ color: "var(--gray-400)", fontSize: 14, maxWidth: 360, margin: "0 auto 24px" }}>
                You haven't ordered anything yet. Browse our top categories and place your first order!
              </p>
              <Link href="/shop" className="btn-red" style={{ textDecoration: "none", display: "inline-flex" }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", transition: "all 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, color: "var(--red)", fontSize: 15 }}>#{order.id.split("-")[0].toUpperCase()}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-full)", background: `${statusColors[order.status] || "var(--gray-400)"}20`, color: statusColors[order.status] || "var(--gray-600)" }}>{order.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 6 }}>
                        {order.shipping_address}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--gray-500)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {new Date(order.created_at).toLocaleDateString("en-PK", { month: "long", day: "numeric", year: "numeric" })}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Package size={12} /> Subtotal: Rs. {order.subtotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 160 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "var(--red)" }}>Rs. {order.total_amount.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8 }}>Payment: {order.payment_method}</div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link href={`/track-order?id=${order.id}`} className="btn-ghost" style={{ fontSize: 12, padding: "6px 14px", border: "1px solid var(--gray-200)", textDecoration: "none", color: "var(--gray-700)", borderRadius: 6 }}>
                          Track
                        </Link>
                        <Link href={`/order-receipt/${order.id}`} className="btn-red" style={{ fontSize: 12, padding: "6px 14px", textDecoration: "none", color: "white", borderRadius: 6 }}>
                          Invoice
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 240px 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
