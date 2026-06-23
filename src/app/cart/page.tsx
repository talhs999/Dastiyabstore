"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, ArrowRight, Tag, Package } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { Minus, Plus } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const shipping = totalPrice >= 2000 ? 0 : 200;
  const grandTotal = totalPrice + shipping;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>
        Shopping <span style={{ color: "var(--red)" }}>Cart</span>
      </h1>
      <p style={{ color: "var(--gray-500)", marginBottom: 32 }}>{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <ShoppingCart size={64} color="var(--gray-200)" style={{ margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: "var(--gray-400)", marginBottom: 28 }}>Start adding products to see them here</p>
          <Link href="/shop" className="btn-red" style={{ textDecoration: "none" }}>
            <Package size={18} /> Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>

          {/* Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0, borderRadius: "var(--radius)", overflow: "hidden" }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--gray-900)", marginBottom: 6 }}>{item.name}</h3>
                  <p style={{ color: "var(--red)", fontWeight: 800, fontSize: 18 }}>Rs. {item.price.toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn"><Minus size={13} /></button>
                  <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn"><Plus size={13} /></button>
                </div>
                <div style={{ textAlign: "right", minWidth: 100 }}>
                  <p style={{ fontWeight: 800, fontSize: 16, color: "var(--gray-900)" }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", marginTop: 8, padding: 4, display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, border: "1px solid var(--gray-200)", display: "flex", gap: 12 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Tag size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input type="text" placeholder="Enter promo code" className="input" style={{ paddingLeft: 36 }} />
              </div>
              <button className="btn-red">Apply</button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 24, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-md)", position: "sticky", top: 100 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "var(--gray-900)" }}>Order Summary</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--gray-600)" }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--gray-600)" }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 600, color: shipping === 0 ? "#16a34a" : "var(--gray-900)" }}>
                    {shipping === 0 ? "FREE" : `Rs. ${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p style={{ fontSize: 12, color: "var(--gray-500)", background: "var(--gray-50)", padding: "8px 12px", borderRadius: 8 }}>
                    Add Rs. {(2000 - totalPrice).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>
              <div style={{ borderTop: "2px solid var(--gray-200)", paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: "var(--gray-900)" }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: 24, color: "var(--red)" }}>Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-red" style={{ width: "100%", justifyContent: "center", textDecoration: "none", display: "flex", padding: "14px 24px" }}>
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {["COD Available — Pay on Delivery", "Secure & Encrypted Checkout", "Easy 7-Day Returns"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--gray-500)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", flexShrink: 0 }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
