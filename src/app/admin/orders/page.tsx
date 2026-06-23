"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Phone, Eye, Download } from "lucide-react";

const statusOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];
const statusColors: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "#fef3c7", color: "#b45309" },
  Processing: { bg: "#dbeafe", color: "#1e40af" },
  Shipped: { bg: "#ede9fe", color: "#5b21b6" },
  Completed: { bg: "#d1fae5", color: "#047857" },
  Cancelled: { bg: "#fee2e2", color: "#b91c1c" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert("Failed to update status");
    }
  };

  const filtered = orders.filter(o =>
    (filterStatus === "All" || o.status === filterStatus) &&
    ((o.customer_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
     o.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)", marginBottom: 4 }}>Orders</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Track and manage deliveries</p>
        </div>
        <button style={{ 
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", 
          background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", 
          fontWeight: 600, color: "var(--gray-700)", cursor: "pointer", boxShadow: "var(--shadow-sm)" 
        }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, background: "var(--gray-50)", padding: "10px 16px", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
          <Search size={18} color="var(--gray-400)" />
          <input 
            style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: 14 }} 
            placeholder="Search by order ID, email, or name..." 
            value={search} onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "8px 16px", borderRadius: "var(--radius)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: filterStatus === s ? "var(--gray-900)" : "var(--gray-100)",
              color: filterStatus === s ? "white" : "var(--gray-700)",
              transition: "all 0.2s"
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", width: 40 }}><input type="checkbox" /></th>
              {["ORDER", "DATE", "CUSTOMER", "ITEMS", "STATUS", "TOTAL"].map(h => (
                <th key={h} style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No orders found.</td></tr>
            ) : (
              filtered.map((o) => {
                const sc = statusColors[o.status] || statusColors.Pending;
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "16px 24px" }}><input type="checkbox" /></td>
                    <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>...{o.id.split("-")[0]}</td>
                    <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--gray-600)" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)", display: "flex", alignItems: "center", gap: 8 }}>
                        {o.customer_name}
                        <span style={{ fontSize: 10, padding: "2px 6px", background: "var(--gray-100)", borderRadius: 4, color: "var(--gray-600)" }}>GUEST</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        {o.customer_email || o.customer_phone}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-700)", fontWeight: 500 }}>
                      {o.order_items?.length || 0}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{
                        padding: "6px 12px", borderRadius: "var(--radius-full)", border: "none",
                        background: sc.bg, color: sc.color, fontWeight: 700, fontSize: 12, cursor: "pointer", outline: "none",
                        textTransform: "uppercase", letterSpacing: "0.5px"
                      }}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "var(--gray-900)" }}>Rs {o.total_amount.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
