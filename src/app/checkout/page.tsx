"use client";
import { useState } from "react";
import Image from "next/image";
import { CheckCircle, User, MapPin, Phone, Mail, Zap, Truck, Shield, ChevronRight, Loader2 } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { supabase } from "@/lib/supabase";

const steps = ["Shipping", "Review", "Confirm"];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", notes: "" });
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { items, totalPrice, clearCart } = useCart();
  const shipping = totalPrice >= 2000 ? 0 : 200;

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: form.address,
          shipping_city: form.city,
          order_notes: form.notes,
          subtotal: totalPrice,
          shipping_fee: shipping,
          total_amount: totalPrice + shipping,
          payment_method: 'COD',
          status: 'Pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(order.id);
      setPlaced(true);
      clearCart();
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("There was an error submitting your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="animate-scale-in" style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 12 }}>Order Placed Successfully!</h1>
          <p style={{ color: "var(--gray-500)", marginBottom: 8, lineHeight: 1.7 }}>
            Thank you for your order! Our team will call you shortly to confirm delivery. You will receive your order within 2–3 business days.
          </p>
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, margin: "24px 0", border: "1px solid var(--gray-200)" }}>
            <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 8 }}>
              Order Number: <strong style={{ color: "var(--gray-900)", userSelect: "all" }}>{orderId}</strong>
            </p>
            <p style={{ fontSize: 14, color: "var(--gray-600)" }}>
              Payment Method: <strong style={{ color: "var(--red)" }}>Cash on Delivery</strong>
            </p>
            <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 12 }}>Please save your order number to track your order status.</p>
          </div>
          <a href="/" className="btn-red" style={{ textDecoration: "none", display: "inline-flex" }}>
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)", marginBottom: 32 }}>
        Checkout
      </h1>

      {/* Progress Steps */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 40, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: i <= step ? "var(--red)" : "var(--gray-200)",
                color: i <= step ? "white" : "var(--gray-500)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, transition: "all 0.3s",
              }}>
                {i < step ? <CheckCircle size={18} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: i <= step ? "var(--red)" : "var(--gray-400)", whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? "var(--red)" : "var(--gray-200)", margin: "0 12px", marginBottom: 22, transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>

        {/* Form */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 32, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <User size={20} color="var(--red)" /> Shipping Information
              </h2>
              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="Muhammad Ali" value={form.name} onChange={e => set("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input className="input" placeholder="0300-1234567" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div>
                  <label className="label">Complete Address *</label>
                  <input className="input" placeholder="House no., Street, Area" value={form.address} onChange={e => set("address", e.target.value)} />
                </div>
                <div>
                  <label className="label">City *</label>
                  <select className="input" value={form.city} onChange={e => set("city", e.target.value)}>
                    <option value="">Select City</option>
                    {["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Order Notes (Optional)</label>
                  <textarea className="input" rows={3} placeholder="Any special instructions?" value={form.notes} onChange={e => set("notes", e.target.value)} style={{ resize: "vertical" }} />
                </div>
              </div>
              <button onClick={() => setStep(1)} className="btn-red" style={{ marginTop: 24, justifyContent: "center" }}
                disabled={!form.name || !form.phone || !form.address || !form.city}>
                Continue to Review <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-up">
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={20} color="var(--red)" /> Review Your Order
              </h2>
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, marginBottom: 20, border: "1px solid var(--gray-200)" }}>
                <p style={{ fontWeight: 700, color: "var(--gray-800)", marginBottom: 8 }}>Delivering to:</p>
                <p style={{ color: "var(--gray-700)", fontSize: 15 }}>{form.name}</p>
                <p style={{ color: "var(--gray-600)", fontSize: 14 }}>{form.address}, {form.city}</p>
                <p style={{ color: "var(--gray-600)", fontSize: 14 }}>{form.phone}</p>
              </div>
              {/* Payment Method */}
              <div style={{ border: "2px solid var(--yellow)", borderRadius: "var(--radius)", padding: 20, marginBottom: 20, background: "#fffbeb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Zap size={20} fill="var(--yellow)" color="var(--yellow-dark)" />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: 13, color: "var(--gray-600)" }}>Pay when your order arrives at your doorstep</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(0)} className="btn-ghost" style={{ border: "2px solid var(--gray-200)" }}>Back</button>
                <button onClick={handleOrder} className="btn-red" style={{ flex: 1, justifyContent: "center" }} disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 24, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-md)", position: "sticky", top: 100, alignSelf: "start" }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Order Summary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: "16px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray-500)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray-500)" }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? "#16a34a" : "var(--gray-900)" }}>{shipping === 0 ? "FREE" : `Rs. ${shipping}`}</span>
            </div>
            <div className="divider" style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Grand Total</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: "var(--red)" }}>Rs. {(totalPrice + shipping).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
