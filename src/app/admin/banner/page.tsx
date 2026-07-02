"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, LayoutList } from "lucide-react";

const defaultSlide = {
  badge: "",
  title: "New Slide",
  subtitle: "",
  cta: "Shop Now",
  href: "/shop",
  bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)",
  accent: "var(--red)",
  image: "https://placehold.co/700x525?text=New+Banner",
  floatingTagTitle: "Best Seller",
  floatingTagSubtitle: "500+ sold this week",
};

export default function HomeBannerAdmin() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch("/api/settings/banner");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            setSlides(data);
          } else {
            // Fallback to defaults from page.tsx if nothing in DB
            setSlides([
              {
                badge: "Summer Special", title: "Stay Cool with\\nNeck Fan",
                subtitle: "Wearable 360° bladeless neck fan — perfect for Pakistani summers",
                cta: "Shop Now", href: "/shop/neck-fan",
                bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)", accent: "var(--red)",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
              }
            ]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBanner();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slides),
      });
      if (!res.ok) throw new Error("Failed to save banner");
      showToast("Home Banner updated successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error updating Home Banner", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const addSlide = () => {
    setSlides([...slides, { ...defaultSlide }]);
  };

  const removeSlide = (index: number) => {
    if (confirm("Are you sure you want to remove this slide?")) {
      const newSlides = [...slides];
      newSlides.splice(index, 1);
      setSlides(newSlides);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;
    setSlides(newSlides);
  };

  const moveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;
    setSlides(newSlides);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)" }}>Home Banner Settings</h1>
          <p style={{ color: "var(--gray-500)", marginTop: 4 }}>Manage the rotating slides on the homepage hero section.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-red" style={{ padding: "12px 24px" }}>
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {slides.map((slide, i) => (
          <div key={i} style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", gap: 24 }}>
            
            {/* Left Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid var(--gray-100)", paddingRight: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--gray-400)", textAlign: "center" }}>#{i + 1}</div>
              <button onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: 8, background: i === 0 ? "transparent" : "var(--gray-50)", border: "none", borderRadius: 8, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1 }}>
                <ArrowUp size={18} />
              </button>
              <button onClick={() => moveDown(i)} disabled={i === slides.length - 1} style={{ padding: 8, background: i === slides.length - 1 ? "transparent" : "var(--gray-50)", border: "none", borderRadius: 8, cursor: i === slides.length - 1 ? "default" : "pointer", opacity: i === slides.length - 1 ? 0.3 : 1 }}>
                <ArrowDown size={18} />
              </button>
              <button onClick={() => removeSlide(i)} style={{ padding: 8, background: "#fef2f2", color: "var(--red)", border: "none", borderRadius: 8, cursor: "pointer", marginTop: "auto" }}>
                <Trash2 size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="label">Badge Text (e.g. Summer Special)</label>
                <input type="text" className="input" value={slide.badge} onChange={(e) => updateSlide(i, "badge", e.target.value)} />
              </div>
              <div>
                <label className="label">Title (use \\n for line break)</label>
                <input type="text" className="input" value={slide.title} onChange={(e) => updateSlide(i, "title", e.target.value)} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className="label">Subtitle / Description</label>
                <input type="text" className="input" value={slide.subtitle} onChange={(e) => updateSlide(i, "subtitle", e.target.value)} />
              </div>
              <div>
                <label className="label">Button Text</label>
                <input type="text" className="input" value={slide.cta} onChange={(e) => updateSlide(i, "cta", e.target.value)} />
              </div>
              <div>
                <label className="label">Button Link / URL</label>
                <input type="text" className="input" value={slide.href} onChange={(e) => updateSlide(i, "href", e.target.value)} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className="label">Image URL (Square or 4:3 aspect ratio recommended)</label>
                <input type="text" className="input" value={slide.image} onChange={(e) => updateSlide(i, "image", e.target.value)} />
                {slide.image && (
                  <div style={{ marginTop: 8, width: 120, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--gray-200)", background: "#f9f9f9" }}>
                    <img src={slide.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>
              <div>
                <label className="label">Background CSS (Gradient or Color)</label>
                <input type="text" className="input" value={slide.bg} onChange={(e) => updateSlide(i, "bg", e.target.value)} placeholder="linear-gradient(135deg, #fff, #eee)" />
              </div>
              <div>
                <label className="label">Accent Color (For highlighted text)</label>
                <input type="text" className="input" value={slide.accent} onChange={(e) => updateSlide(i, "accent", e.target.value)} placeholder="var(--red) or #ff0000" />
              </div>
              <div>
                <label className="label">Image Floating Tag Title</label>
                <input type="text" className="input" value={slide.floatingTagTitle !== undefined ? slide.floatingTagTitle : "Best Seller"} onChange={(e) => updateSlide(i, "floatingTagTitle", e.target.value)} />
              </div>
              <div>
                <label className="label">Image Floating Tag Subtitle</label>
                <input type="text" className="input" value={slide.floatingTagSubtitle !== undefined ? slide.floatingTagSubtitle : "500+ sold this week"} onChange={(e) => updateSlide(i, "floatingTagSubtitle", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addSlide} style={{ marginTop: 24, padding: "16px 24px", width: "100%", background: "white", border: "2px dashed var(--gray-300)", borderRadius: "var(--radius-lg)", color: "var(--gray-600)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-300)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-600)"; }}>
        <Plus size={20} /> Add New Slide
      </button>
    </div>
  );
}
