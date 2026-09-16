"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { Store, MapPin } from "lucide-react";

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      const res = await fetch(`/api/stores/${slug}`);
      if (res.ok) {
        setStore(await res.json());
      }
      setLoading(false);
    };
    if (slug) fetchStore();
  }, [slug]);

  if (loading) return <div style={{ padding: "100px 20px", textAlign: "center" }}>Loading store...</div>;
  if (!store) return <div style={{ padding: "100px 20px", textAlign: "center" }}>Store not found.</div>;

  return (
    <div style={{ background: "var(--gray-50)", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Store Banner */}
      <div style={{ height: 250, position: "relative", background: "var(--gray-200)" }}>
        {store.banner ? (
          <Image src={store.banner} alt={`${store.name} banner`} fill style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(45deg, #1f2937, #374151)", color: "white" }}>
            <h1 style={{ fontSize: 40, opacity: 0.5, fontWeight: 900 }}>{store.name}</h1>
          </div>
        )}
      </div>

      <div className="container" style={{ marginTop: -50, position: "relative", zIndex: 10 }}>
        {/* Store Profile Card */}
        <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 40 }}>
          <div style={{ width: 120, height: 120, borderRadius: 16, background: "white", padding: 8, boxShadow: "var(--shadow-md)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
            {store.logo ? (
              <Image src={store.logo} alt={store.name} fill style={{ objectFit: "contain", padding: 10 }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "var(--gray-100)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Store size={40} color="var(--gray-400)" />
              </div>
            )}
          </div>
          
          <div style={{ flex: 1, paddingBottom: 10 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 8 }}>{store.name}</h1>
            <p style={{ color: "var(--gray-500)", fontSize: 14, maxWidth: 600 }}>{store.description || "Welcome to our store! Check out our latest products."}</p>
          </div>
        </div>

        {/* Store Products */}
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            All Products <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-500)", background: "var(--gray-200)", padding: "4px 10px", borderRadius: 12 }}>{store.products.length}</span>
          </h2>
          
          {store.products.length > 0 ? (
            <div className="product-grid">
              {store.products.map((product: any) => (
                <ProductCard key={product.id} product={{ ...product, store }} />
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", background: "white", borderRadius: "var(--radius-lg)" }}>
              No products found in this store.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
