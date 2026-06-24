"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, uploadProductImage } from "@/lib/supabase";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [badges, setBadges] = useState<{ text: string; type: string }[]>([
    { text: "", type: "yellow" }
  ]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [trustPoints, setTrustPoints] = useState<{ icon: string; text: string }[]>([
    { icon: "truck", text: "Free delivery on orders above Rs. 2000" },
    { icon: "shield", text: "100% authentic & quality guaranteed" },
    { icon: "rotate-ccw", text: "7-day easy returns & exchanges" },
    { icon: "zap", text: "Cash on Delivery available nationwide" }
  ]);
  
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
    stock_quantity: "10",
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
          stock_quantity: prodData.stock_quantity !== undefined && prodData.stock_quantity !== null ? prodData.stock_quantity.toString() : "10",
          is_featured: prodData.is_featured,
          is_best_seller: prodData.is_best_seller
        });
        setSpecs(prodData.specs || []);
        
        // Dynamic badges
        if (prodData.badges && prodData.badges.length > 0) {
          setBadges(prodData.badges);
        } else if (prodData.badge) {
          setBadges([{ text: prodData.badge, type: prodData.badge_type || "yellow" }]);
        } else {
          setBadges([]);
        }

        // Dynamic features
        setFeatures(prodData.features && prodData.features.length > 0 ? prodData.features : [""]);

        // Dynamic trust points
        setTrustPoints(prodData.trust_points && prodData.trust_points.length > 0 ? prodData.trust_points : [
          { icon: "truck", text: "Free delivery on orders above Rs. 2000" },
          { icon: "shield", text: "100% authentic & quality guaranteed" },
          { icon: "rotate-ccw", text: "7-day easy returns & exchanges" },
          { icon: "zap", text: "Cash on Delivery available nationwide" }
        ]);
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

  // Specs handlers
  const handleAddSpec = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };
  const handleSpecChange = (index: number, field: "label" | "value", val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };
  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Badges handlers
  const handleAddBadge = () => {
    setBadges([...badges, { text: "", type: "yellow" }]);
  };
  const handleBadgeChange = (index: number, field: "text" | "type", val: string) => {
    const newBadges = [...badges];
    newBadges[index][field] = val;
    setBadges(newBadges);
  };
  const handleRemoveBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  // Features handlers
  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };
  const handleFeatureChange = (index: number, val: string) => {
    const newFeatures = [...features];
    newFeatures[index] = val;
    setFeatures(newFeatures);
  };
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Trust Points handlers
  const handleAddTrustPoint = () => {
    setTrustPoints([...trustPoints, { icon: "truck", text: "" }]);
  };
  const handleTrustPointChange = (index: number, field: "icon" | "text", val: string) => {
    const newTrustPoints = [...trustPoints];
    newTrustPoints[index][field] = val;
    setTrustPoints(newTrustPoints);
  };
  const handleRemoveTrustPoint = (index: number) => {
    setTrustPoints(trustPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = formData.image;
      if (mainImageFile) {
        const url = await uploadProductImage(mainImageFile);
        if (url) mainImageUrl = url;
      }

      let additionalImageUrls: string[] = [];
      if (formData.images) {
        additionalImageUrls = formData.images.split(",").map(s => s.trim()).filter(s => s);
      }
      if (galleryFiles.length > 0) {
        const uploadedUrls = await Promise.all(galleryFiles.map(f => uploadProductImage(f)));
        const validUrls = uploadedUrls.filter(url => url !== null) as string[];
        additionalImageUrls = [...additionalImageUrls, ...validUrls];
      }

      const activeBadges = badges.filter(b => b.text.trim() !== "");
      const qtyVal = parseInt(formData.stock_quantity, 10);
      const calculatedQty = isNaN(qtyVal) ? 0 : qtyVal;

      const product = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image: mainImageUrl,
        images: additionalImageUrls,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews, 10),
        badge: activeBadges.length > 0 ? activeBadges[0].text : null,
        badge_type: activeBadges.length > 0 ? activeBadges[0].type : null,
        badges: activeBadges,
        category_id: formData.category_id || null,
        description: formData.description,
        in_stock: calculatedQty > 0 ? formData.in_stock : false,
        stock_quantity: calculatedQty,
        is_featured: formData.is_featured,
        is_best_seller: formData.is_best_seller,
        specs: specs.filter(s => s.label.trim() !== "" || s.value.trim() !== ""),
        features: features.filter(f => f.trim() !== ""),
        trust_points: trustPoints.filter(tp => tp.text.trim() !== "")
      };

      const { error } = await supabase.from("products").update(product).eq("id", id);

      if (error) {
        alert("Error saving product: " + error.message);
        setLoading(false);
      } else {
        router.push("/admin/products");
      }
    } catch (err: any) {
      alert("Unexpected error: " + err.message);
      setLoading(false);
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
                <img 
                  src={mainImageFile ? URL.createObjectURL(mainImageFile) : formData.image} 
                  alt="Main Preview" 
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-200)" }} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Invalid+URL'; }}
                />
                <div style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  {mainImageFile ? mainImageFile.name : "From URL"}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="label">Additional Images (Multiple)</label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <input type="file" accept="image/*" multiple onChange={e => {
                if (e.target.files) {
                  setGalleryFiles(Array.from(e.target.files));
                }
              }} />
              <span style={{ fontSize: 13, color: "var(--gray-500)" }}>AND/OR comma separated URLs:</span>
              <input className="input" style={{ flex: 1, background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} placeholder="URL1, URL2..." />
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
              {formData.images.split(",").map(url => url.trim()).filter(Boolean).map((url, i) => (
                <img 
                  key={`url-${i}`} 
                  src={url} 
                  alt="Gallery Preview" 
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-200)" }} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Invalid+URL'; }}
                />
              ))}
              {galleryFiles.map((file, i) => (
                <img 
                  key={`file-${i}`} 
                  src={URL.createObjectURL(file)} 
                  alt="Gallery Upload Preview" 
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--blue)", position: "relative" }} 
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input" required rows={5} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", resize: "vertical" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>
        </div>

        {/* Badges Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="label" style={{ marginBottom: 0 }}>Product Badges</label>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -8 }}>Add promotional badges to showcase on product image cards (e.g. HOT, 20% OFF, NEW).</p>
          
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "50%" }}>Badge Text</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "35%" }}>Badge Type / Color</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "15%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {badges.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "24px 16px", textAlign: "center", color: "var(--gray-400)", fontSize: 14 }}>
                    No badges added yet. Add a badge below.
                  </td>
                </tr>
              ) : (
                badges.map((b, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        placeholder="e.g. HOT" 
                        value={b.text} 
                        onChange={e => handleBadgeChange(index, "text", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <select 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        value={b.type} 
                        onChange={e => handleBadgeChange(index, "type", e.target.value)}
                      >
                        <option value="yellow">Yellow (New, Standard)</option>
                        <option value="red">Red (Hot, Discount)</option>
                        <option value="green">Green (Featured)</option>
                        <option value="gray">Gray (Out of stock/Secondary)</option>
                      </select>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveBadge(index)}
                        style={{ 
                          background: "var(--red)", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "var(--radius-sm)", 
                          padding: "8px 12px", 
                          cursor: "pointer", 
                          fontSize: 13, 
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
              
              <tr style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)" }}>
                <td colSpan={3} style={{ padding: 12 }}>
                  <button 
                    type="button" 
                    onClick={handleAddBadge}
                    style={{ 
                      width: "100%", 
                      background: "white", 
                      border: "2px dashed var(--red)", 
                      color: "var(--red)", 
                      padding: "12px", 
                      borderRadius: "var(--radius)", 
                      fontSize: 14, 
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all var(--transition)"
                    }}
                  >
                    <Plus size={16} /> + Add Badge Row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Description Points Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="label" style={{ marginBottom: 0 }}>Description Bullet Points</label>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -8 }}>Add key product features or highlights shown on the product detail tabs (e.g. "360° bladeless airflow", "Ultra-quiet operation").</p>
          
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "85%" }}>Description / Feature Highlight</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "15%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {features.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: "24px 16px", textAlign: "center", color: "var(--gray-400)", fontSize: 14 }}>
                    No bullet points added yet. Add a description point below.
                  </td>
                </tr>
              ) : (
                features.map((f, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        placeholder="e.g. Flexible lightweight neck design" 
                        value={f} 
                        onChange={e => handleFeatureChange(index, e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFeature(index)}
                        style={{ 
                          background: "var(--red)", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "var(--radius-sm)", 
                          padding: "8px 12px", 
                          cursor: "pointer", 
                          fontSize: 13, 
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
              
              <tr style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)" }}>
                <td colSpan={2} style={{ padding: 12 }}>
                  <button 
                    type="button" 
                    onClick={handleAddFeature}
                    style={{ 
                      width: "100%", 
                      background: "white", 
                      border: "2px dashed var(--red)", 
                      color: "var(--red)", 
                      padding: "12px", 
                      borderRadius: "var(--radius)", 
                      fontSize: 14, 
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all var(--transition)"
                    }}
                  >
                    <Plus size={16} /> + Add Description Point Row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Trust Points / Delivery Info Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="label" style={{ marginBottom: 0 }}>Trust Points & Delivery Info</label>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -8 }}>Customize the delivery & trust highlights displayed next to the product purchase block (e.g. Free Delivery, 7-day returns).</p>
          
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "30%" }}>Icon</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "55%" }}>Trust Highlight / Text</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "15%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trustPoints.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "24px 16px", textAlign: "center", color: "var(--gray-400)", fontSize: 14 }}>
                    No trust highlights added yet. Add a trust point below.
                  </td>
                </tr>
              ) : (
                trustPoints.map((tp, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <select 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        value={tp.icon} 
                        onChange={e => handleTrustPointChange(index, "icon", e.target.value)}
                      >
                        <option value="truck">Truck (Delivery, Shipping)</option>
                        <option value="shield">Shield (Quality, Guarantee)</option>
                        <option value="rotate-ccw">Rotate CCW (Returns, Exchange)</option>
                        <option value="zap">Lightning Zap (COD, Fast)</option>
                        <option value="check-circle">Checkmark (Verified, Authentic)</option>
                        <option value="heart">Heart (Premium, Customer Love)</option>
                      </select>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        placeholder="e.g. Free delivery on orders above Rs. 2000" 
                        value={tp.text} 
                        onChange={e => handleTrustPointChange(index, "text", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTrustPoint(index)}
                        style={{ 
                          background: "var(--red)", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "var(--radius-sm)", 
                          padding: "8px 12px", 
                          cursor: "pointer", 
                          fontSize: 13, 
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
              
              <tr style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)" }}>
                <td colSpan={3} style={{ padding: 12 }}>
                  <button 
                    type="button" 
                    onClick={handleAddTrustPoint}
                    style={{ 
                      width: "100%", 
                      background: "white", 
                      border: "2px dashed var(--red)", 
                      color: "var(--red)", 
                      padding: "12px", 
                      borderRadius: "var(--radius)", 
                      fontSize: 14, 
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all var(--transition)"
                    }}
                  >
                    <Plus size={16} /> + Add Trust Point Row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Specifications Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="label" style={{ marginBottom: 0 }}>Product Specifications</label>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -8 }}>Add custom specifications for this product (e.g., Label: "Battery", Value: "2000mAh"). This builds a custom specs table on the product page.</p>
          
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "40%" }}>Specification Label</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "45%" }}>Specification Value</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--gray-700)", width: "15%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specs.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "24px 16px", textAlign: "center", color: "var(--gray-400)", fontSize: 14 }}>
                    No specifications added yet. Add a custom specification below.
                  </td>
                </tr>
              ) : (
                specs.map((spec, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        placeholder="e.g. Battery" 
                        value={spec.label} 
                        onChange={e => handleSpecChange(index, "label", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: "10px 14px", fontSize: 14 }}
                        placeholder="e.g. 2000mAh Li-ion" 
                        value={spec.value} 
                        onChange={e => handleSpecChange(index, "value", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSpec(index)}
                        style={{ 
                          background: "var(--red)", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "var(--radius-sm)", 
                          padding: "8px 12px", 
                          cursor: "pointer", 
                          fontSize: 13, 
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
              
              {/* Table-type row for adding field */}
              <tr style={{ background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)" }}>
                <td colSpan={3} style={{ padding: 12 }}>
                  <button 
                    type="button" 
                    onClick={handleAddSpec}
                    style={{ 
                      width: "100%", 
                      background: "white", 
                      border: "2px dashed var(--red)", 
                      color: "var(--red)", 
                      padding: "12px", 
                      borderRadius: "var(--radius)", 
                      fontSize: 14, 
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all var(--transition)"
                    }}
                  >
                    <Plus size={16} /> + Add Specification Row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: "24px", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
          <div>
            <label className="label">Stock Quantity *</label>
            <input 
              className="input" 
              type="number" 
              required 
              style={{ background: "white", border: "1px solid var(--gray-200)" }} 
              value={formData.stock_quantity} 
              onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} 
              placeholder="e.g. 10"
              min="0"
            />
          </div>
          <div>
            <label className="label" style={{ marginBottom: 12 }}>Product Options</label>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
                <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({ ...formData, in_stock: e.target.checked })} style={{ width: 18, height: 18 }} />
                In Stock
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} style={{ width: 18, height: 18 }} />
                Featured
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
                <input type="checkbox" checked={formData.is_best_seller} onChange={e => setFormData({ ...formData, is_best_seller: e.target.checked })} style={{ width: 18, height: 18 }} />
                Best Seller
              </label>
            </div>
          </div>
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
