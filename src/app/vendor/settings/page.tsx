"use client";
import { useState, useEffect } from "react";
import { Save, Loader2, Image as ImageIcon, User, Store, Mail, Lock, Phone, MapPin, Building, ShieldCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [storeId, setStoreId] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    logo: "",
    banner: "",
    description: "",
    // Owner profile fields
    owner_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    // SMTP fields
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
    try {
      const res = await fetch(`/api/vendor/settings?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          id: data.id,
          name: data.name || "",
          slug: data.slug || "",
          logo: data.logo || "",
          banner: data.banner || "",
          description: data.description || "",
          // Owner profile
          owner_name: data.owner?.name || "",
          email: data.owner?.email || "",
          phone: data.owner?.phone || "",
          address: data.owner?.address || "",
          city: data.owner?.city || "",
          // SMTP
          smtp_host: data.smtp_host || "",
          smtp_port: data.smtp_port ? String(data.smtp_port) : "",
          smtp_user: data.smtp_user || "",
          smtp_pass: data.smtp_pass || "",
          smtp_from: data.smtp_from || ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setFetching(false);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        setFormData(prev => ({ ...prev, logo: url }));
        showToast("Logo uploaded successfully", "success");
      } else {
        showToast("Logo upload failed", "error");
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        setFormData(prev => ({ ...prev, banner: url }));
        showToast("Banner uploaded successfully", "success");
      } else {
        showToast("Banner upload failed", "error");
      }
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
        const updated = await res.json();
        showToast("Profile & Store Settings saved successfully!", "success");

        // Update active session in localStorage
        const sessionStr = localStorage.getItem("customer_session");
        if (sessionStr) {
          try {
            const user = JSON.parse(sessionStr);
            user.name = formData.owner_name || user.name;
            user.phone = formData.phone || user.phone;
            user.address = formData.address || user.address;
            user.city = formData.city || user.city;
            if (user.store) {
              user.store.name = formData.name || user.store.name;
              user.store.logo = formData.logo || user.store.logo;
              user.store.banner = formData.banner || user.store.banner;
              user.store.description = formData.description || user.store.description;
            }
            localStorage.setItem("customer_session", JSON.stringify(user));
          } catch (e) {}
        }
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (err) {
      showToast("Error saving settings", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: 40, color: "var(--gray-500)" }}>Loading vendor profile & settings...</div>;
  if (!storeId) return <div style={{ padding: 40 }}>Store ID not found. Please log in properly.</div>;

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", margin: 0, letterSpacing: "-0.5px" }}>
          Vendor Profile & Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 6, margin: 0 }}>
          Keep your contact information, store details, and email notification preferences up to date.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        
        {/* ── CARD 1: VENDOR OWNER PROFILE & CONTACT ── */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", padding: 28, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--gray-100)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", margin: 0 }}>Vendor Owner & Contact Information</h2>
              <p style={{ fontSize: 13, color: "var(--gray-500)", margin: 0, marginTop: 2 }}>
                Used for account verification, delivery rider pickup coordination, and admin communications.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Owner Full Name */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                Owner Full Name <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Muhammad Ali"
                value={formData.owner_name}
                onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Contact Phone Number */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                Contact Phone Number <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="var(--gray-400)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  required
                  type="text"
                  placeholder="e.g. 03001234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px 12px 38px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <span style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4, display: "block" }}>Used by delivery riders when collecting dispatched orders</span>
            </div>

            {/* City */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                City / Region
              </label>
              <div style={{ position: "relative" }}>
                <Building size={16} color="var(--gray-400)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="e.g. Karachi, Lahore, Islamabad"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px 12px 38px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Login Email (READ-ONLY) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                  Login Email Address
                </label>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                  <Lock size={12} /> Admin Controlled
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--gray-400)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  disabled
                  readOnly
                  type="email"
                  value={formData.email}
                  style={{ width: "100%", padding: "12px 14px 12px 38px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, background: "#f8fafc", color: "var(--gray-600)", cursor: "not-allowed", boxSizing: "border-box" }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#92400e", marginTop: 4, display: "block", lineHeight: 1.4 }}>
                🔒 Login Email & Password can only be changed by Admin. Contact Dastiyab Store Admin if you need to update credentials.
              </span>
            </div>

            {/* Complete Business / Pickup Address */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                Complete Business / Pickup Address <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <MapPin size={16} color="var(--gray-400)" style={{ position: "absolute", left: 14, top: 16 }} />
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Shop # 24, 2nd Floor, ABC Plaza, Saddar, Karachi"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px 12px 38px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
              <span style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4, display: "block" }}>
                Accurate address is required for dispatch riders to collect packed orders from your location.
              </span>
            </div>
          </div>
        </div>

        {/* ── CARD 2: STORE DETAILS & BRANDING ── */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", padding: 28, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--gray-100)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Store size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", margin: 0 }}>Store Information & Branding</h2>
              <p style={{ fontSize: 13, color: "var(--gray-500)", margin: 0, marginTop: 2 }}>
                Display information shown to customers on Dastiyab Store product pages and invoices.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                  Store Name <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                  Store URL Path
                </label>
                <input
                  disabled
                  readOnly
                  type="text"
                  value={`/shop/${formData.slug}`}
                  style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 13, background: "#f8fafc", color: "var(--gray-500)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>
                Store Description / About
              </label>
              <textarea
                rows={3}
                placeholder="Tell customers about your brand, specialty, and products..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
              />
            </div>

            {/* Logo and Banner Uploads */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 8 }}>
              {/* Logo */}
              <div style={{ background: "var(--gray-50)", padding: 20, borderRadius: 14, border: "1.5px dashed var(--gray-300)", textAlign: "center" }}>
                <label style={{ display: "block", marginBottom: 12, fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>Store Logo</label>
                {formData.logo ? (
                  <div style={{ marginBottom: 12 }}>
                    <img src={formData.logo} alt="Store Logo" style={{ width: 88, height: 88, objectFit: "contain", borderRadius: 12, background: "white", border: "1px solid var(--gray-200)", margin: "0 auto", display: "block" }} />
                  </div>
                ) : (
                  <div style={{ width: 88, height: 88, borderRadius: 12, background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--gray-400)" }}>
                    <ImageIcon size={32} />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ width: "100%", fontSize: 12 }} />
                <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 8, margin: 0 }}>Recommended: Square PNG/JPG (200x200px)</p>
              </div>

              {/* Banner */}
              <div style={{ background: "var(--gray-50)", padding: 20, borderRadius: 14, border: "1.5px dashed var(--gray-300)", textAlign: "center" }}>
                <label style={{ display: "block", marginBottom: 12, fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>Store Banner</label>
                {formData.banner ? (
                  <div style={{ marginBottom: 12 }}>
                    <img src={formData.banner} alt="Store Banner" style={{ width: "100%", height: 88, objectFit: "cover", borderRadius: 12, background: "white", border: "1px solid var(--gray-200)" }} />
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 88, borderRadius: 12, background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--gray-400)" }}>
                    <ImageIcon size={32} />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ width: "100%", fontSize: 12 }} />
                <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 8, margin: 0 }}>Recommended: 1200x400px header banner</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: EMAIL NOTIFICATION SETTINGS (SMTP) ── */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", padding: 28, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--gray-100)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", margin: 0 }}>Email Notification Settings (SMTP)</h2>
              <p style={{ fontSize: 13, color: "var(--gray-500)", margin: 0, marginTop: 2 }}>
                Connect your SMTP mail server to receive instant customer order alerts and customer invoices directly in your inbox.
              </p>
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
              <ShieldCheck size={16} color="#16a34a" /> Why set up SMTP?
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 0 0", lineHeight: 1.5 }}>
              Whenever a customer buys an item from your store, our platform automatically triggers an email receipt and order notification directly to your configured email address.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>SMTP Host</label>
              <input
                type="text"
                placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                value={formData.smtp_host}
                onChange={e => setFormData({ ...formData, smtp_host: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>SMTP Port</label>
              <input
                type="number"
                placeholder="e.g. 465 (SSL) or 587 (TLS)"
                value={formData.smtp_port}
                onChange={e => setFormData({ ...formData, smtp_port: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>SMTP Username (Email)</label>
              <input
                type="email"
                placeholder="e.g. yourstore@gmail.com"
                value={formData.smtp_user}
                onChange={e => setFormData({ ...formData, smtp_user: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>SMTP Password / App Password</label>
              <input
                type="password"
                placeholder="App password or email password"
                value={formData.smtp_pass}
                onChange={e => setFormData({ ...formData, smtp_pass: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13, color: "var(--gray-700)" }}>From Email Address (Sender Display)</label>
              <input
                type="email"
                placeholder="e.g. orders@yourstore.com"
                value={formData.smtp_from}
                onChange={e => setFormData({ ...formData, smtp_from: e.target.value })}
                style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
          <button
            disabled={loading}
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--red)",
              color: "white",
              padding: "14px 32px",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: 15,
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
              transition: "all 0.2s"
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? "Saving Profile..." : "Save Profile & Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
