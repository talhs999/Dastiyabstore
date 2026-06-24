"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Store, Truck, Tag, CreditCard, Mail, Bell, Shield, Plus, Edit2, Trash2, X, AlertCircle, MapPin } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  
  // Shipping states
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    city: "",
    base_fee: 150,
    per_km_fee: 0,
    free_delivery_threshold: 2000,
    free_delivery_km: "",
    free_areas: "",
    estimated_days: "2-3 Business Days",
    is_active: true
  });

  // Delivery Areas states
  const [deliveryAreas, setDeliveryAreas] = useState<any[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [editingArea, setEditingArea] = useState<any | null>(null);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [areaForm, setAreaForm] = useState({
    name: "",
    distance: 0,
    is_active: true
  });

  const tabs = [
    { label: "General", icon: <Store size={18} /> },
    { label: "Shipping & Delivery", icon: <Truck size={18} /> },
    { label: "Delivery Areas", icon: <MapPin size={18} /> },
    { label: "Coupons & Discounts", icon: <Tag size={18} /> },
    { label: "Payments", icon: <CreditCard size={18} /> },
    { label: "Emails & Marketing", icon: <Mail size={18} /> },
    { label: "Notifications", icon: <Bell size={18} /> },
    { label: "Security", icon: <Shield size={18} /> },
  ];

  useEffect(() => {
    if (activeTab === "Shipping & Delivery") {
      fetchShippingRules();
    } else if (activeTab === "Delivery Areas") {
      fetchDeliveryAreas();
    }
  }, [activeTab]);

  const fetchShippingRules = async () => {
    setLoadingRules(true);
    try {
      const { data, error } = await supabase
        .from("shipping_rules")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setShippingRules(data);
      } else {
        // Fallback static rules so admin is populated even if DB not yet migrated
        setShippingRules([
          { id: "1", name: "Karachi Local", city: "Karachi", base_fee: 150, per_km_fee: 15, free_delivery_threshold: 2000, free_delivery_km: 15, free_areas: "Clifton, DHA, Gulshan-e-Iqbal, PECHS, Bahadurabad", estimated_days: "1-2 Business Days", is_active: true },
          { id: "2", name: "Rest of Pakistan (Default)", city: "Default", base_fee: 250, per_km_fee: 0, free_delivery_threshold: 3000, free_delivery_km: null, free_areas: "", estimated_days: "3-5 Business Days", is_active: true }
        ]);
      }
    } catch (err) {
      console.error("Error loading rules:", err);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: ruleForm.name,
      city: ruleForm.city,
      base_fee: Number(ruleForm.base_fee),
      per_km_fee: Number(ruleForm.per_km_fee),
      free_delivery_threshold: Number(ruleForm.free_delivery_threshold),
      free_delivery_km: ruleForm.free_delivery_km ? Number(ruleForm.free_delivery_km) : null,
      free_areas: ruleForm.free_areas,
      estimated_days: ruleForm.estimated_days,
      is_active: ruleForm.is_active
    };

    if (editingRule) {
      // Update
      const { error } = await supabase
        .from("shipping_rules")
        .update(payload)
        .eq("id", editingRule.id);

      if (!error) {
        alert("Shipping rule updated successfully!");
        setEditingRule(null);
        fetchShippingRules();
      } else {
        alert("Failed to update: " + error.message);
      }
    } else {
      // Insert
      const { error } = await supabase
        .from("shipping_rules")
        .insert(payload);

      if (!error) {
        alert("Shipping rule created successfully!");
        setShowAddRuleModal(false);
        fetchShippingRules();
      } else {
        alert("Failed to insert: " + error.message);
      }
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping rule?")) return;
    const { error } = await supabase
      .from("shipping_rules")
      .delete()
      .eq("id", id);

    if (!error) {
      alert("Deleted rule.");
      fetchShippingRules();
    } else {
      alert("Failed to delete: " + error.message);
    }
  };

  const openAddModal = () => {
    setRuleForm({
      name: "",
      city: "",
      base_fee: 150,
      per_km_fee: 0,
      free_delivery_threshold: 2000,
      free_delivery_km: "",
      free_areas: "",
      estimated_days: "2-3 Business Days",
      is_active: true
    });
    setEditingRule(null);
    setShowAddRuleModal(true);
  };

  const openEditModal = (rule: any) => {
    setRuleForm({
      name: rule.name,
      city: rule.city,
      base_fee: rule.base_fee,
      per_km_fee: rule.per_km_fee,
      free_delivery_threshold: rule.free_delivery_threshold,
      free_delivery_km: rule.free_delivery_km !== null ? String(rule.free_delivery_km) : "",
      free_areas: rule.free_areas || "",
      estimated_days: rule.estimated_days,
      is_active: rule.is_active
    });
    setEditingRule(rule);
    setShowAddRuleModal(true);
  };

  const fetchDeliveryAreas = async () => {
    setLoadingAreas(true);
    try {
      const { data, error } = await supabase
        .from("delivery_areas")
        .select("*")
        .order("distance", { ascending: true });

      if (!error && data) {
        setDeliveryAreas(data);
      }
    } catch (err) {
      console.error("Error loading areas:", err);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: areaForm.name,
      distance: Number(areaForm.distance),
      is_active: areaForm.is_active
    };

    if (editingArea) {
      const { error } = await supabase.from("delivery_areas").update(payload).eq("id", editingArea.id);
      if (!error) {
        setEditingArea(null);
        setShowAddAreaModal(false);
        fetchDeliveryAreas();
      } else alert("Failed to update: " + error.message);
    } else {
      const { error } = await supabase.from("delivery_areas").insert(payload);
      if (!error) {
        setShowAddAreaModal(false);
        fetchDeliveryAreas();
      } else alert("Failed to insert: " + error.message);
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) return;
    const { error } = await supabase.from("delivery_areas").delete().eq("id", id);
    if (!error) {
      fetchDeliveryAreas();
    } else alert("Failed to delete: " + error.message);
  };

  const openAddAreaModal = () => {
    setAreaForm({ name: "", distance: 0, is_active: true });
    setEditingArea(null);
    setShowAddAreaModal(true);
  };

  const openEditAreaModal = (area: any) => {
    setAreaForm({ name: area.name, distance: area.distance, is_active: area.is_active });
    setEditingArea(area);
    setShowAddAreaModal(true);
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage your store preferences and integrations</p>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
        {/* Vertical Tabs */}
        <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.label} onClick={() => setActiveTab(t.label)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              background: activeTab === t.label ? "var(--gray-100)" : "transparent",
              color: activeTab === t.label ? "var(--gray-900)" : "var(--gray-600)",
              border: "none", borderRadius: "var(--radius)", cursor: "pointer",
              fontWeight: activeTab === t.label ? 700 : 500, fontSize: 14, textAlign: "left",
              transition: "all 0.2s"
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          
          {activeTab === "General" && (
            <div>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Store Details</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
                  <div>
                    <label className="label">Store Name</label>
                    <input className="input" defaultValue="DastiyabStore" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} />
                  </div>
                  <div>
                    <label className="label">Support Email</label>
                    <input className="input" defaultValue="support@dastiyabstore.com" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} />
                    <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 8 }}>This email will be used to send order confirmations and customer support replies.</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Store Currency</h2>
                <div style={{ marginTop: 24 }}>
                  <label className="label">Currency</label>
                  <select className="input" style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
                    <option>PKR (Rs) - Pakistani Rupee</option>
                    <option>USD ($) - US Dollar</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-red">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "Shipping & Delivery" && (
            <div>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Shipping Rules & Distance Fees</h2>
                  <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Configure base prices, per-kilometer charges, and free shipping conditions per region.</p>
                </div>
                <button onClick={openAddModal} className="btn-red" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}>
                  <Plus size={16} /> Add Shipping Rule
                </button>
              </div>

              <div style={{ padding: "24px 32px" }}>
                {loadingRules ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading rules...</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>RULE NAME</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>CITY</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>BASE FEE</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>PER KM</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>FREE THRESHOLD</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>FREE MAX KM</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>FREE AREAS</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shippingRules.map((rule) => (
                          <tr key={rule.id} style={{ borderBottom: "1px solid var(--gray-150)", background: rule.is_active ? "transparent" : "#f9fafb" }}>
                            <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--gray-900)" }}>
                              {rule.name}
                              {!rule.is_active && <span style={{ marginLeft: 6, fontSize: 10, background: "var(--gray-200)", padding: "2px 6px", borderRadius: 4, color: "var(--gray-600)" }}>INACTIVE</span>}
                            </td>
                            <td style={{ padding: "14px 16px", fontWeight: 600 }}>{rule.city}</td>
                            <td style={{ padding: "14px 16px" }}>Rs {rule.base_fee}</td>
                            <td style={{ padding: "14px 16px" }}>{rule.per_km_fee > 0 ? `Rs ${rule.per_km_fee}/km` : "-"}</td>
                            <td style={{ padding: "14px 16px" }}>Rs {rule.free_delivery_threshold}</td>
                            <td style={{ padding: "14px 16px" }}>{rule.free_delivery_km ? `${rule.free_delivery_km} km` : "No limit"}</td>
                            <td style={{ padding: "14px 16px", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={rule.free_areas}>{rule.free_areas || "None"}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => openEditModal(rule)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gray-600)" }}>
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteRule(rule.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--red)" }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Delivery Areas" && (
            <div>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Delivery Areas (Karachi)</h2>
                  <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Manage areas and their estimated distance from the Model Colony Hub.</p>
                </div>
                <button onClick={openAddAreaModal} className="btn-red" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}>
                  <Plus size={16} /> Add Area
                </button>
              </div>

              <div style={{ padding: "24px 32px" }}>
                {loadingAreas ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading areas...</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>AREA NAME</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>DISTANCE (KM)</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>STATUS</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveryAreas.map((area) => (
                          <tr key={area.id} style={{ borderBottom: "1px solid var(--gray-150)", background: area.is_active ? "transparent" : "#f9fafb" }}>
                            <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--gray-900)" }}>{area.name}</td>
                            <td style={{ padding: "14px 16px" }}>{area.distance} km</td>
                            <td style={{ padding: "14px 16px" }}>
                              {area.is_active ? (
                                <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Active</span>
                              ) : (
                                <span style={{ background: "#f3f4f6", color: "#4b5563", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Inactive</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => openEditAreaModal(area)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gray-600)" }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteArea(area.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--red)" }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== "General" && activeTab !== "Shipping & Delivery" && activeTab !== "Delivery Areas" && (
            <div style={{ padding: 60, textAlign: "center", color: "var(--gray-500)" }}>
              <p>Settings for <strong>{activeTab}</strong> will appear here.</p>
            </div>
          )}

        </div>

      </div>

      {/* Add/Edit Rule Modal */}
      {showAddRuleModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={() => setShowAddRuleModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div className="animate-scale-in" style={{
            position: "relative", width: "100%", maxWidth: 540, background: "white", borderRadius: 16,
            boxShadow: "var(--shadow-xl)", overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>
                {editingRule ? "Edit Shipping Rule" : "Add New Shipping Rule"}
              </h3>
              <button onClick={() => setShowAddRuleModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveRule}>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto" }}>
                
                <div>
                  <label className="label">Rule Name *</label>
                  <input className="input" required placeholder="e.g. Karachi Express Delivery" value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Target City *</label>
                    <input className="input" required placeholder="e.g. Karachi or Default" value={ruleForm.city} onChange={e => setRuleForm({ ...ruleForm, city: e.target.value })} />
                    <p style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 4 }}>Use "Default" to apply as general countrywide fallback.</p>
                  </div>
                  <div>
                    <label className="label">Estimated Delivery Days</label>
                    <input className="input" placeholder="e.g. 1-2 Business Days" value={ruleForm.estimated_days} onChange={e => setRuleForm({ ...ruleForm, estimated_days: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Base Delivery Fee (Rs) *</label>
                    <input className="input" type="number" required value={ruleForm.base_fee} onChange={e => setRuleForm({ ...ruleForm, base_fee: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="label">Per-Kilometer Fee (Rs)</label>
                    <input className="input" type="number" value={ruleForm.per_km_fee} onChange={e => setRuleForm({ ...ruleForm, per_km_fee: Number(e.target.value) })} />
                    <p style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 4 }}>Applies additionally for local distance shipments.</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Free Shipping Minimum Price (Rs) *</label>
                    <input className="input" type="number" required value={ruleForm.free_delivery_threshold} onChange={e => setRuleForm({ ...ruleForm, free_delivery_threshold: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="label">Free Shipping Max Distance (km)</label>
                    <input className="input" type="number" placeholder="e.g. 15 (Optional)" value={ruleForm.free_delivery_km} onChange={e => setRuleForm({ ...ruleForm, free_delivery_km: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="label">Free Shipping Locations (Clifton, DHA...)</label>
                  <textarea className="input" rows={2} placeholder="Comma-separated locations in city for free shipping, e.g. Clifton, DHA, PECHS" value={ruleForm.free_areas} onChange={e => setRuleForm({ ...ruleForm, free_areas: e.target.value })} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <input type="checkbox" id="rule-active" checked={ruleForm.is_active} onChange={e => setRuleForm({ ...ruleForm, is_active: e.target.checked })} style={{ cursor: "pointer", width: 16, height: 16 }} />
                  <label htmlFor="rule-active" style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-700)", cursor: "pointer" }}>Is Shipping Rule Active</label>
                </div>

              </div>

              <div style={{ padding: "16px 24px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--gray-200)" }}>
                <button type="button" onClick={() => setShowAddRuleModal(false)} className="btn-ghost" style={{ border: "1px solid var(--gray-300)" }}>Cancel</button>
                <button type="submit" className="btn-red">Save Shipping Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Area Modal */}
      {showAddAreaModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={() => setShowAddAreaModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div className="animate-scale-in" style={{
            position: "relative", width: "100%", maxWidth: 440, background: "white", borderRadius: 16,
            boxShadow: "var(--shadow-xl)", overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>
                {editingArea ? "Edit Delivery Area" : "Add New Delivery Area"}
              </h3>
              <button onClick={() => setShowAddAreaModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveArea}>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="label">Area Name *</label>
                  <input className="input" required placeholder="e.g. Gulshan-e-Iqbal" value={areaForm.name} onChange={e => setAreaForm({ ...areaForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Distance from Model Colony Hub (km) *</label>
                  <input className="input" type="number" required value={areaForm.distance} onChange={e => setAreaForm({ ...areaForm, distance: Number(e.target.value) })} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <input type="checkbox" id="area-active" checked={areaForm.is_active} onChange={e => setAreaForm({ ...areaForm, is_active: e.target.checked })} style={{ cursor: "pointer", width: 16, height: 16 }} />
                  <label htmlFor="area-active" style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-700)", cursor: "pointer" }}>Is Area Active</label>
                </div>
              </div>
              <div style={{ padding: "16px 24px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--gray-200)" }}>
                <button type="button" onClick={() => setShowAddAreaModal(false)} className="btn-ghost" style={{ border: "1px solid var(--gray-300)" }}>Cancel</button>
                <button type="submit" className="btn-red">Save Area</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
