"use client";
import { use, useState, useEffect, useMemo, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, Headphones, Sparkles, Star, ChevronRight, ChevronLeft, Zap, CheckCircle, Minus, Plus, Link as LinkIcon, Maximize2, X, ZoomIn, ZoomOut, MessageCircle } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import ProductCard from "@/components/ProductCard";
import { products, getProductBySlug } from "@/data/products";
import { useCart } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { useWishlist } from "@/store/wishlistStore";
import { useSettings } from "@/components/SettingsProvider";
import { DEFAULT_SITE_REVIEWS } from "@/data/siteReviews";

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
  const [bundleSubItems, setBundleSubItems] = useState<any[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{name: string, hex: string} | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImg, setActiveImg] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const router = useRouter();
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [siteReviews, setSiteReviews] = useState<any[]>(DEFAULT_SITE_REVIEWS);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const reviewsSliderRef = useRef<HTMLDivElement>(null);

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

          let parsedSizes = [];
          try {
             parsedSizes = Array.isArray(mapped.sizes) ? mapped.sizes : (typeof mapped.sizes === 'string' ? JSON.parse(mapped.sizes) : []);
          } catch(e) {}
          if (parsedSizes.length === 1) {
            setSelectedSize(parsedSizes[0]);
          }

          setReviews(data.reviews || []);
          if (data.siteReviews && Array.isArray(data.siteReviews) && data.siteReviews.length > 0) {
            setSiteReviews(data.siteReviews);
          } else if (!data.product?.store_id) {
            setSiteReviews(DEFAULT_SITE_REVIEWS);
          }
          setQnaList(data.qna || []);

          if (data.relatedProducts && Array.isArray(data.relatedProducts)) {
            const mappedRelated = data.relatedProducts.map((p: any) => ({
              ...p,
              originalPrice: p.original_price,
              badgeType: p.badge_type,
              isNew: p.is_new,
              inStock: p.in_stock,
              stockQuantity: p.stock_quantity,
            }));
            setRelatedProducts(mappedRelated);
          }

          if (mapped.is_bundle && Array.isArray(mapped.bundle_items) && mapped.bundle_items.length > 0) {
            try {
              const subItemsRes = await fetch(`/api/products?ids=${mapped.bundle_items.join(',')}`);
              if (subItemsRes.ok) {
                const subItems = await subItemsRes.json();
                setBundleSubItems(subItems);
                
                // If any subitem is out of stock, mark bundle as out of stock
                if (subItems.some((item: any) => !item.in_stock || item.stock_quantity <= 0)) {
                  setProduct((prev: any) => ({ ...prev, inStock: false }));
                }
              }
            } catch (err) {
              console.error("Error fetching bundle subitems:", err);
            }
          }

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

  const isDastiyabProduct = Boolean(product && !product.store_id);

  const combinedReviews = useMemo(() => {
    if (!product) return [];
    if (!isDastiyabProduct) {
      return reviews.map((r: any) => ({
        ...r,
        name: r.customer_name || r.name,
        text: r.review_text || r.text,
        city: r.city || "Pakistan",
        rating: r.rating || 5,
        time: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent",
        isOriginal: true,
        product: product?.name
      }));
    }

    // 1. Direct DB reviews for this product
    const originalDbReviews = reviews.map((r: any) => ({
      ...r,
      name: r.customer_name || r.name,
      text: r.review_text || r.text,
      city: r.city || "Pakistan",
      color: "#ef4444",
      rating: r.rating || 5,
      time: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent",
      reply: r.reply_text || r.reply,
      product: product?.name,
      isOriginal: true,
      isProductSpecific: true
    }));

    // 2. Filter siteReviews
    const productSpecificSiteReviews: any[] = [];
    const otherGeneralReviews: any[] = [];

    siteReviews.forEach((sr: any) => {
      const matchSlug = sr.productSlug && (sr.productSlug === product?.slug || decodeURIComponent(slug).includes(sr.productSlug));
      const matchName = sr.product && product?.name && (
        product.name.toLowerCase().includes(sr.product.toLowerCase().slice(0, 15)) ||
        sr.product.toLowerCase().includes(product.name.toLowerCase().slice(0, 15))
      );

      if (matchSlug || matchName) {
        productSpecificSiteReviews.push({
          ...sr,
          isOriginal: true,
          isProductSpecific: true
        });
      } else {
        otherGeneralReviews.push({
          ...sr,
          isOriginal: false,
          isProductSpecific: false
        });
      }
    });

    // Original review for this product ALWAYS comes 1st!
    return [
      ...originalDbReviews,
      ...productSpecificSiteReviews,
      ...otherGeneralReviews
    ];
  }, [reviews, siteReviews, product, slug, isDastiyabProduct]);

  const related = useMemo(() => {
    if (relatedProducts.length > 0) return relatedProducts;
    if (!product) return [];
    const prodCat = product.category?.name || product.category;
    return products.filter(p => (p.category === prodCat || p.category === product.category) && p.id !== product.id).slice(0, 8);
  }, [relatedProducts, product]);

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
  const scrollProductReviews = (dir: "left" | "right") => {
    if (reviewsSliderRef.current) {
      reviewsSliderRef.current.scrollBy({
        left: dir === "left" ? -550 : 550,
        behavior: "smooth"
      });
    }
  };

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const isProductInStock = product.in_stock !== undefined ? product.in_stock : (product.inStock !== undefined ? product.inStock : true);
  const stockQty = product.stock_quantity !== undefined ? product.stock_quantity : (product.stockQuantity !== undefined ? product.stockQuantity : 10);
  const isOutOfStock = !isProductInStock || stockQty <= 0;
  const totalReviews = isDastiyabProduct
    ? (combinedReviews.length > 0 ? combinedReviews.length : 8)
    : (reviews.length > 0 ? reviews.length : (product.reviews || 0));
  const avgRating = isDastiyabProduct
    ? (combinedReviews.length > 0 ? (combinedReviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / combinedReviews.length) : 4.9)
    : (reviews.length > 0
        ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length)
        : (product.rating || 5));
  const trustFeatures = [
    ...(freeDelivery?.is_active ? [{ icon: <Truck size={28} />, title: "Free Delivery", sub: `On orders Rs.${freeDelivery.threshold}+` }] : []),
    { icon: <RotateCcw size={28} />, title: "Easy Returns", sub: "5-day return policy" },
    { icon: <Shield size={28} />, title: "100% Secure", sub: "Trusted & verified" },
    { icon: <Headphones size={28} />, title: "24/7 Support", sub: "Always here to help" },
  ];
  const rawImages = typeof product.images === 'string' ? (function() { try { return JSON.parse(product.images); } catch { return []; } })() : (product.images || []);
  const validImages = (Array.isArray(rawImages) ? rawImages : []).filter((img: string) => img && img.trim() !== "");
  const images = [product.image, ...validImages].filter((img: string) => img && img.trim() !== "");
  if (images.length === 0) images.push("https://placehold.co/800x800?text=No+Image");

  // Build gallery items: images + video (video goes after main image)
  const productVideoUrl = product.video_url || null;
  const galleryItems: { type: 'image' | 'video'; url: string }[] = [];
  galleryItems.push({ type: 'image', url: images[0] });
  if (productVideoUrl) {
    galleryItems.push({ type: 'video', url: productVideoUrl });
  }
  for (let i = 1; i < images.length; i++) {
    galleryItems.push({ type: 'image', url: images[i] });
  }

  const productColors = Array.isArray(product.colors) ? product.colors : (typeof product.colors === 'string' ? (function() { try { return JSON.parse(product.colors); } catch { return []; } })() : (product.colors || []));
  const productSizes = Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === "string" ? (function() { try { return JSON.parse(product.sizes); } catch { return []; } })() : (product.sizes || []));

  const handleAdd = () => {
    if (productColors.length > 0 && !selectedColor) {
      showToast("Please select a color first", "error");
      return;
    }

    if (productSizes.length > 0 && !selectedSize) {
      showToast("Please select a size first", "error");
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        color: selectedColor?.name,
        colorHex: selectedColor?.hex,
        size: selectedSize || undefined,
        freeDeliveryKarachi: product.free_delivery_karachi,
        freeDeliveryNationwide: product.free_delivery_nationwide,
        storeId: product.store?.id || "dastiyab",
        storeName: product.store?.name || "Dastiyab Store"
      });
    }
    showToast(`${qty}x ${product.name} ${selectedColor ? `(${selectedColor.name}) ` : ''}added!`);
    if (typeof window !== "undefined") {
      (window as any).fbq?.('track', 'AddToCart', {
        value: product.price * qty,
        currency: 'PKR',
        content_ids: [product.id],
        content_type: 'product',
      });
    }
  };

  const handleBuyNow = () => {
    if (productColors.length > 0 && !selectedColor) {
      showToast("Please select a color first", "error");
      return;
    }

    if (productSizes.length > 0 && !selectedSize) {
      showToast("Please select a size first", "error");
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        color: selectedColor?.name,
        colorHex: selectedColor?.hex,
        size: selectedSize || undefined,
        freeDeliveryKarachi: product.free_delivery_karachi,
        freeDeliveryNationwide: product.free_delivery_nationwide,
        storeId: product.store?.id || "dastiyab",
        storeName: product.store?.name || "Dastiyab Store"
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

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Dastiyab Store"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://dastiyabstore.com/product/${product.slug || slug}`,
      "priceCurrency": "PKR",
      "price": product.price,
      "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
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
              scrollBehavior: "smooth",
              aspectRatio: "1 / 1",
              width: "100%"
            }}
            onScroll={(e) => {
              const container = e.currentTarget;
              const index = Math.round(container.scrollLeft / container.clientWidth);
              if (index !== activeImg) setActiveImg(index);
            }}
          >
            <style>{`#product-slider::-webkit-scrollbar { display: none; }`}</style>
            {galleryItems.map((item, i: number) => (
              <div 
                key={i} 
                style={{ 
                  flex: "0 0 100%", 
                  width: "100%", 
                  height: "100%",
                  scrollSnapAlign: "start",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    controls
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }} 
                  />
                ) : (
                  <img 
                    src={item.url} 
                    alt={product.name} 
                    onClick={() => { setShowZoom(true); setZoomLevel(1); }} 
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", cursor: "zoom-in" }} 
                    fetchPriority={i === 0 ? "high" : "auto"}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding={i === 0 ? "sync" : "async"}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x800?text=Invalid+Image'; }} 
                  />
                )}
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
          {galleryItems.length > 1 && (
            <div className="mobile-only" style={{ display: "flex", justifyContent: "center", gap: 6, position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
              {galleryItems.map((_, i) => (
                <div key={i} style={{ width: activeImg === i ? 16 : 6, height: 6, borderRadius: 3, background: activeImg === i ? "var(--red)" : "rgba(0,0,0,0.2)", transition: "all 0.3s" }} />
              ))}
            </div>
          )}

          {/* Thumbnails */}
          {galleryItems.length > 1 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
              {galleryItems.map((item, i: number) => (
                <button key={i} onClick={() => {
                  setActiveImg(i);
                  const container = document.getElementById("product-slider");
                  if (container) container.scrollTo({ left: i * container.clientWidth, behavior: "smooth" });
                }} style={{
                  width: 72, height: 72, borderRadius: "var(--radius)", overflow: "hidden",
                  border: `2px solid ${activeImg === i ? "var(--red)" : "var(--gray-200)"}`,
                  cursor: "pointer", padding: 0, background: "var(--gray-50)",
                  transition: "border-color 0.2s", position: "relative",
                }}>
                  {item.type === 'video' ? (
                    <>
                      <video src={item.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "8px solid var(--red)", marginLeft: 2 }} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Invalid'; }} />
                  )}
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
          <div 
            onClick={() => {
              const el = document.getElementById("customer-reviews-section") || document.getElementById("product-tabs-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }}
            title="Click to view customer reviews"
          >
            <div className="stars" style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  size={16} 
                  fill={totalReviews > 0 && s <= Math.round(avgRating) ? "var(--yellow)" : "none"} 
                  color={totalReviews > 0 && s <= Math.round(avgRating) ? "var(--yellow)" : "var(--gray-300)"} 
                />
              ))}
            </div>
            <span style={{ fontSize: 14, color: "var(--gray-700)", fontWeight: 600 }}>
              {totalReviews > 0 ? `${avgRating.toFixed(1)}/5 (${totalReviews} Verified Reviews)` : "No reviews yet"}
            </span>
            <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, textDecoration: "underline", marginLeft: 4 }}>
              View Reviews ↓
            </span>
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

          {/* Free Delivery Showcase */}
          {(product.free_delivery_karachi || product.free_delivery_nationwide) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "12px 16px", background: "#fef2f2", border: "1px dashed var(--red)", borderRadius: "var(--radius)", color: "var(--red)" }}>
              <Truck size={20} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {product.free_delivery_karachi && product.free_delivery_nationwide 
                  ? "Free Delivery Available Across Pakistan!" 
                  : product.free_delivery_karachi 
                    ? "Free Delivery Available in Karachi!" 
                    : "Free Delivery Available Nationwide (Excl. Karachi)"}
              </div>
            </div>
          )}

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
              {/* Bundle Sub-items Preview */}
              {product.is_bundle && bundleSubItems.length > 0 && (
                <div style={{ marginBottom: 24, padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-lg)" }}>
                  <label className="label" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--red)" }}>
                    <Zap size={16} fill="var(--yellow)" color="var(--yellow)" />
                    This Bundle Includes:
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                    {bundleSubItems.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: 8, borderRadius: 8, boxShadow: "var(--shadow-sm)" }}>
                        <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)", lineHeight: 1.2 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>
                            {item.in_stock ? (
                              <span style={{ color: "#16a34a" }}>In Stock</span>
                            ) : (
                              <span style={{ color: "var(--red)" }}>Out of Stock</span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-700)", paddingRight: 8 }}>
                          Rs. {item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

                            {/* Size Selection */}
              {productSizes && productSizes.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label className="label">Size <span style={{ color: "var(--red)" }}>*</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {productSizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 48,
                          height: 48,
                          padding: "0 16px",
                          borderRadius: "var(--radius)",
                          border: `2px solid ${selectedSize === size ? "var(--red)" : "var(--gray-200)"}`,
                          background: selectedSize === size ? "var(--red)" : "white",
                          color: selectedSize === size ? "white" : "var(--gray-700)",
                          fontWeight: selectedSize === size ? 700 : 600,
                          fontSize: 15,
                          cursor: "pointer",
                          boxShadow: selectedSize === size ? "0 4px 12px rgba(220, 38, 38, 0.2)" : "var(--shadow-sm)",
                          transition: "all 0.2s"
                        }}
                      >
                        {size}
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
                { icon: "rotate-ccw", text: "5-day easy returns & exchanges" },
                { icon: "zap", text: "Cash on Delivery available in Karachi" }
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
      <div id="product-tabs-section" style={{ marginBottom: 64 }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--gray-200)", marginBottom: 32, overflowX: "auto" }}>
          {["description", "specs", "reviews", "qna"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 24px", border: "none", background: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 15, textTransform: "capitalize",
              color: activeTab === tab ? "var(--red)" : "var(--gray-500)",
              borderBottom: `2px solid ${activeTab === tab ? "var(--red)" : "transparent"}`,
              marginBottom: -2, transition: "all 0.2s", whiteSpace: "nowrap"
            }}>
              {tab === "reviews" ? `Customer Reviews (${totalReviews})` : (tab === "qna" ? "Q&A" : tab)}
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
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Customer Reviews ({combinedReviews.length})</h3>
                {loadingReviews ? (
                  <p style={{ color: "var(--gray-500)" }}>Loading reviews...</p>
                ) : combinedReviews.length === 0 ? (
                  <p style={{ color: "var(--gray-500)", background: "var(--gray-50)", padding: 20, borderRadius: "var(--radius)", textAlign: "center" }}>No reviews yet. Be the first to review this product!</p>
                ) : (
                  combinedReviews.map((r: any, i: number) => {
                    const isFirstOriginal = r.isOriginal && i === 0;
                    return (
                      <div key={i} style={{ 
                        background: isFirstOriginal ? "#fffdf5" : "var(--gray-50)", 
                        borderRadius: "var(--radius)", 
                        padding: 20, 
                        border: isFirstOriginal ? "2px solid #f59e0b" : "1px solid var(--gray-200)",
                        position: "relative"
                      }}>
                        {isFirstOriginal && (
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "linear-gradient(90deg, #f59e0b, #d97706)",
                            color: "white",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 6,
                            marginBottom: 10
                          }}>
                            ⭐ VERIFIED PRODUCT REVIEW
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <div>
                            <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{r.name || r.customer_name}</span>
                            <span style={{ fontSize: 12, color: "var(--gray-500)", marginLeft: 12 }}>{r.time || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent")}</span>
                          </div>
                          <div className="stars">
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= (r.rating || 5) ? "var(--yellow)" : "none"} color={s <= (r.rating || 5) ? "var(--yellow)" : "var(--gray-300)"} />)}
                          </div>
                        </div>
                        <p style={{ color: "var(--gray-700)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{r.text || r.review_text}</p>
                        {r.reply && (
                          <div style={{ marginTop: 12, padding: "12px 16px", background: "white", borderLeft: "3px solid var(--red)", borderRadius: "0 8px 8px 0" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", display: "block", marginBottom: 4 }}>DastiyabStore replied:</span>
                            <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0 }}>{r.reply}</p>
                          </div>
                        )}
                        {/* Attached Purchased Product Chip */}
                        {r.productSlug && (
                          <div style={{ marginTop: 14 }}>
                            <a
                              href={`/product/${r.productSlug}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                background: "#ffffff",
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                textDecoration: "none",
                                fontSize: 12,
                                color: "#1e293b",
                                fontWeight: 600,
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--red)")}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0")}
                            >
                              {r.productImage && (
                                <img src={r.productImage} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} />
                              )}
                              <span>Purchased: <strong>{r.product || "Item"}</strong></span>
                              {r.productPrice && (
                                <span style={{ color: "var(--red)", fontWeight: 700 }}>• Rs. {Number(r.productPrice).toLocaleString()}</span>
                              )}
                              <ChevronRight size={13} color="#94a3b8" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
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

      {/* ── DASTIYAB VERIFIED REVIEWS SLIDER (ONLY FOR DASTIYAB'S OWN PRODUCTS) ── */}
      {isDastiyabProduct && combinedReviews.length > 0 && (
        <div 
          id="customer-reviews-section"
          style={{
            margin: "40px 0 64px 0",
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #fde68a 100%)",
            borderRadius: 20,
            padding: "36px 32px",
            color: "#1e293b",
            border: "1.5px solid #fde68a",
            boxShadow: "0 20px 45px -15px rgba(245, 158, 11, 0.28)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                {/* Google Logo */}
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span style={{ color: "#b45309", fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5 }}>
                  GOOGLE VERIFIED REVIEWS
                </span>
                <span style={{ fontSize: 11, background: "#ffffff", padding: "3px 10px", borderRadius: 12, color: "#92400e", fontWeight: 800, border: "1px solid #fde68a", boxShadow: "0 2px 6px rgba(180, 83, 9, 0.12)" }}>
                  4.9 ★★★★★ ({combinedReviews.length} Reviews)
                </span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                Customer Feedback & <span style={{ color: "var(--red)" }}>Reviews</span>
              </h2>
              <p style={{ fontSize: 13, color: "#78350f", marginTop: 4, margin: 0, fontWeight: 500 }}>
                Real verified customer experiences from buyers across Pakistan
              </p>
            </div>

            {/* Slider Controls */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button 
                onClick={() => scrollProductReviews("left")} 
                aria-label="Previous Reviews"
                style={{ 
                  width: 42, height: 42, borderRadius: "50%", background: "#ffffff", 
                  border: "1px solid #fde68a", display: "flex", alignItems: "center", 
                  justifyContent: "center", color: "#78350f", cursor: "pointer", transition: "0.2s",
                  boxShadow: "0 4px 12px rgba(180, 83, 9, 0.12)"
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fef3c7")}
                onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollProductReviews("right")} 
                aria-label="Next Reviews"
                style={{ 
                  width: 42, height: 42, borderRadius: "50%", background: "#ffffff", 
                  border: "1px solid #fde68a", display: "flex", alignItems: "center", 
                  justifyContent: "center", color: "#78350f", cursor: "pointer", transition: "0.2s",
                  boxShadow: "0 4px 12px rgba(180, 83, 9, 0.12)"
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fef3c7")}
                onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Reviews Slider Track */}
          <div 
            ref={reviewsSliderRef}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingTop: 8,
              paddingBottom: 16,
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
            className="product-reviews-slider"
          >
            <style>{`
              .product-reviews-slider::-webkit-scrollbar { display: none; }
            `}</style>
            {combinedReviews.map((r: any, idx: number) => {
              const isFirstOriginal = r.isOriginal && idx === 0;
              return (
                <div 
                  key={idx}
                  style={{
                    flex: "0 0 255px",
                    minWidth: "255px",
                    maxWidth: "255px",
                    scrollSnapAlign: "start",
                    background: isFirstOriginal ? "#ffffff" : "#ffffff",
                    borderRadius: 14,
                    padding: "16px 14px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    border: isFirstOriginal ? "2px solid #f59e0b" : "1px solid rgba(251, 191, 36, 0.35)",
                    boxShadow: isFirstOriginal ? "0 8px 24px rgba(245, 158, 11, 0.28)" : "0 6px 18px rgba(180, 83, 9, 0.08)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                >
                  {/* Top Badge for 1st / Original review */}
                  {isFirstOriginal && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      alignSelf: "flex-start",
                      background: "linear-gradient(90deg, #f59e0b, #d97706)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 8,
                      letterSpacing: 0.5,
                      marginBottom: 12,
                      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.25)"
                    }}>
                      ⭐ THIS PRODUCT REVIEW
                    </div>
                  )}

                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                      <div style={{ 
                        width: 36, height: 36, borderRadius: "50%", 
                        background: r.color || "#0284c7", color: "white", 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontWeight: 800, fontSize: 16, flexShrink: 0
                      }}>
                        {r.name?.charAt(0) || "U"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 13, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 125 }}>
                          {r.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{r.city || "Pakistan"}</span>
                          <span style={{ fontSize: 9, background: "#dbeafe", color: "#1e40af", fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stars & Time */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={13} fill={s < (r.rating || 5) ? "#f59e0b" : "none"} strokeWidth={s < (r.rating || 5) ? 0 : 2} color="#f59e0b" />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{r.time || "Recent"}</span>
                  </div>

                  {/* Review Text */}
                  <p style={{
                    color: "#334155",
                    fontSize: 12,
                    lineHeight: 1.45,
                    margin: 0,
                    marginBottom: 10,
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }} title={r.text}>
                    {r.text}
                  </p>

                  {/* Owner Reply if present */}
                  {r.reply && (
                    <div style={{ padding: "6px 8px", background: "#f8fafc", borderRadius: 6, borderLeft: "2.5px solid var(--red)", fontSize: 11, marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 10 }}>Dastiyab Store: </span>
                      <span style={{ color: "#64748b", fontStyle: "italic", fontSize: 10 }}>&ldquo;{r.reply}&rdquo;</span>
                    </div>
                  )}

                  {/* Clickable Product Badge */}
                  {r.productSlug ? (
                    <a
                      href={`/product/${r.productSlug}`}
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: isFirstOriginal ? "#fffbeb" : "#f8fafc",
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: isFirstOriginal ? "1px solid #fde68a" : "1px solid #e2e8f0",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--red)";
                        (e.currentTarget as HTMLElement).style.background = "#fff8f8";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = isFirstOriginal ? "#fde68a" : "#e2e8f0";
                        (e.currentTarget as HTMLElement).style.background = isFirstOriginal ? "#fffbeb" : "#f8fafc";
                      }}
                    >
                      {r.productImage ? (
                        <img
                          src={r.productImage}
                          alt={r.product || "Product"}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            objectFit: "cover",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                            background: "white"
                          }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                          🛍️
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: isFirstOriginal ? "#b45309" : "var(--red)", textTransform: "uppercase", letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 3 }}>
                          <span>{isFirstOriginal ? "⭐ THIS ITEM" : "PURCHASED"}</span>
                          <span style={{ fontSize: 8, color: "#64748b" }}>• View</span>
                        </div>
                        <p style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#1e293b",
                          margin: 0,
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }} title={r.product}>
                          {r.product || product?.name}
                        </p>
                        {r.productPrice && (
                          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--red)" }}>
                            Rs. {Number(r.productPrice).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <ChevronRight size={13} />
                      </div>
                    </a>
                  ) : (
                    <div style={{ marginTop: "auto", background: isFirstOriginal ? "#fef3c7" : "#f1f5f9", padding: "6px 8px", borderRadius: 8, border: isFirstOriginal ? "1px solid #fde68a" : "1px solid #e2e8f0" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: isFirstOriginal ? "#92400e" : "#475569", textTransform: "uppercase", letterSpacing: 0.3, margin: 0, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {isFirstOriginal ? "⭐ THIS PRODUCT PURCHASE" : `PURCHASED: ${r.product || "Verified Store Item"}`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TRUST & GUARANTEE BAR (EASY RETURNS, 100% SECURE, 24/7 SUPPORT) ── */}
      <div 
        id="easy-returns-trust-bar"
        style={{
          marginTop: 48,
          marginBottom: 48,
          background: "var(--gray-50)",
          borderRadius: 20,
          padding: "32px 24px",
          border: "1px solid var(--gray-200)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20
        }}>
          {trustFeatures.map((f, i) => (
            <div
              key={i}
              className="trust-badge"
              style={{
                flexDirection: "column",
                textAlign: "center",
                padding: "24px 20px",
                gap: 12,
                background: "white",
                borderRadius: 16,
                border: "1px solid var(--gray-200)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "var(--red)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "var(--gray-200)";
              }}
            >
              <div style={{ color: "var(--red)" }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gray-900)" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RELATED PRODUCTS SECTION (DIRECTLY UNDER EASY RETURNS) ── */}
      {related.length > 0 && (
        <section 
          id="related-products-section"
          style={{ 
            marginBottom: 64,
            scrollMarginTop: 80
          }}
        >
          {/* Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-end", 
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12
          }}>
            <div>
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 6, 
                background: "#fef2f2", 
                color: "var(--red)", 
                padding: "4px 12px", 
                borderRadius: 20, 
                fontSize: 12, 
                fontWeight: 800, 
                marginBottom: 8,
                letterSpacing: 0.5,
                border: "1px solid #fee2e2"
              }}>
                <Sparkles size={14} /> RELATED RECOMMENDATIONS
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--gray-900)", margin: 0, letterSpacing: "-0.5px" }}>
                Related <span style={{ color: "var(--red)" }}>Products</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 4, margin: 0 }}>
                Customers interested in this item also viewed these popular choices
              </p>
            </div>
            
            <a 
              href="/shop" 
              style={{ 
                fontSize: 13, 
                fontWeight: 700, 
                color: "var(--red)", 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 4,
                textDecoration: "none"
              }}
            >
              Explore All Products <ChevronRight size={16} />
            </a>
          </div>

          {/* Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
            gap: 20 
          }}>
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
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
