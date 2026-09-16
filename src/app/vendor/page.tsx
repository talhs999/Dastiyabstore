"use client";
import { useEffect, useState } from "react";
import { 
  Package, ShoppingCart, DollarSign, Store, Activity 
} from "lucide-react";
import Link from "next/link";

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sessionStr = localStorage.getItem("customer_session");
        if (sessionStr) {
          const user = JSON.parse(sessionStr);
          if (user.store?.id) {
            const res = await fetch(`/api/vendor/stats?id=${user.store.id}`);
            if (res.ok) {
              const data = await res.json();
              setStats({
                productsCount: data.productsCount || 0,
                ordersCount: data.ordersCount || 0,
                revenue: data.revenue || 0,
              });
            }
          }
        }
      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: "My Products", value: stats.productsCount, icon: <Package size={24} />, color: "#4f46e5", href: "/vendor/products" },
    { label: "My Orders", value: stats.ordersCount, icon: <ShoppingCart size={24} />, color: "#10b981", href: "/vendor/orders" },
    { label: "Total Revenue", value: `Rs ${stats.revenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: "#f59e0b", href: "/vendor/orders" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <Store size={28} color="var(--red)" />
        My Store Dashboard
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", padding: 24, borderRadius: "var(--radius)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 20,
              transition: "transform 0.2s",
              cursor: "pointer"
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: "50%", background: `${stat.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", color: stat.color
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, color: "var(--gray-500)", fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>{stat.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        background: "white", padding: 30, borderRadius: "var(--radius)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={20} color="var(--gray-500)" />
          Recent Activity
        </h2>
        <div style={{ padding: 20, textAlign: "center", color: "var(--gray-500)", background: "var(--gray-50)", borderRadius: 8 }}>
          No recent activity to show.
        </div>
      </div>
    </div>
  );
}
