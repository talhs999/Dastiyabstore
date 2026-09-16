"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Search, Eye, Download, Printer, X, MapPin, User, Calendar, CreditCard, ChevronRight } from "lucide-react";

const statusOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];
const statusColors: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "#fef3c7", color: "#b45309" },
  Processing: { bg: "#dbeafe", color: "#1e40af" },
  Shipped: { bg: "#ede9fe", color: "#5b21b6" },
  Completed: { bg: "#d1fae5", color: "#047857" },
  Cancelled: { bg: "#fee2e2", color: "#b91c1c" },
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [printingSlips, setPrintingSlips] = useState<any[] | null>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.store?.id) {
          setStoreId(user.store.id);
          fetchOrders(user.store.id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
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

  const fetchOrders = async (id: string) => {
    setLoading(true);
    const res = await fetch(`/api/vendor/orders?store_id=${id}`);
    if (res.ok) {
      setOrders(await res.json());
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch("/api/vendor/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, store_id: storeId, status: newStatus })
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

  const handlePrintSlip = (order: any) => {
    setPrintingSlips([order]);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === "All" || o.status === filterStatus;
    const matchesSearch = (o.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          o.id.toLowerCase().includes(search.toLowerCase()) ||
                          (o.customer_phone || "").includes(search);
    return matchesStatus && matchesSearch;
  });

  if (!storeId) return <div style={{ padding: 40 }}>Please login to view orders.</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)" }}>Manage Orders</h1>
          <p style={{ color: "var(--gray-500)" }}>View and update your order statuses</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden", marginBottom: 32 }}>
        <div style={{ padding: 24, borderBottom: "1px solid var(--gray-200)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", background: "var(--gray-50)" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 36px", border: "1px solid var(--gray-200)", borderRadius: 8, outline: "none", fontSize: 14 }}
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid var(--gray-200)", borderRadius: 8, outline: "none", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            <option value="All">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Orders Table */}
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Order ID & Date</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No orders found.</td></tr>
              ) : filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>#{o.id.split("-")[0].toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{new Date(o.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{o.shipping_city}</div>
                  </td>
                  <td style={{ padding: "16px 24px", fontWeight: 700 }}>
                    Rs. {o.total_amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <select 
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      style={{
                        padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        background: statusColors[o.status]?.bg || "var(--gray-100)",
                        color: statusColors[o.status]?.color || "var(--gray-600)",
                        border: "none", outline: "none"
                      }}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setActiveOrder(o)} className="btn-ghost" style={{ padding: 8, background: "var(--gray-100)", border: "none", borderRadius: 8, cursor: "pointer", color: "var(--gray-700)" }} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handlePrintSlip(o)} className="btn-ghost" style={{ padding: 8, background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 8, cursor: "pointer" }} title="Print Packing Slip">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                        {item.color && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.colorHex || "#ccc", border: "1px solid var(--gray-200)" }}></div>
                            <span style={{ fontSize: 11, color: "var(--gray-500)" }}>{item.color}</span>
                          </div>
                        )}
                        {item.size && (
                          <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2, fontWeight: 500 }}>
                            Size: <span style={{ fontWeight: 700 }}>{item.size}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Qty: {item.quantity} × Rs {item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost & Profit Margin Summary */}
              <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 18, border: "1px solid var(--gray-200)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-800)", textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Profit / Margin Settings</h4>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/vendor/orders`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: activeOrder.id,
                            store_id: activeOrder.store_id,
                            status: activeOrder.status,
                            delivery_paid: activeOrder.delivery_paid,
                            items: activeOrder.order_items
                          })
                        });
                        if (res.ok) {
                          alert("Profit margins saved successfully!");
                          setOrders(orders.map(o => o.id === activeOrder.id ? { ...o, delivery_paid: activeOrder.delivery_paid, items: JSON.stringify(activeOrder.order_items) } : o));
                        } else alert("Failed to save.");
                      } catch (err) { alert("Error saving."); }
                    }}
                    style={{ background: "var(--gray-900)", color: "white", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >SAVE</button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {activeOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--gray-600)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>{item.product_name} (Cost)</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--gray-500)" }}>Rs</span>
                        <input
                          type="number"
                          style={{ width: 70, padding: "4px 8px", fontSize: 12, border: "1px solid var(--gray-300)", borderRadius: 4, textAlign: "right" }}
                          value={item.buying_cost || 0}
                          onChange={(e) => {
                            const newItems = [...activeOrder.order_items];
                            newItems[idx].buying_cost = parseFloat(e.target.value) || 0;
                            setActiveOrder({ ...activeOrder, order_items: newItems });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--gray-200)", paddingTop: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--gray-600)" }}>Courier Delivery Paid</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--gray-500)" }}>Rs</span>
                      <input
                        type="number"
                        style={{ width: 70, padding: "4px 8px", fontSize: 12, border: "1px solid var(--gray-300)", borderRadius: 4, textAlign: "right" }}
                        value={activeOrder.delivery_paid || 0}
                        onChange={(e) => {
                          setActiveOrder({ ...activeOrder, delivery_paid: parseFloat(e.target.value) || 0 });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "var(--gray-200)", margin: "16px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>Rs {activeOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                  <span>Shipping Fee</span>
                  <span style={{ fontWeight: 600 }}>{activeOrder.shipping_fee === 0 ? "FREE" : `Rs ${activeOrder.shipping_fee}`}</span>
                </div>
                {activeOrder.discount_amount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--red)", marginBottom: 8 }}>
                    <span>Discount</span>
                    <span style={{ fontWeight: 600 }}>- Rs {activeOrder.discount_amount?.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--gray-900)" }}>Final Revenue</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "var(--gray-900)" }}>Rs {activeOrder.total_amount?.toLocaleString()}</span>
                </div>
                
                <div style={{ background: "var(--gray-900)", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>NET MARGIN</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#10b981" }}>
                    Rs {(
                      (activeOrder.total_amount || 0) 
                      - (activeOrder.order_items?.reduce((acc: number, item: any) => acc + ((item.buying_cost || 0) * (item.quantity || 1)), 0) || 0)
                      - (activeOrder.delivery_paid || 0)
                    ).toLocaleString()}
                  </span>
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
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Print View for Packing Slip */}
      {printingSlips && printingSlips.length > 0 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "white", overflowY: "auto" }}>
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
                    {/* Left side: Vendor Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {order.store?.logo ? (
                          <img src={order.store.logo} alt={order.store.name} style={{ height: 60, width: 60, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
                        ) : (
                          <div style={{ height: 50, width: 50, borderRadius: 8, background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "var(--gray-500)" }}>
                            {order.store?.name?.charAt(0) || "S"}
                          </div>
                        )}
                        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px" }}>
                          {order.store?.name || "Your Store"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 14, color: "var(--gray-700)", textTransform: "uppercase", letterSpacing: "1px" }}>PACKING / INVOICE SLIP</h3>
                    </div>

                    {/* Right side: Dastiyab Store Logo & QR */}
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                      {/* Dastiyab Store small logo */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", marginRight: 4 }}>Powered by</span>
                        <img src="/icon.png" alt="Dastiyab Store" style={{ height: 20, width: 20, objectFit: "contain" }} />
                        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.5px" }}>
                          <span style={{ color: "var(--red)" }}>Dastiyab</span><span style={{ color: "var(--yellow-dark)" }}>Store</span>
                        </span>
                      </div>
                      
                      {/* Smaller QR code below */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 4 }}>
                        <div style={{ padding: 4, background: "white", border: "1px solid var(--gray-200)", borderRadius: 6, display: "inline-block" }}>
                          <QRCode value={qrUrl} size={64} />
                        </div>
                        <span style={{ fontSize: 9, color: "var(--gray-400)", marginTop: 6, maxWidth: 120 }}>Scan to Save Copy</span>
                      </div>
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
                          <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--gray-800)" }}>
                            {item.product_name}
                            {(item.color || item.size) && (
                              <div style={{ fontSize: 10, color: "var(--gray-500)", fontWeight: 500, marginTop: 2 }}>
                                {item.color ? `Color: ${item.color}` : ""}
                                {item.color && item.size ? " | " : ""}
                                {item.size ? `Size: ${item.size}` : ""}
                              </div>
                            )}
                          </td>
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
      )}
    </div>
  );
}
