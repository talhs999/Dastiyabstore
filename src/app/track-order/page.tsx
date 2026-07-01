"use client";
import { useState } from "react";
import { Search, Package, MapPin, Truck, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = orderNumber.trim().toLowerCase();
    if (!input) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setItems([]);

    try {
      const res = await fetch(`/api/orders/${input}`);
      if (!res.ok) {
        throw new Error("Order not found");
      }

      const data = await res.json();
      setOrder(data);
      setItems(data.order_items || []);
    } catch (err: any) {
      console.error(err);
      setError("Order not found. Please check your order number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return "var(--yellow-dark)";
      case 'processing': return "#3b82f6";
      case 'shipped': return "#8b5cf6";
      case 'delivered': return "#16a34a";
      case 'cancelled': return "var(--red)";
      default: return "var(--gray-500)";
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", minHeight: "65vh" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--gray-900)", marginBottom: 12 }}>Track Your Order</h1>
        <p style={{ color: "var(--gray-500)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
          Enter your order number below to check the current status of your shipment.
        </p>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 32, boxShadow: "var(--shadow-md)", border: "1px solid var(--gray-200)", marginBottom: 32 }}>
        <form onSubmit={handleTrack} style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={20} color="var(--gray-400)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Enter Order Number (e.g. 550e8400-e29b-...)" 
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: "var(--radius)", border: "2px solid var(--gray-200)", fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "var(--red)"}
              onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-red" style={{ padding: "0 32px" }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Track"}
          </button>
        </form>

        {error && (
          <div className="animate-fade-up" style={{ marginTop: 24, padding: 16, background: "#fef2f2", color: "var(--red)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 12, border: "1px solid #fecaca" }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}
      </div>

      {order && (
        <div className="animate-fade-up">
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            
            {/* Status Header */}
            <div style={{ padding: 24, background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Order Status</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: getStatusColor(order.status) }}>{order.status}</h2>
                  {order.status === 'Delivered' && <CheckCircle size={24} color="#16a34a" />}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Order Placed On</p>
                <p style={{ fontWeight: 600, color: "var(--gray-900)" }}>{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 32 }}>
                <div>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--gray-500)", marginBottom: 8 }}>
                    <MapPin size={16} /> Shipping Address
                  </h4>
                  <p style={{ fontWeight: 600, color: "var(--gray-900)" }}>{order.customer_name}</p>
                  <p style={{ fontSize: 14, color: "var(--gray-600)" }}>{order.shipping_address}</p>
                  <p style={{ fontSize: 14, color: "var(--gray-600)" }}>{order.shipping_city}, Pakistan</p>
                  <p style={{ fontSize: 14, color: "var(--gray-600)" }}>{order.customer_phone}</p>
                </div>
                <div>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--gray-500)", marginBottom: 8 }}>
                    <Package size={16} /> Order Summary
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                    <span style={{ color: "var(--gray-600)" }}>Subtotal</span>
                    <span style={{ fontWeight: 500 }}>Rs. {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                    <span style={{ color: "var(--gray-600)" }}>Shipping</span>
                    <span style={{ fontWeight: 500 }}>Rs. {order.shipping_fee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, paddingTop: 8, borderTop: "1px dashed var(--gray-200)" }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 800, color: "var(--red)" }}>Rs. {order.total_amount.toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 8 }}>Payment: {order.payment_method}</p>
                </div>
              </div>

              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--gray-100)" }}>Items in Order</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <img src={item.product_image} alt={item.product_name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, background: "var(--gray-50)" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: "var(--gray-900)" }}>{item.product_name}</p>
                      <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: 700 }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
