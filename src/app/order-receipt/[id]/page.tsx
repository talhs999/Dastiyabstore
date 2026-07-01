"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, CreditCard, User, MapPin, ShoppingBag, Download, ArrowLeft } from "lucide-react";

export default function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const cleanId = id.trim().toLowerCase();
        const res = await fetch(`/api/orders/${cleanId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--gray-200)", borderTopColor: "var(--red)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--gray-500)", fontWeight: 500 }}>Loading digital invoice...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>Invoice Not Found</h1>
        <p style={{ color: "var(--gray-500)", maxWidth: 360, marginBottom: 24 }}>The invoice link you scanned is invalid or the order does not exist.</p>
        <Link href="/" className="btn-red" style={{ textDecoration: "none" }}>Go to Storefront</Link>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div style={{ background: "var(--gray-50)", minHeight: "100vh", padding: "40px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        
        {/* Actions header (Hidden on print) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--gray-600)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <button onClick={() => window.print()} className="btn-red" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13 }}>
            <Download size={15} /> Save / Print PDF
          </button>
        </div>

        {/* Invoice Card */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          
          {/* Logo Header */}
          <div style={{ background: "linear-gradient(135deg, var(--red) 0%, #a81c2b 100%)", padding: "32px 24px", color: "white", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <img src="/logo.png" alt="Dastiyab Store Logo" style={{ height: 80, objectFit: "contain", background: "white", borderRadius: "50%", padding: 4 }} />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--yellow)", opacity: 0.9 }}>Digital Invoice</h2>
          </div>

          <div style={{ padding: "32px 24px" }}>
            
            {/* Top Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderBottom: "1px dashed var(--gray-200)", paddingBottom: 24, marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 0.5 }}>Order Number</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--gray-900)", marginTop: 2 }}>{order.id.split("-")[0].toUpperCase()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 0.5 }}>Invoice Date</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)", marginTop: 2 }}>{formattedDate}</div>
              </div>
            </div>

            {/* Customer & Shipping details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, borderBottom: "1px dashed var(--gray-200)", paddingBottom: 24, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-900)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={13} color="var(--red)" /> Customer details
                </h3>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>{order.customer_name}</div>
                {order.customer_email && <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{order.customer_email}</div>}
                {order.customer_phone && <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{order.customer_phone}</div>}
              </div>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-900)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={13} color="var(--red)" /> Shipping Address
                </h3>
                <div style={{ fontSize: 13, color: "var(--gray-700)", lineHeight: 1.5 }}>
                  {order.shipping_address}, {order.shipping_city}
                </div>
              </div>
            </div>

            {/* Payment & Status Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, borderBottom: "1px dashed var(--gray-200)", paddingBottom: 24, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-900)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <CreditCard size={13} color="var(--red)" /> Payment Mode
                </h3>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-800)" }}>
                  {order.payment_method === "COD" ? "Cash on Delivery (COD)" : order.payment_method || "COD"}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-900)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle size={13} color="var(--red)" /> Delivery Status
                </h3>
                <span style={{
                  display: "inline-block", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                  background: order.status === "Completed" || order.status === "Delivered" ? "#d1fae5" : "#fef3c7",
                  color: order.status === "Completed" || order.status === "Delivered" ? "#047857" : "#b45309"
                }}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--gray-900)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Items Ordered</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {order.order_items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < order.order_items.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--gray-50)", border: "1px solid var(--gray-200)", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                      <img src={item.product_image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-800)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.product_name}</div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>Qty: {item.quantity} × Rs {item.price.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 18, border: "1px solid var(--gray-200)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>Rs {order.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                <span>Shipping Fee</span>
                <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{order.shipping_fee === 0 ? "FREE" : `Rs ${order.shipping_fee}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-600)", marginBottom: 8 }}>
                <span>Tax (GST 0%)</span>
                <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>Rs 0</span>
              </div>
              <div style={{ height: 1, background: "var(--gray-200)", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--gray-900)" }}>Grand Total</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "var(--red)" }}>Rs {order.total_amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "var(--gray-400)", lineHeight: 1.5 }}>
              <p>Thank you for shopping at <strong>DastiyabStore</strong>!</p>
              <p style={{ marginTop: 4 }}>For tracking or support, visit our website at <a href="/" style={{ color: "var(--red)", textDecoration: "none", fontWeight: 600 }}>dastiyabstore.com</a></p>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          div[style*="background: var(--gray-50)"] {
            background: white !important;
            padding: 0 !important;
          }
          div[style*="box-shadow:"] {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
