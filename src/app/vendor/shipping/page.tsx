"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Truck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorShippingPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [storeId, setStoreId] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    base_fee: 0,
    per_km_fee: 0,
    free_delivery_threshold: 0,
    estimated_days: "2-3",
    is_active: true
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.store?.id) {
          setStoreId(user.store.id);
          fetchRules(user.store.id);
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

  const fetchRules = async (sId: string) => {
    setLoading(true);
    const res = await fetch(`/api/vendor/shipping?store_id=${sId}`);
    if (res.ok) setRules(await res.json());
    setLoading(false);
  };

  const openModal = (rule: any = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        city: rule.city,
        base_fee: rule.base_fee,
        per_km_fee: rule.per_km_fee || 0,
        free_delivery_threshold: rule.free_delivery_threshold,
        estimated_days: rule.estimated_days,
        is_active: rule.is_active
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: "",
        city: "",
        base_fee: 0,
        per_km_fee: 0,
        free_delivery_threshold: 0,
        estimated_days: "2-3",
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
    const method = editingRule ? "PUT" : "POST";
    if (editingRule) (payload as any).id = editingRule.id;

    const res = await fetch("/api/vendor/shipping", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(editingRule ? "Rule updated" : "Rule created", "success");
      setIsModalOpen(false);
      fetchRules(storeId);
    } else {
      showToast("Failed to save rule", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!storeId) return;
    if (confirm("Are you sure you want to delete this shipping rule?")) {
      const res = await fetch(`/api/vendor/shipping?id=${id}&store_id=${storeId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Rule deleted", "success");
        setRules(rules.filter(r => r.id !== id));
      } else {
        showToast("Failed to delete", "error");
      }
    }
  };

  const toggleStatus = async (rule: any) => {
    if (!storeId) return;
    const res = await fetch("/api/vendor/shipping", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rule, store_id: storeId, is_active: !rule.is_active })
    });
    if (res.ok) {
      showToast("Status updated", "success");
      setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
    }
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Shipping Settings</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage delivery zones and rates for your store</p>
        </div>
        <button onClick={() => openModal()} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-900)", color: "white", padding: "10px 16px", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={16} /> Add Rule
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Rule Name</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>City / Zone</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Base Fee</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Free After</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center" }}>Loading rules...</td></tr>
            ) : rules.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center" }}>
                  <Truck size={48} style={{ color: "var(--gray-300)", margin: "0 auto 16px" }} />
                  <div style={{ fontWeight: 600, color: "var(--gray-900)", marginBottom: 8 }}>No shipping rules found</div>
                  <div style={{ color: "var(--gray-500)", fontSize: 14 }}>Create rules to offer delivery options to your customers.</div>
                </td>
              </tr>
            ) : rules.map(rule => (
              <tr key={rule.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "16px 24px", fontWeight: 600 }}>{rule.name}</td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "inline-block", background: "var(--gray-100)", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                    {rule.city}
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontWeight: 700, color: "var(--red)" }}>Rs. {rule.base_fee}</td>
                <td style={{ padding: "16px 24px" }}>
                  {rule.free_delivery_threshold > 0 ? (
                    <span style={{ color: "var(--green)", fontWeight: 600 }}>Rs. {rule.free_delivery_threshold}</span>
                  ) : "-"}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <label style={{ position: "relative", display: "inline-block", width: 40, height: 24 }}>
                    <input type="checkbox" checked={rule.is_active} onChange={() => toggleStatus(rule)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: rule.is_active ? "var(--gray-900)" : "var(--gray-300)", transition: ".4s", borderRadius: 24 }}>
                      <span style={{ position: "absolute", content: '""', height: 16, width: 16, left: 4, bottom: 4, backgroundColor: "white", transition: ".4s", borderRadius: "50%", transform: rule.is_active ? "translateX(16px)" : "none" }}></span>
                    </span>
                  </label>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => openModal(rule)} style={{ padding: 8, background: "var(--gray-100)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(rule.id)} style={{ padding: 8, background: "#fee2e2", color: "var(--red)", border: "none", borderRadius: 8, cursor: "pointer" }}>
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
          <div style={{ background: "white", padding: 32, borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>{editingRule ? "Edit Shipping Rule" : "Add Shipping Rule"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Rule Name</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} placeholder="e.g. Standard Local" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Target City / Zone</label>
                  <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} placeholder="e.g. Karachi or All Pakistan" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Base Fee (Rs)</label>
                  <input required type="number" min="0" value={formData.base_fee} onChange={e => setFormData({ ...formData, base_fee: Number(e.target.value) })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Free Delivery Above (Rs)</label>
                  <input required type="number" min="0" value={formData.free_delivery_threshold} onChange={e => setFormData({ ...formData, free_delivery_threshold: Number(e.target.value) })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} placeholder="Set 0 for no free delivery" />
                  <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Set 0 for no free delivery threshold</p>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Estimated Delivery Time</label>
                <input required value={formData.estimated_days} onChange={e => setFormData({ ...formData, estimated_days: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} placeholder="e.g. 2-3 Days" />
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Enable this shipping rule</label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "10px 16px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 16px", background: "var(--gray-900)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>{editingRule ? "Save Changes" : "Create Rule"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
