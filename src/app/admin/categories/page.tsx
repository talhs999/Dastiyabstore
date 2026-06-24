"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import IconPicker from "@/components/admin/IconPicker";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // Fetch categories and get the count of products in each category
    const { data: catData } = await supabase.from("categories").select("*, products(id)").order("created_at", { ascending: true });
    if (catData) {
      setCategories(catData.map((c: any) => ({
        ...c,
        productCount: c.products ? c.products.length : 0
      })));
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    const name = prompt("Enter new category name:");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data, error } = await supabase.from("categories").insert([{ name, slug }]).select().single();
    if (error) {
      alert("Error adding category: " + error.message);
    } else if (data) {
      setCategories([...categories, { ...data, productCount: 0 }]);
    }
  };

  const handleEditCategory = async (id: string, oldName: string) => {
    const name = prompt("Enter new category name:", oldName);
    if (!name || name === oldName) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("categories").update({ name, slug }).eq("id", id);
    if (error) {
      alert("Error updating category: " + error.message);
    } else {
      setCategories(categories.map(c => c.id === id ? { ...c, name, slug } : c));
    }
  };

  const handleDeleteCategory = async (id: string, count: number) => {
    if (count > 0) {
      alert("Cannot delete category with products. Please reassign or delete the products first.");
      return;
    }
    if (confirm("Are you sure you want to delete this category?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        alert("Error deleting category: " + error.message);
      } else {
        setCategories(categories.filter(c => c.id !== id));
      }
    }
  };

  const toggleInHeader = async (id: string, current: boolean) => {
    const newVal = !current;
    const { error } = await supabase.from("categories").update({ is_in_header: newVal }).eq("id", id);
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, is_in_header: newVal } : c));
    }
  };

  const updateBadge = async (id: string, badge: string) => {
    const { error } = await supabase.from("categories").update({ header_badge: badge || null }).eq("id", id);
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, header_badge: badge } : c));
    }
  };

  const updateIcon = async (id: string, icon: string) => {
    const { error } = await supabase.from("categories").update({ icon: icon || "Package" }).eq("id", id);
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, icon: icon || "Package" } : c));
    } else {
      alert("Error updating icon: " + error.message);
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Categories</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage your product categories</p>
        </div>
        <button onClick={handleAddCategory} className="btn-gray" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-900)", color: "white", padding: "10px 16px", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={16} /> Add New Category
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Category Name</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Slug</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Icon (Lucide)</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Products</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Show in Header?</th>
              <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>Header Badge</th>
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
                <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--gray-500)" }}>
                  {c.slug}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <IconPicker 
                    value={c.icon || "Package"} 
                    onChange={(newIcon) => {
                      if (newIcon !== (c.icon || "Package")) {
                        updateIcon(c.id, newIcon);
                      }
                    }} 
                  />
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-700)", fontWeight: 600 }}>
                  {c.productCount} Products
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <input type="checkbox" className="sr-only" checked={c.is_in_header} onChange={() => toggleInHeader(c.id, c.is_in_header)} style={{ opacity: 0, width: 0, height: 0 }} />
                      <div style={{ width: 44, height: 24, background: c.is_in_header ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                      <div style={{ position: "absolute", top: 2, left: c.is_in_header ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                    </div>
                  </label>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <input 
                    type="text" 
                    defaultValue={c.header_badge || ""}
                    placeholder="e.g. HOT"
                    onBlur={(e) => {
                      if (e.target.value !== (c.header_badge || "")) {
                        updateBadge(c.id, e.target.value);
                      }
                    }}
                    style={{ padding: "6px 12px", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", fontSize: 12, width: 90 }}
                  />
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEditCategory(c.id, c.name)} style={{ width: 32, height: 32, borderRadius: 8, background: "white", border: "1px solid var(--gray-200)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-900)", transition: "all 0.2s" }} title="Edit">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDeleteCategory(c.id, c.productCount)} style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", transition: "all 0.2s" }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
