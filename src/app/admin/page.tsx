"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Package, Search } from "lucide-react";
import Link from "next/link";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", display: "flex", alignItems: "center", gap: 12 }}>
          <Package size={28} color="var(--red)" /> Admin Dashboard
        </h1>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/" style={{ color: "var(--gray-600)", textDecoration: "none" }}>Back to Store</Link>
          <button onClick={() => { document.cookie = "admin_session=; path=/; max-age=0"; window.location.href = "/login"; }} style={{ background: "var(--red)", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Logout</button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", gap: 16, alignItems: "center" }}>
          <Search size={20} color="var(--gray-400)" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            style={{ border: "none", outline: "none", fontSize: 16, width: "100%", color: "var(--gray-900)" }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--gray-500)" }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 16px" }} />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--gray-500)" }}>
            No orders found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase" }}>Order ID</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase" }}>Customer</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase" }}>Total</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-600)", textTransform: "uppercase" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-900)", fontWeight: 600 }}>
                      ...{order.id.split("-")[0]}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>{order.customer_name}</div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{order.customer_phone}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>{order.shipping_city}</div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-600)" }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>
                      Rs. {order.total_amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 600,
                          border: "1px solid var(--gray-200)",
                          background: order.status === 'Pending' ? '#fef3c7' : order.status === 'Completed' ? '#d1fae5' : '#fee2e2',
                          color: order.status === 'Pending' ? '#b45309' : order.status === 'Completed' ? '#047857' : '#b91c1c',
                          outline: "none",
                          cursor: "pointer"
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
