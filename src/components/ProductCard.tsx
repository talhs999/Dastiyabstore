"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Eye, Zap } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { useToast } from "@/components/ui/Toast";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  badgeType?: "red" | "yellow";
  badges?: { text: string; type: string }[];
  isNew?: boolean;
  inStock?: boolean;
  in_stock?: boolean;
  [key: string]: any;
}

export default function ProductCard({ product, view = "grid", priority = false }: { product: Product; view?: "grid" | "list"; priority?: boolean }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image,
      freeDeliveryKarachi: product.free_delivery_karachi,
      freeDeliveryNationwide: product.free_delivery_nationwide,
      storeId: product.store?.id || "dastiyab",
      storeName: product.store?.name || "Dastiyab Store"
    });
    showToast(`${product.name} added to cart!`);
  };

  return (
    <div
      className={`product-card ${view === "list" ? "list-view" : ""}`}
      style={{
        background: "var(--white)", borderRadius: "var(--radius-lg)",
        overflow: "hidden", boxShadow: "var(--shadow-md)",
        transition: "all 0.3s ease", cursor: "pointer", position: "relative",
        border: "1px solid var(--gray-200)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xl)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--red)";
        const actions = (e.currentTarget as HTMLElement).querySelector(".card-actions") as HTMLElement;
        if (actions) actions.style.opacity = "1";
        if (actions) actions.style.transform = "translateY(0)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)";
        const actions = (e.currentTarget as HTMLElement).querySelector(".card-actions") as HTMLElement;
        if (actions) actions.style.opacity = "0";
        if (actions) actions.style.transform = "translateY(8px)";
      }}
    >
      <Link href={`/product/${product.slug || product.id}`} style={{ position: "absolute", inset: 0, zIndex: 1 }} aria-label={product.name}></Link>

      {/* Badges */}
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
        {product.badges && product.badges.map((b: any, index: number) => (
          <span key={index} className={`badge badge-${b.type || "red"}`} style={{ fontSize: 11 }}>{b.text}</span>
        ))}
        {!product.badges && product.badge && (
          <span className={`badge badge-${product.badgeType || "red"}`} style={{ fontSize: 11 }}>{product.badge}</span>
        )}
        {discount && <span className="discount-tag">{discount}% OFF</span>}
        {product.isNew && <span className="badge badge-yellow" style={{ fontSize: 11 }}>New</span>}
      </div>

      {/* Wishlist */}
      <button
        aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            showToast("Removed from wishlist", "info");
          } else {
            addToWishlist(product as any);
            showToast("Added to wishlist!", "info");
          }
        }}
        style={{
          position: "absolute", top: 12, right: 12, width: 36, height: 36,
          borderRadius: "50%", background: "white", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--shadow-sm)", zIndex: 10, transition: "all 0.2s",
          color: isInWishlist(product.id) ? "var(--red)" : "var(--gray-400)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; (e.currentTarget as HTMLElement).style.color = isInWishlist(product.id) ? "var(--red)" : "var(--gray-400)"; }}
      >
        <Heart size={16} fill={isInWishlist(product.id) ? "var(--red)" : "none"} />
      </button>

      {/* Image */}
      <div className="product-image-wrap" style={{ 
        position: "relative", 
        background: "var(--gray-50)", 
        overflow: "hidden",
        aspectRatio: "1 / 1"
      }}>
        <Image
          src={product.image || "https://placehold.co/400x400?text=No+Image"}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit: "cover",
            transition: "transform 0.5s ease"
          }}
        />
        {!(product.in_stock !== undefined ? product.in_stock : product.inStock) && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
            <span style={{ background: "var(--gray-800)", color: "white", padding: "6px 16px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600 }}>Out of Stock</span>
          </div>
        )}
        {/* Hover Actions */}
        {(product.in_stock !== undefined ? product.in_stock : product.inStock) !== false && (
          <div className="card-actions desktop-only" style={{
            position: "absolute", bottom: 12, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 8,
            opacity: 0, transform: "translateY(8px)", transition: "all 0.25s",
            zIndex: 10
          }}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius-full)", cursor: "pointer", fontWeight: 600, fontSize: 13, boxShadow: "0 4px 12px rgba(230,57,70,0.4)" }}
            >
              <ShoppingCart size={14} /> Add to Cart
            </button>
            <button aria-label="Quick view" style={{ width: 36, height: 36, background: "white", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
              <Eye size={15} color="var(--gray-600)" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px", flex: 1, position: "relative", zIndex: 10, pointerEvents: "none" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", marginBottom: 6, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>
        {/* Store Info */}
        {product.store && (
          <div style={{ fontSize: 11, color: "var(--gray-500)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4, pointerEvents: "auto" }}>
            Sold by <Link href={`/store/${product.store.slug}`} style={{ color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>{product.store.name}</Link>
          </div>
        )}
        {/* Stars */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={13} fill={(product.reviews || 0) > 0 && s <= (product.rating || 0) ? "var(--yellow)" : "none"} color={(product.reviews || 0) > 0 && s <= (product.rating || 0) ? "var(--yellow)" : "var(--gray-300)"} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>({product.reviews || 0})</span>
        </div>
        {/* Price */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="price-current">Rs. {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="price-original">Rs. {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
