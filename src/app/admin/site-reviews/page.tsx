"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, MoveUp, MoveDown, Star } from "lucide-react";

export default function AdminSiteReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultColors = ["#e91e63", "#9c27b0", "#2196f3", "#00bcd4", "#4caf50", "#ff9800"];

  useEffect(() => {
    fetch("/api/settings/site-reviews")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          // Fallback initial state
          setReviews([
            { name: "Ahmed Raza", city: "Lahore", text: "Neck fan is amazing! Perfect for summer. COD delivery was smooth. Highly recommended!", product: "Neck Fan 360°", time: "a week ago", color: "#e91e63", rating: 5 },
          ]);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/settings/site-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviews)
    });
    setSaving(false);
    if (res.ok) alert("Site reviews saved successfully!");
    else alert("Failed to save reviews");
  };

  const addReview = () => {
    setReviews([
      { name: "New Customer", city: "City", text: "Great product!", product: "Product Name", time: "just now", color: defaultColors[reviews.length % defaultColors.length], rating: 5 },
      ...reviews
    ]);
  };

  const removeReview = (idx: number) => {
    if(confirm("Remove this review?")) {
      const newReviews = [...reviews];
      newReviews.splice(idx, 1);
      setReviews(newReviews);
    }
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newReviews = [...reviews];
    const temp = newReviews[idx];
    newReviews[idx] = newReviews[idx - 1];
    newReviews[idx - 1] = temp;
    setReviews(newReviews);
  };

  const moveDown = (idx: number) => {
    if (idx === reviews.length - 1) return;
    const newReviews = [...reviews];
    const temp = newReviews[idx];
    newReviews[idx] = newReviews[idx + 1];
    newReviews[idx + 1] = temp;
    setReviews(newReviews);
  };

  const updateReview = (idx: number, field: string, value: any) => {
    const newReviews = [...reviews];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setReviews(newReviews);
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Site Reviews (Google Reviews)</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage the manually added reviews shown on the home page.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={addReview} className="btn-ghost" style={{ border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Review
          </button>
          <button onClick={handleSave} className="btn-red" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", gap: 24 }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                <button onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: 4, background: "var(--gray-100)", border: "none", borderRadius: 4, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.5 : 1 }}><MoveUp size={16} /></button>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", textAlign: "center" }}>{i + 1}</div>
                <button onClick={() => moveDown(i)} disabled={i === reviews.length - 1} style={{ padding: 4, background: "var(--gray-100)", border: "none", borderRadius: 4, cursor: i === reviews.length - 1 ? "not-allowed" : "pointer", opacity: i === reviews.length - 1 ? 0.5 : 1 }}><MoveDown size={16} /></button>
              </div>

              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Customer Name</label>
                  <input className="input" value={r.name} onChange={e => updateReview(i, "name", e.target.value)} />
                </div>
                <div>
                  <label className="label">City / Location</label>
                  <input className="input" value={r.city} onChange={e => updateReview(i, "city", e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="label">Review Text</label>
                  <textarea className="input" rows={3} value={r.text} onChange={e => updateReview(i, "text", e.target.value)} />
                </div>
                <div>
                  <label className="label">Purchased Product (Optional)</label>
                  <input className="input" value={r.product || ""} onChange={e => updateReview(i, "product", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Time (e.g. 2 days ago)</label>
                    <input className="input" value={r.time || ""} onChange={e => updateReview(i, "time", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Avatar Color</label>
                    <input type="color" value={r.color} onChange={e => updateReview(i, "color", e.target.value)} style={{ width: "100%", height: 42, padding: 2, cursor: "pointer", border: "1px solid var(--gray-200)", borderRadius: 8 }} />
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="label">Rating</label>
                  <select className="input" value={r.rating || 5} onChange={e => updateReview(i, "rating", Number(e.target.value))}>
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <button onClick={() => removeReview(i)} className="btn-ghost" style={{ padding: 8, color: "var(--red)" }}>
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          ))}
          {reviews.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, background: "var(--gray-50)", borderRadius: 12, color: "var(--gray-500)" }}>
              No reviews added. Click "Add Review" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
