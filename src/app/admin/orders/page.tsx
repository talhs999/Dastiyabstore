"use client";
import { useState, useEffect } from "react";

import QRCode from "react-qr-code";
import { Search, Phone, Eye, Download, Trash2, Printer, X, CreditCard, Calendar, User, MapPin } from "lucide-react";

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
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Detail Modal states
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  
  // Printing states
  const [printingSlips, setPrintingSlips] = useState<any[] | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (printingSlips && printingSlips.length > 0) {
      const timer = setTimeout(() => {
        window.print();
        setPrintingSlips(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [printingSlips]);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], status: newStatus })
    });
      
    if (res.ok) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (activeOrder && activeOrder.id === id) {
        setActiveOrder({ ...activeOrder, status: newStatus });
      }
    } else {
      const data = await res.json();
      alert("Failed to update status: " + data.error);
    }
  };

  const deleteOrders = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} order(s)?`)) return;
    
    const res = await fetch(`/api/admin/orders?ids=${ids.join(",")}`, { method: "DELETE" });

    if (res.ok) {
      setOrders(orders.filter(o => !ids.includes(o.id)));
      setSelectedIds([]);
      setActiveOrder(null);
    } else {
      const data = await res.json();
      alert("Failed to delete orders: " + data.error);
    }
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedIds.length === 0 || !newStatus) return;

    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, status: newStatus })
    });

    if (res.ok) {
      setOrders(orders.map(o => selectedIds.includes(o.id) ? { ...o, status: newStatus } : o));
      setSelectedIds([]);
      alert(`Updated status of ${selectedIds.length} order(s) to ${newStatus}`);
    } else {
      const data = await res.json();
      alert("Failed to update orders: " + data.error);
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Customer Phone", "Status", "Subtotal", "Shipping Fee", "Total Amount", "Address", "City"];
    const rows = orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.customer_email || "",
      o.customer_phone || "",
      o.status,
      o.subtotal,
      o.shipping_fee,
      o.total_amount,
      `"${(o.shipping_address || "").replace(/"/g, '""')}"`,
      o.shipping_city
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dastiyab_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.shipping_city || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "All" || o.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // If slips are generating for print dialog
  if (printingSlips && printingSlips.length > 0) {
    return (
      <div style={{ background: "white", padding: 0 }}>
        <style>{`
          @media print {
            aside,
            nav,
            header,
            footer,
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}</style>
        {printingSlips.map((order, index) => {
          const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric"
          });
          const qrUrl = typeof window !== "undefined" 
            ? `${window.location.origin}/order-receipt/${order.id}` 
            : `https://dastiyabstore.com/order-receipt/${order.id}`;

          return (
            <div 
              key={order.id} 
              style={{ 
                padding: 40, 
                borderBottom: index < printingSlips.length - 1 ? "2px dashed #9ca3af" : "none",
                pageBreakAfter: index < printingSlips.length - 1 ? "always" : "auto",
                background: "white",
                maxWidth: "800px",
                margin: "0 auto"
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <img src="/icon.png" alt="Dastiyab Store Logo" style={{ height: 56, width: 56, objectFit: "contain", flexShrink: 0, marginLeft: -8 }} />
                      <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                        <span style={{ color: "var(--red)" }}>Dastiyab</span><span style={{ color: "#FFB703" }}>Store</span>
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Karachi, Pakistan | Support: 0300-1234567</p>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 14, color: "var(--gray-700)", textTransform: "uppercase", letterSpacing: "1px" }}>PACKING / INVOICE SLIP</h3>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ padding: 4, background: "white", border: "1px solid var(--gray-200)", borderRadius: 6 }}>
                      <QRCode value={qrUrl} size={100} />
                    </div>
                    <span style={{ fontSize: 9, color: "var(--gray-400)", marginTop: 6, maxWidth: 120 }}>Scan to Save Digital Copy</span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--gray-200)" }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Order Info</span>
                    <div style={{ fontSize: 13, color: "var(--gray-700)", marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div>Order ID: <strong>{order.id.split("-")[0].toUpperCase()}</strong></div>
                      <div>Date: {formattedDate}</div>
                      <div>Payment Method: <strong>{order.payment_method || "COD"}</strong></div>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase" }}>Deliver To</span>
                    <div style={{ fontSize: 13, color: "var(--gray-700)", marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div>Name: <strong>{order.customer_name}</strong></div>
                      <div>Phone: {order.customer_phone}</div>
                      <div>Address: {order.shipping_address}, {order.shipping_city}</div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginBottom: 24 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--gray-800)", background: "var(--gray-50)" }}>
                      <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--gray-600)" }}>ITEM</th>
                      <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--gray-600)", width: 80, textAlign: "center" }}>QTY</th>
                      <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--gray-600)", width: 100, textAlign: "right" }}>PRICE</th>
                      <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--gray-600)", width: 120, textAlign: "right" }}>SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items?.map((item: any, i: number) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--gray-200)" }}>
                        <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--gray-800)" }}>{item.product_name}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gray-700)", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gray-700)", textAlign: "right" }}>Rs {item.price.toLocaleString()}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "var(--gray-900)", textAlign: "right" }}>Rs {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {order.order_notes && (
                  <div style={{ background: "var(--gray-50)", padding: 12, borderRadius: 8, fontSize: 11, color: "var(--gray-600)", marginBottom: 20 }}>
                    <strong>Note:</strong> {order.order_notes}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <div style={{ width: 280 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--gray-600)", marginBottom: 4 }}>
                    <span>Subtotal:</span>
                    <span>Rs {order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--gray-600)", marginBottom: 4 }}>
                    <span>Shipping Fee:</span>
                    <span>Rs {order.shipping_fee?.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 1, background: "var(--gray-300)", margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "var(--gray-900)" }}>
                    <span>Grand Total:</span>
                    <span style={{ color: "var(--red)" }}>Rs {order.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)", marginBottom: 4 }}>Orders</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Track and manage deliveries</p>
        </div>
        <button 
          onClick={exportCSV}
          style={{ 
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", 
            background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", 
            fontWeight: 600, color: "var(--gray-700)", cursor: "pointer", boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gray-400)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--gray-200)"}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter Options */}
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="animate-fade-down" style={{ 
          background: "#fffbeb", border: "1px solid var(--yellow)", borderRadius: "var(--radius-lg)",
          padding: "16px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-700)" }}>
            {selectedIds.length} order(s) selected
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select 
              onChange={e => {
                if (e.target.value) {
                  bulkUpdateStatus(e.target.value);
                  e.target.value = "";
                }
              }}
              style={{
                padding: "8px 14px", border: "1px solid var(--gray-300)", borderRadius: "var(--radius)",
                fontSize: 13, fontWeight: 600, color: "var(--gray-700)", background: "white", cursor: "pointer", outline: "none"
              }}
            >
              <option value="">UPDATE STATUS...</option>
              {statusOptions.map(st => <option key={st} value={st}>{st.toUpperCase()}</option>)}
            </select>

            <button 
              onClick={() => {
                const slipsToPrint = orders.filter(o => selectedIds.includes(o.id));
                setPrintingSlips(slipsToPrint);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                background: "var(--black)", color: "white", border: "none", borderRadius: "var(--radius)",
                fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "var(--shadow-sm)"
              }}
            >
              <Printer size={15} /> DOWNLOAD SLIPS
            </button>

            <button 
              onClick={() => deleteOrders(selectedIds)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                background: "white", border: "1px solid #fee2e2", borderRadius: "var(--radius)",
                fontWeight: 700, fontSize: 13, color: "var(--red)", cursor: "pointer"
              }}
            >
              <Trash2 size={15} /> DELETE
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflowX: "auto", boxShadow: "var(--shadow-sm)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", width: 40 }}>
                <input 
                  type="checkbox" 
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer", width: 16, height: 16 }}
                />
              </th>
              {["ORDER", "DATE", "CUSTOMER", "ITEMS", "STATUS", "TOTAL", "ACTIONS"].map(h => (
                <th key={h} style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No orders found.</td></tr>
            ) : (
              filtered.map((o) => {
                const sc = statusColors[o.status] || statusColors.Pending;
                const isChecked = selectedIds.includes(o.id);
                return (
                  <tr 
                    key={o.id} 
                    style={{ 
                      borderBottom: "1px solid var(--gray-100)",
                      background: isChecked ? "#fffbeb" : "transparent",
                      transition: "background 0.2s"
                    }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleSelectOne(o.id)}
                        style={{ cursor: "pointer", width: 16, height: 16 }}
                      />
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>
                      {o.id.split("-")[0].toUpperCase()}
                    </td>
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
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button 
                          onClick={() => setActiveOrder(o)}
                          style={{
                            padding: "6px 10px", background: "var(--gray-100)", border: "none", borderRadius: 6,
                            cursor: "pointer", color: "var(--gray-700)", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                          title="View Order Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => setPrintingSlips([o])}
                          style={{
                            padding: "6px 10px", background: "var(--gray-100)", border: "none", borderRadius: 6,
                            cursor: "pointer", color: "var(--gray-700)", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                          title="Print Packing Slip"
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => deleteOrders([o.id])}
                          style={{
                            padding: "6px 10px", background: "#fee2e2", border: "none", borderRadius: 6,
                            cursor: "pointer", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Drawer Modal */}
      {activeOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          {/* Overlay */}
          <div 
            onClick={() => setActiveOrder(null)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", transition: "all 0.3s" }} 
          />
          
          {/* Drawer content */}
          <div className="animate-fade-left" style={{
            position: "relative", width: "100%", maxWidth: 580, background: "white", height: "100%",
            display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", zIndex: 1001
          }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Order Details</h3>
                <span style={{ fontSize: 12, color: "var(--gray-400)" }}>ID: {activeOrder.id.split("-")[0].toUpperCase()}</span>
              </div>
              <button 
                onClick={() => setActiveOrder(null)}
                style={{ background: "var(--gray-100)", border: "none", cursor: "pointer", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              
              {/* Customer Details */}
              <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 18, border: "1px solid var(--gray-200)", marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-800)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={15} color="var(--red)" /> Customer Info
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Name</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-900)", marginTop: 2 }}>{activeOrder.customer_name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Phone</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-900)", marginTop: 2 }}>{activeOrder.customer_phone}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Email</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-700)", marginTop: 2 }}>{activeOrder.customer_email || "N/A"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Payment Mode</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-900)", marginTop: 2 }}>{activeOrder.payment_method || "COD"}</div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 18, border: "1px solid var(--gray-200)", marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-800)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={15} color="var(--red)" /> Shipping Information
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Delivery Address</span>
                    <div style={{ fontSize: 13, color: "var(--gray-800)", marginTop: 2, fontWeight: 600, lineHeight: 1.4 }}>
                      {activeOrder.shipping_address}, {activeOrder.shipping_city}
                    </div>
                  </div>
                  {activeOrder.order_notes && (
                    <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Notes / Instructions</span>
                      <div style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2, fontStyle: "italic" }}>
                        {activeOrder.order_notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-800)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Items Summary</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {activeOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", border: "1px solid var(--gray-200)", position: "relative", flexShrink: 0 }}>
                        <img src={item.product_image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-800)" }}>{item.product_name}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Qty: {item.quantity} × Rs {item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 18, border: "1px solid var(--gray-200)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>Rs {activeOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                  <span>Shipping Fee</span>
                  <span style={{ fontWeight: 600 }}>{activeOrder.shipping_fee === 0 ? "FREE" : `Rs ${activeOrder.shipping_fee}`}</span>
                </div>
                <div style={{ height: 1, background: "var(--gray-200)", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--gray-900)" }}>Grand Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--red)" }}>Rs {activeOrder.total_amount?.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: "20px 24px", borderTop: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "var(--gray-50)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)" }}>STATUS:</span>
                <select 
                  value={activeOrder.status} 
                  onChange={e => updateStatus(activeOrder.id, e.target.value)}
                  style={{
                    padding: "6px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--gray-300)",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", outline: "none",
                    background: "white"
                  }}
                >
                  {statusOptions.map(st => <option key={st} value={st}>{st.toUpperCase()}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => setPrintingSlips([activeOrder])}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", 
                    background: "var(--black)", color: "white", border: "none", borderRadius: "var(--radius)",
                    fontWeight: 700, fontSize: 13, cursor: "pointer" 
                  }}
                >
                  <Printer size={14} /> Print Slip
                </button>
                <button 
                  onClick={() => deleteOrders([activeOrder.id])}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", 
                    background: "white", border: "1px solid #fee2e2", borderRadius: "var(--radius)",
                    fontWeight: 700, fontSize: 13, color: "var(--red)", cursor: "pointer" 
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Embedded print styles */}
      <style>{`
        @media print {
          /* Hide main app elements during print mode */
          body > div:not(.print-slips-container), 
          header, 
          footer, 
          aside,
          .no-print {
            display: none !important;
          }
          /* Ensure printable container is shown at 100% size */
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
