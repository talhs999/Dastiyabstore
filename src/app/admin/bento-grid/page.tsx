"use client";
import { useEffect, useState } from "react";
import { Save, RotateCcw, Image as ImageIcon, Type, Link2, Palette } from "lucide-react";

const BLOCK_LABELS = ["Main Block (Large Left)", "Wide Top Right", "Small Top Right", "Small Bottom Right", "Wide Bottom Right"];
const BLOCK_TYPES = ["main", "wide", "small", "small", "wide"];

const DEFAULTS = [
  { id: "block1", badge: "Season's Hot Product", title: "Stay Cool with", titleHighlight: "Neck Fan", subtitle: "Wearable 360° bladeless neck fan — perfect for Pakistani summers.", buttonText: "Shop Now", buttonLink: "/shop/neck-fan", bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)", accentColor: "var(--red)", image: "", type: "main" },
  { id: "block2", title: "Mobile\nAccessories", subtitle: "Chargers, Cables & More", buttonText: "Explore", buttonLink: "/shop/mobile-accessories", bg: "#e0f2fe", accentColor: "#0ea5e9", image: "", type: "wide" },
  { id: "block3", title: "Home", subtitle: "Smart gadgets", buttonText: "Learn More", buttonLink: "/shop/home-gadgets", bg: "#fff0f0", accentColor: "var(--red)", image: "", type: "small" },
  { id: "block4", title: "Computer", subtitle: "Stands, Hubs & More", buttonText: "Explore", buttonLink: "/shop/laptop-stand", bg: "#f0fdf4", accentColor: "#16a34a", image: "", type: "small" },
  { id: "block5", title: "Explore All\nCategories", subtitle: "Find everything you need in one place.", buttonText: "Browse Catalog", buttonLink: "/shop", bg: "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)", accentColor: "#8b5cf6", image: "", type: "wide" },
];

export default function AdminBentoGrid() {
  const [blocks, setBlocks] = useState<any[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/bento-grid")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length === 5) setBlocks(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateBlock = (idx: number, field: string, value: string) => {
    setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/bento-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blocks),
      });
      if (res.ok) setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setBlocks(DEFAULTS);
    setSaved(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>Bento Grid Editor</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 14, marginTop: 4 }}>Customize each block of the homepage bento grid</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", border: "1px solid var(--gray-300)", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--gray-600)" }}>
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", border: "none", borderRadius: 8, background: saved ? "#16a34a" : "var(--gray-900)", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
            <Save size={16} /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      {blocks.map((block, idx) => (
        <div key={idx} style={{ background: "white", borderRadius: 12, border: "1px solid var(--gray-200)", padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ background: "var(--gray-900)", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>Block {idx + 1}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-600)" }}>{BLOCK_LABELS[idx]}</span>
            <span style={{ fontSize: 11, background: "var(--gray-100)", padding: "2px 8px", borderRadius: 4, color: "var(--gray-500)" }}>{BLOCK_TYPES[idx]}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Title */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Type size={12} /> Title
              </label>
              <input value={block.title} onChange={e => updateBlock(idx, "title", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>

            {/* Title Highlight (only for main block) */}
            {idx === 0 ? (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <Type size={12} /> Highlighted Text
                </label>
                <input value={block.titleHighlight || ""} onChange={e => updateBlock(idx, "titleHighlight", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <Type size={12} /> Subtitle
                </label>
                <input value={block.subtitle || ""} onChange={e => updateBlock(idx, "subtitle", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
              </div>
            )}

            {/* Subtitle for main block */}
            {idx === 0 && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <Type size={12} /> Subtitle / Description
                </label>
                <input value={block.subtitle || ""} onChange={e => updateBlock(idx, "subtitle", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
              </div>
            )}

            {/* Badge (only main block) */}
            {idx === 0 && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginBottom: 6, display: "block" }}>Badge Text</label>
                <input value={block.badge || ""} onChange={e => updateBlock(idx, "badge", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
              </div>
            )}

            {/* Button Text */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Link2 size={12} /> Button Text
              </label>
              <input value={block.buttonText || ""} onChange={e => updateBlock(idx, "buttonText", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>

            {/* Button Link */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Link2 size={12} /> Button Link
              </label>
              <input value={block.buttonLink || ""} onChange={e => updateBlock(idx, "buttonLink", e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>

            {/* Image URL */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <ImageIcon size={12} /> Image URL
              </label>
              <input value={block.image || ""} onChange={e => updateBlock(idx, "image", e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>

            {/* Background */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Palette size={12} /> Background
              </label>
              <input value={block.bg || ""} onChange={e => updateBlock(idx, "bg", e.target.value)} placeholder="#e0f2fe or linear-gradient(...)" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>

            {/* Accent Color */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Palette size={12} /> Accent / Button Color
              </label>
              <input value={block.accentColor || ""} onChange={e => updateBlock(idx, "accentColor", e.target.value)} placeholder="#0ea5e9" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>

          {/* Preview swatch */}
          {block.bg && (
            <div style={{ marginTop: 12, height: 40, borderRadius: 8, background: block.bg, border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-600)", background: "rgba(255,255,255,0.8)", padding: "2px 10px", borderRadius: 4 }}>Background Preview</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
