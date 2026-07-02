"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { Save } from "lucide-react";

export default function PromoBannerAdmin() {
  const [data, setData] = useState({
    enabled: true,
    badge1: "Limited Time",
    badge2: "Up to 50% Off",
    title: "Summer Sale —",
    titleHighlight: "Neck Fans",
    titleEnd: "Up to 50% Off",
    subtitle: "Beat the heat with our best-selling wearable neck fans. Limited stock available!",
    buttonText: "Shop Neck Fans",
    buttonLink: "/shop/neck-fan",
    buttonBg: "var(--yellow)",
    buttonTextCol: "var(--black)",
    bgStyle: "linear-gradient(135deg, var(--red) 0%, #c62333 40%, #9b1526 100%)",
    bullet1: "Free Delivery Included",
    bullet2: "Cash on Delivery",
    bullet3: "7-Day Easy Returns"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch("/api/settings/promo-banner");
        if (res.ok) {
          const fetchedData = await res.json();
          if (fetchedData) setData(fetchedData);
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
      const res = await fetch("/api/settings/promo-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Promo Banner updated successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error updating Promo Banner", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setData({ ...data, [field]: value });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)" }}>Promo Banner Settings</h1>
          <p style={{ color: "var(--gray-500)", marginTop: 4 }}>Customize the middle promotional banner on the homepage.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-red" style={{ padding: "12px 24px" }}>
          <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ background: "white", padding: 32, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--gray-100)" }}>
          <input type="checkbox" checked={data.enabled} onChange={(e) => updateField("enabled", e.target.checked)} style={{ width: 20, height: 20, cursor: "pointer", accentColor: "var(--red)" }} />
          <label style={{ fontSize: 16, fontWeight: 700 }}>Enable Promo Banner on Homepage</label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label className="label">Background Style (CSS)</label>
            <input type="text" className="input" value={data.bgStyle} onChange={(e) => updateField("bgStyle", e.target.value)} />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input type="text" className="input" value={data.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} />
          </div>

          <div>
            <label className="label">Badge 1 Text</label>
            <input type="text" className="input" value={data.badge1} onChange={(e) => updateField("badge1", e.target.value)} />
          </div>
          <div>
            <label className="label">Badge 2 Text</label>
            <input type="text" className="input" value={data.badge2} onChange={(e) => updateField("badge2", e.target.value)} />
          </div>

          <div>
            <label className="label">Title Part 1</label>
            <input type="text" className="input" value={data.title} onChange={(e) => updateField("title", e.target.value)} />
          </div>
          <div>
            <label className="label">Title Highlight (Yellow text)</label>
            <input type="text" className="input" value={data.titleHighlight} onChange={(e) => updateField("titleHighlight", e.target.value)} />
          </div>
          <div>
            <label className="label">Title Part 2</label>
            <input type="text" className="input" value={data.titleEnd} onChange={(e) => updateField("titleEnd", e.target.value)} />
          </div>
          <div />

          <div>
            <label className="label">Button Text</label>
            <input type="text" className="input" value={data.buttonText} onChange={(e) => updateField("buttonText", e.target.value)} />
          </div>
          <div>
            <label className="label">Button Link</label>
            <input type="text" className="input" value={data.buttonLink} onChange={(e) => updateField("buttonLink", e.target.value)} />
          </div>

          <div>
            <label className="label">Button Background Color</label>
            <input type="text" className="input" value={data.buttonBg} onChange={(e) => updateField("buttonBg", e.target.value)} />
          </div>
          <div>
            <label className="label">Button Text Color</label>
            <input type="text" className="input" value={data.buttonTextCol} onChange={(e) => updateField("buttonTextCol", e.target.value)} />
          </div>

          <div>
            <label className="label">Bullet Point 1</label>
            <input type="text" className="input" value={data.bullet1} onChange={(e) => updateField("bullet1", e.target.value)} />
          </div>
          <div>
            <label className="label">Bullet Point 2</label>
            <input type="text" className="input" value={data.bullet2} onChange={(e) => updateField("bullet2", e.target.value)} />
          </div>
          <div>
            <label className="label">Bullet Point 3</label>
            <input type="text" className="input" value={data.bullet3} onChange={(e) => updateField("bullet3", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
