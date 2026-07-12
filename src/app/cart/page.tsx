"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, ArrowRight, Tag, Package, Truck } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { Minus, Plus } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

export default function CartPage() {
  const { freeDelivery } = useSettings();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  
  // Shipping is calculated at checkout based on actual city/rules
  const shipping = 0;
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
            {items.map((item, index) => (
              <div key={`${item.id}-${item.color || index}`} className="cart-item" style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                
                {/* Image and Details */}
                <div style={{ display: "flex", gap: 16, flex: "1 1 250px", alignItems: "center" }}>
                  <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0, borderRadius: 8, overflow: "hidden", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Invalid+Image'; }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--gray-900)", marginBottom: 6, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</h3>
                    {item.color && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: item.colorHex || "#ccc", border: "1px solid var(--gray-200)" }}></div>
                        <span style={{ fontSize: 13, color: "var(--gray-500)", fontWeight: 500 }}>{item.color}</span>
                      </div>
                    )}
                    <p style={{ color: "var(--red)", fontWeight: 800, fontSize: 16 }}>Rs. {item.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Quantity and Total */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: "1 1 200px", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--gray-50)", padding: "4px 8px", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                    <button onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)} className="qty-btn" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--gray-600)" }}><Minus size={16} /></button>
                    <span style={{ fontWeight: 700, fontSize: 15, minWidth: 24, textAlign: "center", color: "var(--gray-900)" }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)} className="qty-btn" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--gray-600)" }}><Plus size={16} /></button>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <p style={{ fontWeight: 800, fontSize: 17, color: "var(--gray-900)" }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    <button onClick={() => removeFromCart(item.id, item.color)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", marginTop: 4, padding: "4px 0", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
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
                  <div style={{ paddingBottom: 16, borderBottom: "1px dashed var(--gray-200)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "var(--gray-600)" }}>Shipping</span>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "var(--gray-500)" }}>Calculated at checkout</span>
                    </div>
                    {freeDelivery?.is_active && totalPrice < freeDelivery.threshold && (
                      <div style={{ fontSize: 13, color: "var(--red)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Truck size={14} /> 
                        Add Rs. {(freeDelivery.threshold - totalPrice).toLocaleString()} more for free shipping
                      </div>
                    )}
                  </div>
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
                {["COD Available — Pay on Delivery", "Secure & Encrypted Checkout", "Easy 5-Day Returns"].map((t, i) => (
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
