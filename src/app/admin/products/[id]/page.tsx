"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    original_price: "",
    image: "",
    images: "",
    rating: "5.0",
    reviews: "0",
    badge: "",
    badge_type: "yellow",
    category_id: "",
    description: "",
    in_stock: true,
    is_featured: false,
    is_best_seller: false
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: catData } = await supabase.from("categories").select("*");
    if (catData) setCategories(catData);

    if (id && id !== "new") {
      const { data: prodData } = await supabase.from("products").select("*").eq("id", id).single();
      if (prodData) {
        setFormData({
          name: prodData.name,
          slug: prodData.slug,
          price: prodData.price.toString(),
          original_price: prodData.original_price ? prodData.original_price.toString() : "",
          image: prodData.image,
          images: prodData.images ? prodData.images.join(", ") : "",
          rating: prodData.rating.toString(),
          reviews: prodData.reviews.toString(),
          badge: prodData.badge || "",
          badge_type: prodData.badge_type || "yellow",
          category_id: prodData.category_id || (catData && catData.length > 0 ? catData[0].id : ""),
          description: prodData.description || "",
          in_stock: prodData.in_stock,
          is_featured: prodData.is_featured,
          is_best_seller: prodData.is_best_seller
        });
      }
    } else if (catData && catData.length > 0) {
      setFormData(prev => ({ ...prev, category_id: catData[0].id }));
    }
    setInitialLoading(false);
  };

  const handleSlugGen = () => {
    if (formData.name) {
      setFormData({ ...formData, slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const product = {
      name: formData.name,
      slug: formData.slug,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      image: formData.image,
      images: formData.images.split(",").map(s => s.trim()).filter(Boolean),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews, 10),
      badge: formData.badge || null,
      badge_type: formData.badge ? formData.badge_type : null,
      category_id: formData.category_id || null,
      description: formData.description,
      in_stock: formData.in_stock,
      is_featured: formData.is_featured,
      is_best_seller: formData.is_best_seller
    };

    const { error } = await supabase.from("products").update(product).eq("id", id);

    if (error) {
      alert("Error saving product: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin/products");
    }
  };

  if (initialLoading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}><Loader2 size={32} className="animate-spin" style={{ margin: "0 auto" }} /></div>;
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href="/admin/products" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "white", border: "1px solid var(--gray-200)", color: "var(--gray-900)", textDecoration: "none" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Edit Product</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Update product details and stock</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 32, display: "flex", flexDirection: "column", gap: 24, boxShadow: "var(--shadow-sm)" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label className="label">Product Name *</label>
            <input className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onBlur={handleSlugGen} />
          </div>
          <div>
            <label className="label">Product Slug *</label>
            <input className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          <div>
            <label className="label">Price (Rs) *</label>
            <input className="input" type="number" required style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Original Price (Rs)</label>
            <input className="input" type="number" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: e.target.value })} />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input" required style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div>
            <label className="label">Main Image URL *</label>
            <input className="input" required style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="label">Additional Images (comma separated URLs)</label>
            <input className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input" required rows={5} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", resize: "vertical" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label className="label">Badge Text (e.g. HOT, NEW)</label>
            <input className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
          </div>
          <div>
            <label className="label">Badge Color</label>
            <select className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.badge_type} onChange={e => setFormData({ ...formData, badge_type: e.target.value })}>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, padding: "20px", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
            <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({ ...formData, in_stock: e.target.checked })} style={{ width: 18, height: 18 }} />
            In Stock
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
            <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} style={{ width: 18, height: 18 }} />
            Featured Product
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
            <input type="checkbox" checked={formData.is_best_seller} onChange={e => setFormData({ ...formData, is_best_seller: e.target.checked })} style={{ width: 18, height: 18 }} />
            Best Seller
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)", paddingTop: 24, marginTop: 8 }}>
          <button type="submit" disabled={loading} className="btn-red" style={{ gap: 8, padding: "12px 32px" }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Update Product
          </button>
        </div>
      </form>
    </div>
  );
}
