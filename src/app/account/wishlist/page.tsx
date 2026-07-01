"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/store/wishlistStore";
import { useCart } from "@/store/cartStore";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/components/ui/Toast";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [displayItems, setDisplayItems] = useState<any[]>(items);

  useEffect(() => {
    setDisplayItems(items);

    if (items.length === 0) return;

    async function fetchLatestStock() {
      try {
        const itemIds = items.map(i => i.id);
        const res = await fetch(`/api/products?ids=${itemIds.join(',')}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        if (data && data.length > 0) {
          const updatedItems = items.map(item => {
            const dbProduct = data.find((db: any) => db.id === item.id);
            if (dbProduct) {
              const isProductInStock = dbProduct.in_stock !== undefined ? dbProduct.in_stock : true;
              const stockQty = dbProduct.stock_quantity !== undefined ? dbProduct.stock_quantity : 10;
              return {
                ...item,
                price: Number(dbProduct.price),
                originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
                inStock: isProductInStock && stockQty > 0,
                in_stock: isProductInStock && stockQty > 0,
                stock_quantity: stockQty,
                image: dbProduct.image,
                name: dbProduct.name
              };
            }
            return item;
          });
          setDisplayItems(updatedItems);
        }
      } catch (err) {
        console.error("Error fetching latest stock for wishlist:", err);
      }
    }

    fetchLatestStock();
  }, [items]);

  const handleAddAllToCart = () => {
    let addedCount = 0;
    displayItems.forEach(item => {
      const isItemInStock = item.in_stock !== undefined ? item.in_stock : item.inStock;
      if (isItemInStock) {
        addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showToast(`${addedCount} available item(s) added to cart!`);
    } else {
      showToast("No available items in stock to add.", "error");
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px", minHeight: "60vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", display: "flex", alignItems: "center", gap: 12 }}>
            <Heart size={28} color="var(--red)" fill="var(--red)" />
            My Wishlist
          </h1>
          <p style={{ color: "var(--gray-500)", marginTop: 4 }}>
            {items.length} item{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        
        {items.length > 0 && (
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={clearWishlist}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", color: "var(--gray-600)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              <Trash2 size={16} /> Clear All
            </button>
            <button 
              onClick={handleAddAllToCart}
              className="btn-red"
            >
              <ShoppingCart size={16} /> Add All to Cart
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "2px dashed var(--gray-200)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "var(--shadow-sm)" }}>
            <Heart size={40} color="var(--gray-300)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-800)", marginBottom: 12 }}>Your wishlist is empty</h2>
          <p style={{ color: "var(--gray-500)", maxWidth: 400, margin: "0 auto 24px" }}>
            Explore our collection and save your favorite items by clicking the heart icon.
          </p>
          <Link href="/shop" className="btn-red" style={{ display: "inline-flex", textDecoration: "none" }}>
            Explore Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {displayItems.map(product => (
            <div key={product.id} style={{ position: "relative" }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
