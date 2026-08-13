"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AddBundlePage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    in_stock: true,
    is_featured: false,
    is_best_seller: false,
    bundle_items: [] as string[],
    bundle_discount_pc: "0"
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setAllProducts(data.filter((p: any) => !p.is_bundle)); // Exclude bundles from being inside bundles
    }
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
    return null;
  };

  const handleSlugGen = () => {
    if (formData.name) {
      setFormData({ ...formData, slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
    }
  };

  const selectedProducts = allProducts.filter(p => formData.bundle_items.includes(p.id));
  const originalTotalPrice = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
  const discountPercent = parseFloat(formData.bundle_discount_pc) || 0;
  const finalPrice = originalTotalPrice - (originalTotalPrice * (discountPercent / 100));

  const toggleProduct = (id: string) => {
    setFormData(prev => {
      if (prev.bundle_items.includes(id)) {
        return { ...prev, bundle_items: prev.bundle_items.filter(i => i !== id) };
      } else {
        return { ...prev, bundle_items: [...prev.bundle_items, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bundle_items.length < 2) {
      alert("A bundle must contain at least 2 products.");
      return;
    }

    setLoading(true);

    try {
      let mainImageUrl = formData.image;
      if (mainImageFile) {
        const url = await uploadImage(mainImageFile);
        if (url) mainImageUrl = url;
      }

      const bundle = {
        name: formData.name,
        slug: formData.slug,
        price: finalPrice,
        original_price: originalTotalPrice,
        image: mainImageUrl,
        description: formData.description,
        in_stock: formData.in_stock,
        is_featured: formData.is_featured,
        is_best_seller: formData.is_best_seller,
        is_bundle: true,
        bundle_items: formData.bundle_items,
        bundle_discount_pc: discountPercent,
        stock_quantity: 100 // Bundles rely on sub-product stock
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle)
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Error saving bundle: " + data.error);
        setLoading(false);
      } else {
        router.push("/admin/bundles");
      }
    } catch (err: any) {
      alert("Unexpected error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href="/admin/bundles" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "white", border: "1px solid var(--gray-200)", color: "var(--gray-900)", textDecoration: "none" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Add New Bundle</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Create a promotional product bundle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 32, display: "flex", flexDirection: "column", gap: 24, boxShadow: "var(--shadow-sm)" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label className="label">Bundle Name *</label>
            <input className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onBlur={handleSlugGen} />
          </div>
          <div>
            <label className="label">Bundle Slug *</label>
            <input className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
          </div>
        </div>

        {/* Bundle Items Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
          <label className="label" style={{ marginBottom: 0 }}>Select Products for Bundle *</label>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -8 }}>Choose at least 2 products to include in this bundle.</p>
          <div style={{ maxHeight: 250, overflowY: "auto", border: "1px solid var(--gray-200)", borderRadius: 8, background: "white" }}>
            {allProducts.map(p => (
              <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--gray-100)", cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={formData.bundle_items.includes(p.id)} 
                  onChange={() => toggleProduct(p.id)}
                  style={{ width: 18, height: 18, accentColor: "var(--red)" }}
                />
                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)" }}>Rs. {p.price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Calculation */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, padding: 20, background: "#fef2f2", borderRadius: "var(--radius)", border: "1px solid #fecaca" }}>
          <div>
            <label className="label" style={{ color: "var(--red)" }}>Original Total (Rs)</label>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)" }}>{originalTotalPrice.toLocaleString()}</div>
          </div>
          <div>
            <label className="label" style={{ color: "var(--red)" }}>Discount Percentage (%)</label>
            <input className="input" type="number" required min="0" max="100" style={{ background: "white", border: "1px solid #fca5a5" }} value={formData.bundle_discount_pc} onChange={e => setFormData({ ...formData, bundle_discount_pc: e.target.value })} />
          </div>
          <div>
            <label className="label" style={{ color: "var(--red)" }}>Final Sale Price (Rs)</label>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--red)" }}>{finalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div>
          <label className="label">Bundle Image *</label>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <input type="file" accept="image/*" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setMainImageFile(e.target.files[0]);
                setFormData(prev => ({...prev, image: ""}));
              }
            }} />
            <span style={{ fontSize: 13, color: "var(--gray-500)" }}>OR provide URL:</span>
            <input className="input" style={{ flex: 1, background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.image} onChange={e => {
              setFormData({ ...formData, image: e.target.value });
              if (e.target.value) setMainImageFile(null);
            }} placeholder="https://..." disabled={!!mainImageFile} />
          </div>
          {(mainImageFile || formData.image) && (
            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <img src={mainImageFile ? URL.createObjectURL(mainImageFile) : formData.image} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-200)" }} />
            </div>
          )}
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea className="input" required rows={4} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", resize: "vertical" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what is included in this bundle and why it's a great deal!"></textarea>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, padding: "24px", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "white", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
            <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} style={{ width: 18, height: 18, accentColor: "var(--red)" }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Featured Bundle</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "white", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
            <input type="checkbox" checked={formData.is_best_seller} onChange={e => setFormData({...formData, is_best_seller: e.target.checked})} style={{ width: 18, height: 18, accentColor: "var(--red)" }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Best Seller</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "white", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
            <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({...formData, in_stock: e.target.checked})} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: formData.in_stock ? "#16a34a" : "var(--gray-500)" }}>
              {formData.in_stock ? "In Stock" : "Out of Stock"}
            </span>
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button type="submit" disabled={loading} style={{ background: "var(--red)", color: "white", border: "none", padding: "14px 32px", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow)", opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {loading ? "Saving Bundle..." : "Save Bundle"}
          </button>
        </div>

      </form>
    </div>
  );
}
