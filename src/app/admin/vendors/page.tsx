"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Store } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    store_name: "",
    owner_name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/vendors");
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      showToast("Vendor created successfully", "success");
      setIsModalOpen(false);
      setFormData({ store_name: "", owner_name: "", email: "", password: "" });
      fetchVendors();
    } else {
      showToast("Failed to create vendor", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor and all their data?")) {
      await fetch(`/api/admin/vendors?id=${id}`, { method: "DELETE" });
      setVendors(vendors.filter(v => v.id !== id));
      showToast("Vendor deleted", "success");
    }
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Vendors</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage multi-vendor store accounts</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-gray" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-900)", color: "white", padding: "10px 16px", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={16} /> Add New Vendor
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Store</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Owner / Email</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Products</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Orders</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>Loading vendors...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>No vendors found.</td></tr>
            ) : vendors.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 700 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)" }}>/{v.slug}</div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 600 }}>{v.owner?.name || "No Name"}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{v.owner?.email}</div>
                </td>
                <td style={{ padding: "16px 24px", fontWeight: 700 }}>{v._count?.products || 0}</td>
                <td style={{ padding: "16px 24px", fontWeight: 700 }}>{v._count?.orders || 0}</td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={`/admin/vendors/${v.id}`} style={{ padding: "6px 12px", background: "var(--gray-100)", color: "var(--gray-900)", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                      View Details
                    </a>
                    <button onClick={() => handleDelete(v.id)} style={{ padding: "6px 8px", background: "#fee2e2", color: "var(--red)", border: "none", borderRadius: 8, cursor: "pointer" }}>
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
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Add New Vendor</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Store Name</label>
                <input required className="input" value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Owner Name</label>
                <input required className="input" value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Login Email</label>
                <input required type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Login Password</label>
                <input required type="password" className="input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ width: "100%", padding: 12, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "10px 16px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 16px", background: "var(--gray-900)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Create Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
