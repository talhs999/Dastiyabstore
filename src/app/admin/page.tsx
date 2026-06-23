"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { products } from "@/data/products";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && ordersData) {
      setOrders(ordersData);
      
      const rev = ordersData.reduce((acc, order) => acc + order.total_amount, 0);
      setTotalRevenue(rev);
      
      // Calculate unique customers based on email
      const uniqueEmails = new Set(ordersData.map(o => o.customer_email));
      setTotalCustomers(uniqueEmails.size);
    }
    setLoading(false);
  };

  const statCards = [
    { label: "TOTAL REVENUE", value: `Rs ${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} color="var(--gray-500)" /> },
    { label: "ACTIVE ORDERS", value: orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length, icon: <ShoppingCart size={20} color="var(--gray-500)" /> },
    { label: "PRODUCTS", value: products.length, icon: <Package size={20} color="var(--gray-500)" /> },
    { label: "TOTAL CUSTOMERS", value: totalCustomers, icon: <Users size={20} color="var(--gray-500)" /> },
  ];

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)" }}>Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "var(--gray-900)", lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}><ArrowUpRight size={14} /> 0%</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        {/* Recent Orders */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--gray-100)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", textDecoration: "none", textTransform: "uppercase" }}>View All</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-100)" }}>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Order ID</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--gray-500)" }}>Loading...</td></tr>
              ) : orders.slice(0, 5).map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>...{o.id.split("-")[0]}</td>
                  <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-700)" }}>{o.customer_name}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                      background: o.status === 'Pending' ? '#fef3c7' : o.status === 'Completed' ? '#d1fae5' : '#fee2e2',
                      color: o.status === 'Pending' ? '#b45309' : o.status === 'Completed' ? '#047857' : '#b91c1c'
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "var(--gray-900)" }}>Rs {o.total_amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8 }}>Quick Actions</h2>
          <Link href="/admin/products" style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", 
            background: "var(--gray-900)", color: "white", borderRadius: "var(--radius-lg)", textDecoration: "none", fontWeight: 600, transition: "opacity 0.2s" 
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}><Package size={18} /> Add New Product</span>
            <ArrowUpRight size={18} />
          </Link>
          <Link href="/admin/orders" style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", 
            background: "white", border: "1px solid var(--gray-200)", color: "var(--gray-900)", borderRadius: "var(--radius-lg)", textDecoration: "none", fontWeight: 600, transition: "background 0.2s" 
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}><ShoppingCart size={18} /> View All Orders</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
