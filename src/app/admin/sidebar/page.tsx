"use client";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Search, Edit, X, Save, Eye } from "lucide-react";


function DynamicIcon({ name, size = 20, color }: { name: string, size?: number, color?: string }) {
  const Icon = (Icons as any)[name] || Icons.Package;
  return <Icon size={size} color={color} />;
}

const POPULAR_ICONS = [
  "Headphones", "Wind", "Fan", "Laptop", "Smartphone", "Cpu", 
  "Music", "Watch", "Camera", "Zap", "Monitor", "Speaker", 
  "Mouse", "Keyboard", "Tv", "Mic", "Printer", "Gamepad",
  "Battery", "Bluetooth", "Wifi", "Usb", "Power", "Radio",
  "Server", "Tablet", "Video", "Clock", "Heart", "Star",
  "Package", "Gift", "ShoppingBag", "ShoppingCart", "Tag"
];

export default function AdminSidebarPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
    setLoading(false);
  };

  const toggleInSidebar = async (id: string, current: boolean) => {
    const newVal = !current;
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_in_sidebar: newVal })
    });
    if (res.ok) {
      setCategories(categories.map(c => c.id === id ? { ...c, is_in_sidebar: newVal } : c));
    }
  };

  const handleSaveSidebarData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    
    // Convert comma-separated string back to JSON array if user typed it
    let popularItemsArr = editingCat.sidebar_popular_items;
    if (typeof popularItemsArr === 'string') {
      popularItemsArr = popularItemsArr.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }

    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingCat.id,
        sidebar_icon: editingCat.sidebar_icon,
        sidebar_desc: editingCat.sidebar_desc,
        image: editingCat.image,
        sidebar_popular_items: popularItemsArr
      })
    });

    if (!res.ok) {
      const data = await res.json();
      alert("Error updating category: " + data.error);
    } else {
      setCategories(categories.map(c => c.id === editingCat.id ? { ...editingCat, sidebar_popular_items: popularItemsArr } : c));
      setEditingCat(null);
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Homepage Sidebar</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage the 'All Categories' sidebar on the homepage</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Category Name</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Show in Sidebar?</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Icon Name</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading categories...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No categories found.</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              >
                <td style={{ padding: "16px 24px", fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>
                  {c.name}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <input type="checkbox" className="sr-only" checked={c.is_in_sidebar} onChange={() => toggleInSidebar(c.id, c.is_in_sidebar)} style={{ opacity: 0, width: 0, height: 0 }} />
                      <div style={{ width: 44, height: 24, background: c.is_in_sidebar ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                      <div style={{ position: "absolute", top: 2, left: c.is_in_sidebar ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                    </div>
                  </label>
                </td>
                <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--gray-500)", fontFamily: "monospace" }}>
                  {c.sidebar_icon || "-"}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <button onClick={() => setEditingCat({ ...c, sidebar_popular_items: Array.isArray(c.sidebar_popular_items) ? c.sidebar_popular_items.join(", ") : "" })} className="btn-outline-red" style={{ padding: "6px 12px", fontSize: 12 }}>
                    <Edit size={14} style={{ marginRight: 4 }} /> Edit Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCat && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="animate-scale-in" style={{ background: "white", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 600, boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Edit Sidebar Info: {editingCat.name}</h3>
              <button onClick={() => setEditingCat(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSidebarData} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>
                  Icon <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(Selected: {editingCat.sidebar_icon || "None"})</span>
                </label>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", 
                  gap: 8, 
                  maxHeight: 160, 
                  overflowY: "auto", 
                  padding: 8, 
                  background: "var(--gray-50)", 
                  border: "1px solid var(--gray-200)", 
                  borderRadius: "var(--radius)" 
                }}>
                  {POPULAR_ICONS.map(iconName => {
                    const isSelected = editingCat.sidebar_icon === iconName;
                    return (
                      <div 
                        key={iconName}
                        onClick={() => setEditingCat({...editingCat, sidebar_icon: iconName})}
                        title={iconName}
                        style={{
                          width: "100%", aspectRatio: "1",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isSelected ? "#fff0f0" : "white",
                          border: `1px solid ${isSelected ? "var(--red)" : "var(--gray-200)"}`,
                          borderRadius: 6, cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        <DynamicIcon name={iconName} size={20} color={isSelected ? "var(--red)" : "var(--gray-600)"} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>
                  Flyout Description
                </label>
                <input 
                  className="input" 
                  value={editingCat.sidebar_desc || ""} 
                  onChange={e => setEditingCat({...editingCat, sidebar_desc: e.target.value})}
                  placeholder="e.g. Wireless neckband earphones with super bass"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Flyout Banner Image URL</label>
                <input 
                  type="text" 
                  value={editingCat.image || ""} 
                  onChange={e => setEditingCat({...editingCat, image: e.target.value})}
                  placeholder="https://..."
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid var(--gray-200)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>
                  Popular Items (Comma separated)
                </label>
                <input 
                  className="input" 
                  value={editingCat.sidebar_popular_items || ""} 
                  onChange={e => setEditingCat({...editingCat, sidebar_popular_items: e.target.value})}
                  placeholder="Item 1, Item 2, Item 3"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setEditingCat(null)} className="btn-ghost" style={{ border: "1px solid var(--gray-200)" }}>Cancel</button>
                <button type="submit" className="btn-red" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
