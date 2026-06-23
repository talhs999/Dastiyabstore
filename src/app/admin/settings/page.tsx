"use client";
import { useState } from "react";
import { Store, Truck, Tag, CreditCard, Mail, Bell, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    { label: "General", icon: <Store size={18} /> },
    { label: "Shipping & Delivery", icon: <Truck size={18} /> },
    { label: "Coupons & Discounts", icon: <Tag size={18} /> },
    { label: "Payments", icon: <CreditCard size={18} /> },
    { label: "Emails & Marketing", icon: <Mail size={18} /> },
    { label: "Notifications", icon: <Bell size={18} /> },
    { label: "Security", icon: <Shield size={18} /> },
  ];

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
          {activeTab === "General" ? (
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
          ) : (
            <div style={{ padding: 60, textAlign: "center", color: "var(--gray-500)" }}>
              <p>Settings for <strong>{activeTab}</strong> will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
