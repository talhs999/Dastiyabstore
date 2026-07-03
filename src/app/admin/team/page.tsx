"use client";
import { useEffect, useState } from "react";
import { Save, Plus, Trash2, User, GripVertical } from "lucide-react";

const DEFAULTS = [
  { name: "Yousuf Ahmed Khan", role: "Co-Founder & CEO", image: "" },
  { name: "Talha Khan", role: "Co-Founder & CTO", image: "" },
  { name: "Muddassir Rizwan", role: "Co-Founder & COO", image: "" },
];

export default function AdminTeamPage() {
  const [members, setMembers] = useState<any[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/team")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setMembers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateMember = (idx: number, field: string, value: string) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    setSaved(false);
  };

  const addMember = () => {
    setMembers(prev => [...prev, { name: "", role: "", image: "" }]);
    setSaved(false);
  };

  const removeMember = (idx: number) => {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(members),
      });
      if (res.ok) setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>Team Members</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 14, marginTop: 4 }}>Manage your "Meet the Team" section on the About page</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", border: "none", borderRadius: 8, background: saved ? "#16a34a" : "var(--gray-900)", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
          <Save size={16} /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {members.map((member, idx) => (
        <div key={idx} style={{ background: "white", borderRadius: 12, border: "1px solid var(--gray-200)", padding: 24, marginBottom: 16, display: "flex", gap: 20, alignItems: "flex-start" }}>
          
          {/* Avatar preview */}
          <div style={{ flexShrink: 0 }}>
            {member.image ? (
              <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--red)" }}>
                <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: ["#e91e63", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"][idx % 5], display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--red)" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: 28 }}>
                  {member.name ? member.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : <User size={28} />}
                </span>
              </div>
            )}
          </div>

          {/* Fields */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginBottom: 4, display: "block" }}>Full Name</label>
                <input value={member.name} onChange={e => updateMember(idx, "name", e.target.value)} placeholder="e.g. Yousuf Ahmed Khan" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginBottom: 4, display: "block" }}>Position / Role</label>
                <input value={member.role} onChange={e => updateMember(idx, "role", e.target.value)} placeholder="e.g. Co-Founder & CEO" style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginBottom: 4, display: "block" }}>Photo URL (optional — leave empty for initials avatar)</label>
              <input value={member.image || ""} onChange={e => updateMember(idx, "image", e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>

          {/* Delete button */}
          <button onClick={() => removeMember(idx)} disabled={members.length <= 1} title="Remove member" style={{ background: "none", border: "none", cursor: members.length <= 1 ? "not-allowed" : "pointer", color: members.length <= 1 ? "var(--gray-300)" : "var(--red)", padding: 8, borderRadius: 8, transition: "background 0.2s" }}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      {/* Add member button */}
      <button onClick={addMember} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", border: "2px dashed var(--gray-300)", borderRadius: 12, background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--gray-500)", transition: "all 0.2s" }}>
        <Plus size={18} /> Add Team Member
      </button>
    </div>
  );
}
