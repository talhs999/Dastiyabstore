"use client";
import { useState, useEffect } from "react";
import { Save, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [storeId, setStoreId] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    logo: "",
    banner: "",
    description: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: ""
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.store?.id) {
          setStoreId(user.store.id);
          fetchSettings(user.store.id);
        } else {
          setFetching(false);
        }
      } catch (e) {
        setFetching(false);
      }
    } else {
      setFetching(false);
    }
  }, []);

  const fetchSettings = async (id: string) => {
    const res = await fetch(`/api/vendor/settings?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      setFormData({
        id: data.id,
        name: data.name || "",
        logo: data.logo || "",
        banner: data.banner || "",
        description: data.description || "",
        smtp_host: data.smtp_host || "",
        smtp_port: data.smtp_port || "",
        smtp_user: data.smtp_user || "",
        smtp_pass: data.smtp_pass || "",
        smtp_from: data.smtp_from || ""
      });
    }
    setFetching(false);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) setFormData({ ...formData, logo: url });
      else showToast("Logo upload failed", "error");
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) setFormData({ ...formData, banner: url });
      else showToast("Banner upload failed", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast("Settings saved successfully", "success");
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (err) {
      showToast("Error saving settings", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: 40 }}>Loading settings...</div>;
  if (!storeId) return <div style={{ padding: 40 }}>Store ID not found. Please log in properly.</div>;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 24 }}>Store Settings</h1>

      <form onSubmit={handleSubmit} style={{ background: "white", padding: 30, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", maxWidth: 800 }}>
        
        <div style={{ display: "grid", gap: 24 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Store Name</label>
            <input required className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Store Description</label>
            <textarea className="input" rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} placeholder="Tell customers about your store..." />
          </div>

          <div style={{ background: "var(--gray-50)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Email Notification Settings (SMTP)</h3>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: -12 }}>Configure your own SMTP server to receive order notifications directly to your email.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>SMTP Host</label>
                <input className="input" type="text" value={formData.smtp_host} onChange={e => setFormData({ ...formData, smtp_host: e.target.value })} placeholder="e.g. smtp.gmail.com" style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>SMTP Port</label>
                <input className="input" type="number" value={formData.smtp_port} onChange={e => setFormData({ ...formData, smtp_port: e.target.value })} placeholder="e.g. 587 or 465" style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>SMTP Username (Email)</label>
                <input className="input" type="email" value={formData.smtp_user} onChange={e => setFormData({ ...formData, smtp_user: e.target.value })} placeholder="e.g. yourstore@gmail.com" style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>SMTP Password</label>
                <input className="input" type="password" value={formData.smtp_pass} onChange={e => setFormData({ ...formData, smtp_pass: e.target.value })} placeholder="App password or email password" style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>From Email Address</label>
                <input className="input" type="email" value={formData.smtp_from} onChange={e => setFormData({ ...formData, smtp_from: e.target.value })} placeholder="e.g. sales@yourstore.com" style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "var(--gray-50)", padding: 20, borderRadius: 12, border: "1px dashed var(--gray-300)", textAlign: "center" }}>
              <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>Store Logo</label>
              {formData.logo ? (
                <div style={{ marginBottom: 12 }}>
                  <img src={formData.logo} alt="Logo" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, background: "white", border: "1px solid var(--gray-200)" }} />
                </div>
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--gray-400)" }}>
                  <ImageIcon size={32} />
                </div>
              )}
              <input type="file" onChange={handleLogoUpload} style={{ width: "100%", fontSize: 12 }} />
              <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 8 }}>This logo will appear on your store page and invoices.</p>
            </div>

            <div style={{ background: "var(--gray-50)", padding: 20, borderRadius: 12, border: "1px dashed var(--gray-300)", textAlign: "center" }}>
              <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>Store Banner</label>
              {formData.banner ? (
                <div style={{ marginBottom: 12 }}>
                  <img src={formData.banner} alt="Banner" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, background: "white", border: "1px solid var(--gray-200)" }} />
                </div>
              ) : (
                <div style={{ width: "100%", height: 80, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--gray-400)" }}>
                  <ImageIcon size={32} />
                </div>
              )}
              <input type="file" onChange={handleBannerUpload} style={{ width: "100%", fontSize: 12 }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
          <button disabled={loading} type="submit" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-900)", color: "white", padding: "12px 24px", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 700 }}>
            {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
