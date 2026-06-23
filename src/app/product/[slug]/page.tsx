"use client";
import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, Star, ChevronRight, Zap, CheckCircle, Minus, Plus, MessageCircle, Link as LinkIcon } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, getProductBySlug } from "@/data/products";
import { useCart } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug) || products.find(p => p.id === slug);
  if (!product) return notFound();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImg, setActiveImg] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const images = product.images || [product.image];

  const router = useRouter();

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    showToast(`${qty}x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/checkout");
  };

  const handleWishlist = () => {
    showToast(`${product.name} added to wishlist!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!");
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "var(--gray-500)", flexWrap: "wrap" }}>
        <a href="/" style={{ color: "var(--gray-500)", textDecoration: "none" }}>Home</a>
        <ChevronRight size={14} />
        <a href="/shop" style={{ color: "var(--gray-500)", textDecoration: "none" }}>Shop</a>
        <ChevronRight size={14} />
        <span style={{ color: "var(--gray-900)", fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Product Detail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 64 }}>

        {/* Images */}
        <div>
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--gray-50)", marginBottom: 12, position: "relative", aspectRatio: "4/3" }}>
            <img src={images[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {discount && (
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <span className="badge badge-red">{discount}% OFF</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 12 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 72, height: 72, borderRadius: "var(--radius)", overflow: "hidden",
                  border: `2px solid ${activeImg === i ? "var(--red)" : "var(--gray-200)"}`,
                  cursor: "pointer", padding: 0, background: "var(--gray-50)",
                  transition: "border-color 0.2s",
                }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.badge && <span className={`badge badge-${product.badgeType || "red"}`} style={{ marginBottom: 12 }}>{product.badge}</span>}
          <h1 style={{ fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 800, color: "var(--gray-900)", lineHeight: 1.3, marginBottom: 12 }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= product.rating ? "var(--yellow)" : "none"} color={s <= product.rating ? "var(--yellow)" : "var(--gray-300)"} />)}
            </div>
            <span style={{ fontSize: 14, color: "var(--gray-600)", fontWeight: 500 }}>{product.rating}/5 ({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <span className="price-current" style={{ fontSize: 32 }}>Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="price-original" style={{ fontSize: 18 }}>Rs. {product.originalPrice.toLocaleString()}</span>
                <span className="discount-tag" style={{ fontSize: 14 }}>Save {discount}%</span>
              </>
            )}
          </div>

          {/* Availability */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <CheckCircle size={16} color={product.inStock ? "#16a34a" : "var(--gray-400)"} />
            <span style={{ fontSize: 14, color: product.inStock ? "#16a34a" : "var(--gray-500)", fontWeight: 600 }}>
              {product.inStock ? "In Stock — Ready to Ship" : "Out of Stock"}
            </span>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 24 }}>
            <label className="label">Quantity</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn"><Minus size={14} /></button>
              <span style={{ fontSize: 18, fontWeight: 700, minWidth: 32, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="qty-btn"><Plus size={14} /></button>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={handleAdd} className="btn-red" style={{ flex: 1, justifyContent: "center", minWidth: 160 }}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn-yellow" style={{ flex: 1, justifyContent: "center", minWidth: 160 }}>
              <Zap size={18} /> Buy Now
            </button>
            <button onClick={handleWishlist} className="btn-ghost" style={{ border: "2px solid var(--gray-200)", padding: "12px 14px" }}>
              <Heart size={18} />
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowShare(!showShare)} className="btn-ghost" style={{ border: "2px solid var(--gray-200)", padding: "12px 14px", height: "100%" }}>
                <Share2 size={18} />
              </button>
              {showShare && (
                <div className="animate-fade-up" style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 8, background: "white", padding: 8, borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 4, minWidth: 150, zIndex: 10, border: "1px solid var(--gray-200)" }}>
                  <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--gray-700)", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <MessageCircle size={16} color="#25D366" /> WhatsApp
                  </button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--gray-700)", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> Facebook
                  </button>
                  <button onClick={() => { handleShare(); setShowShare(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--gray-700)", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <LinkIcon size={16} color="var(--gray-500)" /> Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery info */}
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--gray-200)" }}>
            {[
              { icon: <Truck size={16} color="var(--red)" />, text: "Free delivery on orders above Rs. 2000" },
              { icon: <Shield size={16} color="var(--red)" />, text: "100% authentic & quality guaranteed" },
              { icon: <RotateCcw size={16} color="var(--red)" />, text: "7-day easy returns & exchanges" },
              { icon: <Zap size={16} color="var(--yellow-dark)" />, text: "Cash on Delivery available nationwide" },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--gray-700)" }}>
                {t.icon} {t.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--gray-200)", marginBottom: 32 }}>
          {["description", "specs", "reviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 24px", border: "none", background: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 15, textTransform: "capitalize",
              color: activeTab === tab ? "var(--red)" : "var(--gray-500)",
              borderBottom: `2px solid ${activeTab === tab ? "var(--red)" : "transparent"}`,
              marginBottom: -2, transition: "all 0.2s",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "description" && (
          <div className="animate-fade-up">
            <p style={{ color: "var(--gray-700)", lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>{product.description}</p>
            {product.features && (
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "var(--gray-700)" }}>
                    <CheckCircle size={16} color="var(--red)" /> {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "specs" && product.specs && (
          <div className="animate-fade-up">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {product.specs.map((s, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 700, color: "var(--gray-700)", width: 180, background: i % 2 === 0 ? "var(--gray-50)" : "white", fontSize: 14 }}>{s.label}</td>
                    <td style={{ padding: "14px 20px", color: "var(--gray-800)", background: i % 2 === 0 ? "var(--gray-50)" : "white", fontSize: 14 }}>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fade-up">
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { name: "Muhammad Ali", rating: 5, date: "2 days ago", text: "Excellent product! Exactly as described. Very happy with the purchase." },
                { name: "Ayesha Khan", rating: 4, date: "1 week ago", text: "Good quality. Delivery was fast. Would recommend to others." },
              ].map((r, i) => (
                <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, border: "1px solid var(--gray-200)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{r.name}</span>
                      <span style={{ fontSize: 12, color: "var(--gray-500)", marginLeft: 12 }}>{r.date}</span>
                    </div>
                    <div className="stars">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "var(--yellow)" : "none"} color={s <= r.rating ? "var(--yellow)" : "var(--gray-300)"} />)}
                    </div>
                  </div>
                  <p style={{ color: "var(--gray-700)", fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 24 }}>Related <span style={{ color: "var(--red)" }}>Products</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
