"use client";
import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, Star, ChevronRight, Zap, CheckCircle, Minus, Plus, Link as LinkIcon, Maximize2, X, ZoomIn, ZoomOut, MessageCircle } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import ProductCard from "@/components/ProductCard";
import { products, getProductBySlug } from "@/data/products";
import { useCart } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { useWishlist } from "@/store/wishlistStore";
import { useSettings } from "@/components/SettingsProvider";

const renderTrustIcon = (iconName: string) => {
  const size = 18;
  const color = "var(--red)";
  switch (iconName) {
    case "truck":
      return <Truck size={size} color={color} style={{ flexShrink: 0 }} />;
    case "shield":
      return <Shield size={size} color={color} style={{ flexShrink: 0 }} />;
    case "rotate-ccw":
      return <RotateCcw size={size} color={color} style={{ flexShrink: 0 }} />;
    case "zap":
      return <Zap size={size} color="var(--yellow-dark)" style={{ flexShrink: 0 }} />;
    case "check-circle":
      return <CheckCircle size={size} color={color} style={{ flexShrink: 0 }} />;
    case "heart":
      return <Heart size={size} color={color} style={{ flexShrink: 0 }} />;
    default:
      return <CheckCircle size={size} color={color} style={{ flexShrink: 0 }} />;
  }
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { freeDelivery } = useSettings();
  const { slug } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{name: string, hex: string} | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImg, setActiveImg] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const router = useRouter();
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // QnA state
  const [qnaList, setQnaList] = useState<any[]>([]);
  const [loadingQna, setLoadingQna] = useState(true);
  const [qnaName, setQnaName] = useState("");
  const [qnaQuestion, setQnaQuestion] = useState("");
  const [submittingQna, setSubmittingQna] = useState(false);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let cleanSlug = decodeURIComponent(slug).trim();
        
        // Normalize: replace spaces with hyphens (handles URLs with spaces)
        cleanSlug = cleanSlug.replace(/\s+/g, '-');
        
        // Clean up slug if UUID
        if (/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(cleanSlug)) {
          // Already a valid UUID, keep as-is
        } else if (/^[a-fA-F0-9]{32}$/.test(cleanSlug)) {
          cleanSlug = `${cleanSlug.slice(0, 8)}-${cleanSlug.slice(8, 12)}-${cleanSlug.slice(12, 16)}-${cleanSlug.slice(16, 20)}-${cleanSlug.slice(20)}`;
        }

        const res = await fetch(`/api/products/${cleanSlug}`);
        if (!res.ok) {
          const staticProd = getProductBySlug(cleanSlug) || products.find(p => p.id === cleanSlug);
          if (staticProd) setProduct(staticProd);
          setLoadingProduct(false);
          setLoadingReviews(false);
          setLoadingQna(false);
          return;
        }

        const data = await res.json();
        
        if (data.product) {
          const mapped = {
            ...data.product,
            originalPrice: data.product.original_price,
            badgeType: data.product.badge_type,
            isNew: data.product.is_new,
            inStock: data.product.in_stock,
            stockQuantity: data.product.stock_quantity,
          };
          setProduct(mapped);
          
          let parsedColors = [];
          try {
             parsedColors = Array.isArray(mapped.colors) ? mapped.colors : (typeof mapped.colors === 'string' ? JSON.parse(mapped.colors) : []);
          } catch(e) {}
          if (parsedColors.length === 1) {
            setSelectedColor(parsedColors[0]);
          }

          setReviews(data.reviews || []);
          setQnaList(data.qna || []);

          // Trigger Facebook Pixel ViewContent Event
          if (data.product && typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq('track', 'ViewContent', {
              content_ids: [data.product.id],
              content_name: data.product.name,
              content_type: 'product',
              value: data.product.price,
              currency: 'PKR'
            });
          }
        }

      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoadingProduct(false);
        setLoadingReviews(false);
        setLoadingQna(false);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowStickyCart(true);
      } else {
        setShowStickyCart(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loadingProduct) {
    return <div style={{ padding: "100px 40px", textAlign: "center", color: "var(--gray-500)", fontSize: 16 }}>Loading product details...</div>;
  }

  if (!product) {
    return notFound();
  }

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

    try {
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (!res.ok) throw new Error('Failed');
      
      const savedReview = await res.json();
      showToast("Review submitted successfully!");
      setReviews([savedReview, ...reviews]);
      setReviewName("");
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      showToast("Error submitting review");
      console.error(err);
    }
    setSubmittingReview(false);
  };

  const handleSubmitQna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaName.trim() || !qnaQuestion.trim()) {
      showToast("Please fill all fields");
      return;
    }
    
    setSubmittingQna(true);
    
    const sessionStr = localStorage.getItem("customer_session");
    let nameToUse = qnaName;
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.name) nameToUse = user.name;
      } catch (e) {}
    }

    const newQna = {
      product_id: product.id,
      customer_name: nameToUse,
      question: qnaQuestion
    };

    try {
      const res = await fetch(`/api/products/${product.slug}/qna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQna)
      });
      if (!res.ok) throw new Error('Failed');

      const savedQna = await res.json();
      setQnaList([savedQna, ...qnaList]);
      setQnaQuestion("");
      showToast("Question submitted successfully!", "success");
    } catch (err) {
      showToast("Failed to submit question", "error");
      console.error(err);
    }
    setSubmittingQna(false);
  };
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const isProductInStock = product.in_stock !== undefined ? product.in_stock : (product.inStock !== undefined ? product.inStock : true);
  const stockQty = product.stock_quantity !== undefined ? product.stock_quantity : (product.stockQuantity !== undefined ? product.stockQuantity : 10);
  const isOutOfStock = !isProductInStock || stockQty <= 0;
  
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const rawImages = typeof product.images === 'string' ? (function() { try { return JSON.parse(product.images); } catch { return []; } })() : (product.images || []);
  const validImages = (Array.isArray(rawImages) ? rawImages : []).filter((img: string) => img && img.trim() !== "");
  const images = [product.image, ...validImages].filter((img: string) => img && img.trim() !== "");
  if (images.length === 0) images.push("https://placehold.co/800x800?text=No+Image");

  const productColors = Array.isArray(product.colors) ? product.colors : (typeof product.colors === 'string' ? (function() { try { return JSON.parse(product.colors); } catch { return []; } })() : (product.colors || []));

  const handleAdd = () => {
    if (productColors.length > 0 && !selectedColor) {
      showToast("Please select a color first", "error");
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        color: selectedColor?.name,
        colorHex: selectedColor?.hex
      });
    }
    showToast(`${qty}x ${product.name} ${selectedColor ? `(${selectedColor.name}) ` : ''}added!`);
  };

  const handleBuyNow = () => {
    if (productColors.length > 0 && !selectedColor) {
      showToast("Please select a color first", "error");
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        color: selectedColor?.name,
        colorHex: selectedColor?.hex
      });
    }
    router.push("/checkout");
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`, "info");
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
        reviews: product.reviews
      } as any);
      showToast(`${product.name} added to wishlist!`, "info");
    }
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
        <div style={{ position: "relative" }}>
          <div 
            id="product-slider"
            style={{ 
              display: "flex", 
              overflowX: "auto", 
              scrollSnapType: "x mandatory", 
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              borderRadius: "var(--radius-lg)", 
              background: "var(--gray-50)", 
              marginBottom: 12,
              scrollBehavior: "smooth"
            }}
            onScroll={(e) => {
              const container = e.currentTarget;
              const index = Math.round(container.scrollLeft / container.clientWidth);
              if (index !== activeImg) setActiveImg(index);
            }}
          >
            <style>{`#product-slider::-webkit-scrollbar { display: none; }`}</style>
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                style={{ 
                  flex: "0 0 100%", 
                  width: "100%", 
                  scrollSnapAlign: "start",
                  position: "relative"
                }}
              >
                <img 
                  src={img} 
                  alt={product.name} 
                  onClick={() => { setShowZoom(true); setZoomLevel(1); }} 
                  style={{ width: "100%", height: "auto", display: "block", cursor: "zoom-in" }} 
                  fetchPriority={i === 0 ? "high" : "auto"}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x800?text=Invalid+Image'; }} 
                />
              </div>
            ))}
          </div>

          {discount && (
            <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
              <span className="badge badge-red">{discount}% OFF</span>
            </div>
          )}
          
          <button onClick={() => { setShowZoom(true); setZoomLevel(1); }} style={{ position: "absolute", bottom: 28, right: 16, background: "white", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", boxShadow: "var(--shadow-md)", cursor: "pointer", color: "var(--gray-700)", transition: "transform 0.2s", zIndex: 10 }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            <Maximize2 size={18} />
          </button>

          {/* Dots Indicator for Mobile Swiping */}
          {images.length > 1 && (
            <div className="mobile-only" style={{ display: "flex", justifyContent: "center", gap: 6, position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
              {images.map((_, i) => (
                <div key={i} style={{ width: activeImg === i ? 16 : 6, height: 6, borderRadius: 3, background: activeImg === i ? "var(--red)" : "rgba(0,0,0,0.2)", transition: "all 0.3s" }} />
              ))}
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => {
                  setActiveImg(i);
                  const container = document.getElementById("product-slider");
                  if (container) container.scrollTo({ left: i * container.clientWidth, behavior: "smooth" });
                }} style={{
                  width: 72, height: 72, borderRadius: "var(--radius)", overflow: "hidden",
                  border: `2px solid ${activeImg === i ? "var(--red)" : "var(--gray-200)"}`,
                  cursor: "pointer", padding: 0, background: "var(--gray-50)",
                  transition: "border-color 0.2s",
                }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Invalid'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {product.badges && product.badges.map((b: any, index: number) => (
              <span key={index} className={`badge badge-${b.type || "red"}`}>{b.text}</span>
            ))}
            {!product.badges && product.badge && (
              <span className={`badge badge-${product.badgeType || "red"}`}>{product.badge}</span>
            )}
          </div>
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
            <CheckCircle size={16} color={!isOutOfStock ? "#16a34a" : "var(--gray-400)"} />
            <span style={{ fontSize: 14, color: !isOutOfStock ? "#16a34a" : "var(--gray-500)", fontWeight: 600 }}>
              {!isOutOfStock ? "In Stock — Ready to Ship" : "Out of Stock"}
            </span>
          </div>

          {isOutOfStock ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24, width: "100%" }}>
              {/* Out of Stock Professional English Alert */}
              <div style={{ 
                background: "#fef2f2", 
                border: "1px solid #fecaca", 
                borderRadius: "var(--radius)", 
                padding: "16px 20px", 
                color: "#991b1b",
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.5
              }}>
                This item is currently <strong>Out of Stock</strong>. We are working hard to restock it as soon as possible. Please add this item to your wishlist so you can keep track of it and place your order as soon as it is restocked.
              </div>
              
              {/* Wishlist Button Only */}
              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  onClick={handleWishlist} 
                  className="btn-yellow" 
                  style={{ flex: 1, justifyContent: "center", padding: "12px 28px", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} /> 
                  {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
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
            </div>
          ) : (
            <>
              {/* Color Selection */}
              {productColors && productColors.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label className="label">Color <span style={{ color: "var(--red)" }}>*</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {productColors.map((color: any) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          borderRadius: "var(--radius-full)",
                          border: `2px solid ${selectedColor?.name === color.name ? "var(--blue)" : "var(--gray-200)"}`,
                          background: selectedColor?.name === color.name ? "#eff6ff" : "white",
                          cursor: "pointer",
                          boxShadow: selectedColor?.name === color.name ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "var(--shadow-sm)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: color.hex, border: "1px solid var(--gray-300)" }}></div>
                        <span style={{ fontSize: 14, fontWeight: selectedColor?.name === color.name ? 600 : 500, color: selectedColor?.name === color.name ? "var(--blue)" : "var(--gray-700)" }}>
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
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
            </>
          )}

          {/* Delivery info */}
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--gray-200)" }}>
            {product.trust_points && product.trust_points.length > 0 ? (
              product.trust_points.map((t: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--gray-700)" }}>
                  {renderTrustIcon(t.icon)} {t.text}
                </div>
              ))
            ) : (
              [
                ...(freeDelivery?.is_active ? [{ icon: "truck", text: `Free delivery on orders above Rs. ${freeDelivery.threshold}` }] : []),
                { icon: "shield", text: "100% authentic & quality guaranteed" },
                { icon: "rotate-ccw", text: "7-day easy returns & exchanges" },
                { icon: "zap", text: "Cash on Delivery available nationwide" }
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--gray-700)" }}>
                  {renderTrustIcon(t.icon)} {t.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--gray-200)", marginBottom: 32, overflowX: "auto" }}>
          {["description", "specs", "reviews", "qna"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 24px", border: "none", background: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 15, textTransform: "capitalize",
              color: activeTab === tab ? "var(--red)" : "var(--gray-500)",
              borderBottom: `2px solid ${activeTab === tab ? "var(--red)" : "transparent"}`,
              marginBottom: -2, transition: "all 0.2s", whiteSpace: "nowrap"
            }}>
              {tab === "qna" ? "Q&A" : tab}
            </button>
          ))}
        </div>

        {activeTab === "description" && (
          <div className="animate-fade-up">
            <p style={{ color: "var(--gray-700)", lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>{product.description}</p>
            {product.features && (
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {product.features.map((f: string, i: number) => (
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
                {product.specs.map((s: any, i: number) => (
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
                  reviews.map((r: any, i: number) => (
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

        {activeTab === "qna" && (
          <div className="animate-fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
              
              {/* Form */}
              <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", marginBottom: 16 }}>Ask a Question</h3>
                <form onSubmit={handleSubmitQna} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="label">Your Name</label>
                    <input className="input" type="text" placeholder="Ali Khan" value={qnaName} onChange={e => setQnaName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Your Question</label>
                    <textarea className="input" rows={3} placeholder="Ask about the product, delivery, etc." value={qnaQuestion} onChange={e => setQnaQuestion(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" disabled={submittingQna} className="btn-red" style={{ justifyContent: "center" }}>
                    {submittingQna ? "Submitting..." : "Submit Question"}
                  </button>
                </form>
              </div>

              {/* List */}
              <div style={{ display: "grid", gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Questions & Answers ({qnaList.length})</h3>
                {loadingQna ? (
                  <p style={{ color: "var(--gray-500)" }}>Loading questions...</p>
                ) : qnaList.length === 0 ? (
                  <p style={{ color: "var(--gray-500)", background: "var(--gray-50)", padding: 20, borderRadius: "var(--radius)", textAlign: "center" }}>No questions asked yet. Be the first to ask!</p>
                ) : (
                  qnaList.map((q: any, i: number) => (
                    <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, border: "1px solid var(--gray-200)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{q.customer_name}</span>
                          <span style={{ fontSize: 12, color: "var(--gray-500)", marginLeft: 12 }}>{new Date(q.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ color: "var(--gray-500)" }}>
                          <MessageCircle size={16} />
                        </div>
                      </div>
                      <p style={{ color: "var(--gray-700)", fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>Q: {q.question}</p>
                      {q.answer && (
                        <div style={{ marginTop: 12, padding: "12px 16px", background: "white", borderLeft: "3px solid #22c55e", borderRadius: "0 8px 8px 0" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", display: "block", marginBottom: 4 }}>DastiyabStore replied:</span>
                          <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0 }}>{q.answer}</p>
                        </div>
                      )}
                      {!q.answer && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--gray-500)", fontStyle: "italic" }}>Awaiting answer...</div>
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

      {/* Zoom Modal */}
      {showZoom && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column" }}>
          {/* Header Controls */}
          <div style={{ padding: 20, display: "flex", justifyContent: "flex-end", gap: 16, position: "absolute", top: 0, right: 0, width: "100%", zIndex: 10000 }}>
            <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
              <ZoomOut size={20} />
            </button>
            <button onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
              <ZoomIn size={20} />
            </button>
            <button onClick={() => setShowZoom(false)} style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--red)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", marginLeft: 16, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#c62333"} onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}>
              <X size={20} />
            </button>
          </div>
          
          {/* Image Container */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "zoom-out" }} onClick={(e) => { if(e.target === e.currentTarget) setShowZoom(false); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "100%", minHeight: "100%" }}>
              <img 
                src={images[activeImg]} 
                alt={product.name} 
                style={{ 
                  maxWidth: "90vw", 
                  maxHeight: "90vh", 
                  objectFit: "contain", 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  cursor: zoomLevel >= 4 ? "zoom-out" : "zoom-in",
                  boxShadow: zoomLevel > 1 ? "0 20px 50px rgba(0,0,0,0.5)" : "none",
                  borderRadius: zoomLevel > 1 ? "8px" : "0"
                }} 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => prev >= 4 ? 1 : prev + 1);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar (Desktop Only) */}
      {!isOutOfStock && (
        <div className={`sticky-cart ${showStickyCart ? "visible" : ""}`} style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", padding: "16px 24px", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 90, transition: "transform 0.3s ease-out", transform: showStickyCart ? "translateY(0)" : "translateY(100%)", borderTop: "1px solid var(--gray-200)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={images[0]} alt={product.name} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8, background: "var(--gray-50)" }} />
              <div>
                <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>{product.name}</div>
                <div style={{ color: "var(--red)", fontWeight: 800 }}>Rs. {product.price.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 16, background: "var(--gray-50)", padding: "4px", borderRadius: "var(--radius-full)", border: "1px solid var(--gray-200)" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn" style={{ width: 32, height: 32 }}><Minus size={14} /></button>
                <span style={{ fontSize: 15, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="qty-btn" style={{ width: 32, height: 32 }}><Plus size={14} /></button>
              </div>
              <button onClick={handleAdd} className="btn-red" style={{ padding: "12px 24px", minWidth: 140, justifyContent: "center" }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-yellow" style={{ padding: "12px 24px", minWidth: 140, justifyContent: "center" }}>
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sticky-cart {
          display: none !important;
        }
        @media (min-width: 768px) {
          .sticky-cart {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
