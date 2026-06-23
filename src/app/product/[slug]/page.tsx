"use client";
import { use, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { notFound, useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, Star, ChevronRight, Zap, CheckCircle, Minus, Plus, Link as LinkIcon } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
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
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchReviews() {
      if (!product) return;
      const { data } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
      setLoadingReviews(false);
    }
    fetchReviews();
  }, [product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText) {
      showToast("Please fill all fields");
      return;
    }
    setSubmittingReview(true);
    
    const newReview = {
      product_id: product.id,
      customer_name: reviewName,
      rating: reviewRating,
      review_text: reviewText,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('product_reviews').insert([newReview]);
    
    if (error) {
      showToast("Error submitting review");
      console.error(error);
    } else {
      showToast("Review submitted successfully!");
      setReviews([newReview, ...reviews]);
      setReviewName("");
      setReviewText("");
      setReviewRating(5);
    }
    setSubmittingReview(false);
  };
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
                    <FaWhatsapp size={16} color="#25D366" /> WhatsApp
                  </button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--gray-700)", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <FaFacebook size={16} color="#1877F2" /> Facebook
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
              
              {/* Form */}
              <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", marginBottom: 16 }}>Write a Review</h3>
                <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="label">Your Name</label>
                    <input className="input" type="text" placeholder="Ali Khan" value={reviewName} onChange={e => setReviewName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Rating</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button type="button" key={s} onClick={() => setReviewRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <Star size={24} fill={s <= reviewRating ? "var(--yellow)" : "none"} color={s <= reviewRating ? "var(--yellow)" : "var(--gray-300)"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Your Review</label>
                    <textarea className="input" rows={4} placeholder="What did you like about this product?" value={reviewText} onChange={e => setReviewText(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn-red" style={{ justifyContent: "center" }}>
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>

              {/* List */}
              <div style={{ display: "grid", gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Customer Reviews ({reviews.length})</h3>
                {loadingReviews ? (
                  <p style={{ color: "var(--gray-500)" }}>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: "var(--gray-500)", background: "var(--gray-50)", padding: 20, borderRadius: "var(--radius)", textAlign: "center" }}>No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map((r, i) => (
                    <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, border: "1px solid var(--gray-200)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{r.customer_name}</span>
                          <span style={{ fontSize: 12, color: "var(--gray-500)", marginLeft: 12 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="stars">
                          {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "var(--yellow)" : "none"} color={s <= r.rating ? "var(--yellow)" : "var(--gray-300)"} />)}
                        </div>
                      </div>
                      <p style={{ color: "var(--gray-700)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{r.review_text}</p>
                      {r.reply_text && (
                        <div style={{ marginTop: 12, padding: "12px 16px", background: "white", borderLeft: "3px solid var(--red)", borderRadius: "0 8px 8px 0" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", display: "block", marginBottom: 4 }}>DastiyabStore replied:</span>
                          <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0 }}>{r.reply_text}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

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
