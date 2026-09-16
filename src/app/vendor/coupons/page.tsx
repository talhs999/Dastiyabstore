"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [storeId, setStoreId] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    max_uses: 0,
    is_active: true
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.store?.id) {
          setStoreId(user.store.id);
          fetchCoupons(user.store.id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCoupons = async (sId: string) => {
    setLoading(true);
    const res = await fetch(`/api/vendor/coupons?store_id=${sId}`);
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  };

  const openModal = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_uses: coupon.max_uses || 0,
        is_active: coupon.is_active
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        max_uses: 0,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      showToast("Store ID missing", "error");
      return;
    }

    const payload = { ...formData, store_id: storeId };
    const method = editingCoupon ? "PUT" : "POST";
    if (editingCoupon) (payload as any).id = editingCoupon.id;

    const res = await fetch("/api/vendor/coupons", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(editingCoupon ? "Coupon updated" : "Coupon created", "success");
      setIsModalOpen(false);
      fetchCoupons(storeId);
    } else {
      const errorData = await res.json();
      showToast(errorData.error || "Failed to save coupon", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!storeId) return;
    if (confirm("Are you sure you want to delete this coupon?")) {
      const res = await fetch(`/api/vendor/coupons?id=${id}&store_id=${storeId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Coupon deleted", "success");
        setCoupons(coupons.filter(c => c.id !== id));
      } else {
        showToast("Failed to delete", "error");
      }
    }
  };

  const toggleStatus = async (coupon: any) => {
    if (!storeId) return;
    const res = await fetch("/api/vendor/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...coupon, store_id: storeId, is_active: !coupon.is_active })
    });
    if (res.ok) {
      showToast("Status updated", "success");
      setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Coupons & Discounts</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Create promotional codes for your store</p>
        </div>
        <button onClick={() => openModal()} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-900)", color: "white", padding: "10px 16px", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Coupon Code</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Discount</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Usage</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center" }}>
                  <Ticket size={48} style={{ color: "var(--gray-300)", margin: "0 auto 16px" }} />
                  <div style={{ fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>No coupons found</div>
                  <div style={{ color: "var(--gray-500)", fontSize: 14 }}>Create discount codes to attract more customers.</div>
                </td>
              </tr>
            ) : coupons.map(coupon => (
              <tr key={coupon.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "inline-block", background: "var(--red-light)", color: "var(--red)", padding: "4px 8px", borderRadius: 4, fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
                    {coupon.code}
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontWeight: 700 }}>
                  {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `Rs. ${coupon.discount_value} OFF`}
                </td>
                <td style={{ padding: "16px 24px", color: "var(--gray-500)", fontSize: 14 }}>
                  {coupon.used_count} / {coupon.max_uses > 0 ? coupon.max_uses : "∞"}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <label style={{ position: "relative", display: "inline-block", width: 40, height: 24 }}>
                    <input type="checkbox" checked={coupon.is_active} onChange={() => toggleStatus(coupon)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: coupon.is_active ? "var(--gray-900)" : "var(--gray-300)", transition: ".4s", borderRadius: 24 }}>
                      <span style={{ position: "absolute", content: '""', height: 16, width: 16, left: 4, bottom: 4, backgroundColor: "white", transition: ".4s", borderRadius: "50%", transform: coupon.is_active ? "translateX(16px)" : "none" }}></span>
                    </span>
                  </label>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => openModal(coupon)} style={{ padding: 8, background: "var(--gray-100)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} style={{ padding: 8, background: "#fee2e2", color: "var(--red)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 500 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Coupon Code</label>
                <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8, textTransform: "uppercase" }} placeholder="e.g. SUMMER20" />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Discount Type</label>
                  <select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Discount Value</label>
                  <input required type="number" min="0" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Maximum Uses (Optional)</label>
                <input type="number" min="0" value={formData.max_uses} onChange={e => setFormData({ ...formData, max_uses: Number(e.target.value) })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} placeholder="Leave 0 for unlimited" />
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Coupon is active</label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "10px 16px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 16px", background: "var(--gray-900)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>{editingCoupon ? "Save Changes" : "Create Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
