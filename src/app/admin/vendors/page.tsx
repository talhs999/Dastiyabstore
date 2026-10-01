"use client";
import { useState, useEffect } from "react";
import {
  Plus, Trash2, Store, Mail, Send, CheckCircle, AlertCircle,
  Clock, Shield, RefreshCw, CreditCard, Settings, MessageSquare,
  DollarSign, Calendar, ExternalLink, Edit2, Check, X, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AdminVendorsPage() {
  const [activeTab, setActiveTab] = useState<"vendors" | "rent">("vendors");
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const { showToast } = useToast();

  // Rent state
  const [rentData, setRentData] = useState<{
    settings: any;
    stores: any[];
    allPayments: any[];
    totalCollected: number;
    totalDueCount: number;
  }>({
    settings: {
      default_rent: 5000,
      bank_name: "Easypaisa",
      account_title: "Amir khan",
      account_number: "03162975195",
      instructions: "Deposit online or via JazzCash/Easypaisa and share the screenshot with Admin."
    },
    stores: [],
    allPayments: [],
    totalCollected: 0,
    totalDueCount: 0
  });
  const [loadingRent, setLoadingRent] = useState(false);
  const [isRentSettingsModalOpen, setIsRentSettingsModalOpen] = useState(false);
  const [savingRentSettings, setSavingRentSettings] = useState(false);
  const [rentSettingsForm, setRentSettingsForm] = useState({
    default_rent: 5000,
    bank_name: "",
    account_title: "",
    account_number: "",
    instructions: ""
  });

  // Custom rent edit per vendor
  const [editingRentVendorId, setEditingRentVendorId] = useState<string | null>(null);
  const [customRentInput, setCustomRentInput] = useState<number>(5000);
  const [sendingRentVendorId, setSendingRentVendorId] = useState<string | null>(null);

  // Rent Payment Recording State (Date & Calendar)
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    vendorId: "",
    amount: 5000,
    paymentDate: new Date().toISOString().split("T")[0],
    monthCycle: "Month 1",
    paymentMethod: "Easypaisa",
    transactionRef: "",
    notes: "",
    sendReceiptEmail: true
  });
  const [historyStoreFilter, setHistoryStoreFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    store_name: "",
    owner_name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchVendors();
    fetchRentData();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/vendors");
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  };

  const fetchRentData = async () => {
    setLoadingRent(true);
    try {
      const res = await fetch("/api/admin/vendors/rent");
      if (res.ok) {
        const data = await res.json();
        setRentData(data);
        if (data.settings) {
          setRentSettingsForm({
            default_rent: data.settings.default_rent || 5000,
            bank_name: data.settings.bank_name || "",
            account_title: data.settings.account_title || "",
            account_number: data.settings.account_number || "",
            instructions: data.settings.instructions || ""
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRent(false);
    }
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
      setFormData({ store_name: "", owner_name: "", email: "", password: "", phone: "", address: "" });
      fetchVendors();
      fetchRentData();
    } else {
      showToast("Failed to create vendor", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor and all their data?")) {
      await fetch(`/api/admin/vendors?id=${id}`, { method: "DELETE" });
      setVendors(vendors.filter(v => v.id !== id));
      showToast("Vendor deleted", "success");
      fetchRentData();
    }
  };

  // Send Notification to Vendors
  const handleSendNotification = async (action: "profile_update" | "smtp_setup" | "check_5days", vendorId?: string) => {
    const actionTitles = {
      profile_update: "Send Profile Update (Name & Address) notification to all existing vendors?",
      smtp_setup: "Send SMTP Configuration instructions to all vendors?",
      check_5days: "Check and send 5-day SMTP reminder to eligible new stores (stores >= 5 days old without SMTP)?"
    };

    if (!confirm(actionTitles[action] || "Send email notification?")) {
      return;
    }

    setSendingNotification(action);
    try {
      const res = await fetch("/api/admin/vendors/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, vendorId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (action === "check_5days" && data.sentCount === 0) {
          showToast(`Checked 5-day stores: No eligible vendors needed reminders right now.`, "info");
        } else {
          showToast(`Emails sent successfully! Total sent: ${data.sentCount}`, "success");
        }
      } else {
        showToast(data.error || "Failed to send notifications", "error");
      }
    } catch (err: any) {
      showToast("Error triggering email notification", "error");
    } finally {
      setSendingNotification(null);
    }
  };

  // Save Store Rent Settings
  const handleSaveRentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRentSettings(true);
    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          ...rentSettingsForm,
          custom_rents: rentData.settings.custom_rents || {}
        })
      });

      if (res.ok) {
        showToast("Store Rent settings updated successfully!", "success");
        setIsRentSettingsModalOpen(false);
        fetchRentData();
      } else {
        showToast("Failed to save rent settings", "error");
      }
    } catch (err) {
      showToast("Error saving rent settings", "error");
    } finally {
      setSavingRentSettings(false);
    }
  };

  // Save Custom Rent for a specific Vendor
  const handleSaveCustomRent = async (vendorId: string) => {
    const updatedCustomRents = {
      ...(rentData.settings.custom_rents || {}),
      [vendorId]: Number(customRentInput)
    };

    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          ...rentData.settings,
          custom_rents: updatedCustomRents
        })
      });

      if (res.ok) {
        showToast("Custom rent saved for vendor!", "success");
        setEditingRentVendorId(null);
        fetchRentData();
      }
    } catch (e) {
      showToast("Failed to update vendor rent", "error");
    }
  };

  // Trigger Rent Notice to a Vendor (Email + WhatsApp)
  const handleSendRentNotice = async (store: any) => {
    const rentAmount = store.rentAmount || rentData.settings.default_rent || 5000;
    const confirmMsg = `Send Month ${store.monthNum || 1} Store Rent Invoice (Rs. ${rentAmount.toLocaleString()} PKR) to ${store.ownerName} (${store.email})?`;
    if (!confirm(confirmMsg)) return;

    setSendingRentVendorId(store.id);
    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_rent_notice",
          vendorId: store.id,
          rentAmount
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Rent invoice emailed to ${store.email}!`, "success");

        // If vendor has phone, ask if Admin wants to open WhatsApp message
        if (data.whatsappUrl) {
          if (confirm(`Rent invoice also prepared for WhatsApp (${data.phone}). Open WhatsApp to send message now?`)) {
            window.open(data.whatsappUrl, "_blank");
          }
        }
      } else {
        showToast(data.error || "Failed to send rent notice", "error");
      }
    } catch (e) {
      showToast("Error sending rent notice", "error");
    } finally {
      setSendingRentVendorId(null);
    }
  };

  // Open Record Payment Modal
  const handleOpenRecordPayment = (store?: any) => {
    const today = new Date().toISOString().split("T")[0];
    if (store) {
      setSelectedVendorForPayment(store);
      const nextMonthNum = (store.paymentsCount || 0) + 1;
      setPaymentForm({
        vendorId: store.id,
        amount: store.rentAmount || rentData.settings.default_rent || 5000,
        paymentDate: today,
        monthCycle: `Month ${nextMonthNum}`,
        paymentMethod: rentData.settings.bank_name || "Easypaisa",
        transactionRef: "",
        notes: "",
        sendReceiptEmail: true
      });
    } else {
      setSelectedVendorForPayment(null);
      setPaymentForm({
        vendorId: rentData.stores[0]?.id || "",
        amount: rentData.settings.default_rent || 5000,
        paymentDate: today,
        monthCycle: "Month 1",
        paymentMethod: rentData.settings.bank_name || "Easypaisa",
        transactionRef: "",
        notes: "",
        sendReceiptEmail: true
      });
    }
    setIsRecordPaymentModalOpen(true);
  };

  // Submit Payment Record
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.vendorId) {
      showToast("Please select a vendor", "error");
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          ...paymentForm
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Rent payment recorded for ${data.payment.storeName} on ${data.payment.paymentDate}!`, "success");
        if (data.receiptEmailSent) {
          showToast(`Payment receipt email sent to vendor (${data.payment.email})!`, "info");
        }
        setIsRecordPaymentModalOpen(false);
        fetchRentData();
      } else {
        showToast(data.error || "Failed to record payment", "error");
      }
    } catch (err) {
      showToast("Error recording payment", "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  // Delete Payment Record
  const handleDeletePayment = async (paymentId: string, storeName: string, date: string) => {
    if (!confirm(`Are you sure you want to delete payment record for ${storeName} on ${date}?`)) return;

    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_payment",
          paymentId
        })
      });

      if (res.ok) {
        showToast("Payment record deleted", "success");
        fetchRentData();
      } else {
        showToast("Failed to delete payment record", "error");
      }
    } catch (e) {
      showToast("Error deleting payment", "error");
    }
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Vendors Management</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)", margin: 0 }}>
            Manage vendor accounts, monthly store rent invoices, credentials, and automated notifications
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: 8, background: "var(--gray-100)", padding: 4, borderRadius: 10 }}>
          <button
            onClick={() => setActiveTab("vendors")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeTab === "vendors" ? "white" : "none",
              color: activeTab === "vendors" ? "var(--gray-900)" : "var(--gray-600)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: activeTab === "vendors" ? "var(--shadow-sm)" : "none"
            }}
          >
            🏪 All Stores ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab("rent")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeTab === "rent" ? "white" : "none",
              color: activeTab === "rent" ? "var(--red)" : "var(--gray-600)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: activeTab === "rent" ? "var(--shadow-sm)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <CreditCard size={15} /> Store Monthly Rent
            {rentData.totalDueCount > 0 && (
              <span style={{ background: "var(--red)", color: "white", padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 800 }}>
                {rentData.totalDueCount} Due
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: ALL VENDORS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "vendors" && (
        <>
          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button 
                onClick={() => handleSendNotification("profile_update")}
                disabled={Boolean(sendingNotification)}
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 8, 
                  background: "#fef2f2", 
                  color: "var(--red)", 
                  border: "1px solid #fee2e2", 
                  padding: "9px 15px", 
                  borderRadius: "var(--radius)", 
                  cursor: sendingNotification ? "not-allowed" : "pointer", 
                  fontWeight: 700, 
                  fontSize: 13 
                }}
              >
                <Send size={14} /> {sendingNotification === "profile_update" ? "Sending..." : "Email: Update Name & Address"}
              </button>

              <button 
                onClick={() => handleSendNotification("smtp_setup")}
                disabled={Boolean(sendingNotification)}
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 8, 
                  background: "#eff6ff", 
                  color: "#2563eb", 
                  border: "1px solid #dbeafe", 
                  padding: "9px 15px", 
                  borderRadius: "var(--radius)", 
                  cursor: sendingNotification ? "not-allowed" : "pointer", 
                  fontWeight: 700, 
                  fontSize: 13 
                }}
              >
                <Mail size={14} /> {sendingNotification === "smtp_setup" ? "Sending..." : "Email: Configure SMTP"}
              </button>

              <button 
                onClick={() => handleSendNotification("check_5days")}
                disabled={Boolean(sendingNotification)}
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 8, 
                  background: "#fffbeb", 
                  color: "#b45309", 
                  border: "1px solid #fde68a", 
                  padding: "9px 15px", 
                  borderRadius: "var(--radius)", 
                  cursor: sendingNotification ? "not-allowed" : "pointer", 
                  fontWeight: 700, 
                  fontSize: 13 
                }}
              >
                <Clock size={14} /> {sendingNotification === "check_5days" ? "Checking..." : "5-Day SMTP Reminders"}
              </button>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                background: "var(--gray-900)", 
                color: "white", 
                padding: "9px 18px", 
                border: "none", 
                borderRadius: "var(--radius)", 
                cursor: "pointer", 
                fontWeight: 700, 
                fontSize: 13 
              }}
            >
              <Plus size={16} /> Add New Vendor
            </button>
          </div>

          {/* Vendors Table */}
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Store</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Owner / Login</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Phone & Address</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status / SMTP</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>Loading vendors...</td></tr>
                ) : vendors.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>No vendors found.</td></tr>
                ) : vendors.map(v => {
                  const hasPhone = Boolean(v.owner?.phone);
                  const hasAddress = Boolean(v.owner?.address);
                  const hasSmtp = Boolean(v.smtp_user);

                  return (
                    <tr key={v.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--gray-900)" }}>{v.name}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>/shop/{v.slug}</div>
                        <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>
                          Products: {v._count?.products || 0} • Orders: {v._count?.orders || 0}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 700, color: "var(--gray-800)" }}>{v.owner?.name || "No Name"}</div>
                        <div style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={13} color="var(--gray-400)" /> {v.owner?.email}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        {hasPhone ? (
                          <div style={{ fontSize: 13, color: "var(--gray-700)", fontWeight: 600 }}>📞 {v.owner?.phone}</div>
                        ) : (
                          <span style={{ fontSize: 11, background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                            Missing Phone
                          </span>
                        )}
                        {hasAddress ? (
                          <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4, maxWidth: 260 }}>📍 {v.owner?.address}</div>
                        ) : (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                              Missing Address
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {hasSmtp ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 6, fontWeight: 700, width: "fit-content" }}>
                              <CheckCircle size={12} /> SMTP Active
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, background: "#f1f5f9", color: "#64748b", padding: "3px 8px", borderRadius: 6, fontWeight: 700, width: "fit-content" }}>
                              No SMTP Configured
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--gray-400)" }}>
                            Joined: {new Date(v.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <a href={`/admin/vendors/${v.id}`} style={{ padding: "7px 14px", background: "var(--gray-100)", color: "var(--gray-900)", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                            Manage & Credentials
                          </a>
                          <button onClick={() => handleDelete(v.id)} title="Delete Vendor" style={{ padding: "7px 9px", background: "#fee2e2", color: "var(--red)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: STORE MONTHLY RENT MANAGEMENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "rent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Rent Settings Header Card */}
          <div style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fef2f2", color: "var(--red)", padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
                  <CreditCard size={13} /> STORE RENT & PAYMENT LEDGER (MANUAL TRIGGER ONLY)
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--gray-900)", margin: 0 }}>
                  Monthly Store Rent Configuration & Billing Ledger
                </h2>
                <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "4px 0 0 0" }}>
                  Store rent is only sent when you click send. Default rent amount is in PKR and payments are recorded date-wise.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleOpenRecordPayment()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Calendar size={15} /> Record Payment (Calendar Date)
                </button>

                <button
                  onClick={() => setIsRentSettingsModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    background: "var(--gray-900)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Settings size={15} /> Configure Default Rent & Bank
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--gray-100)" }}>
              <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Default Store Rent</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--red)", marginTop: 2 }}>
                  Rs. {Number(rentData.settings?.default_rent || 5000).toLocaleString()} <span style={{ fontSize: 13, color: "var(--gray-600)" }}>PKR / mo</span>
                </div>
              </div>

              <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Total Rent Collected</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#15803d", marginTop: 2 }}>
                  Rs. {Number(rentData.totalCollected || 0).toLocaleString()} <span style={{ fontSize: 13, color: "#166534" }}>PKR</span>
                </div>
                <div style={{ fontSize: 11, color: "#15803d", marginTop: 2, fontWeight: 600 }}>
                  {rentData.allPayments?.length || 0} Payments Completed
                </div>
              </div>

              <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Deposit Bank & Account</span>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--gray-900)", marginTop: 4 }}>
                  {rentData.settings?.bank_name || "Easypaisa"} • {rentData.settings?.account_title || "Amir khan"}
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-500)", fontFamily: "monospace" }}>{rentData.settings?.account_number || "03162975195"}</div>
              </div>

              <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Rent Status Summary</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: rentData.totalDueCount > 0 ? "var(--red)" : "#16a34a", marginTop: 4 }}>
                  {rentData.totalDueCount} Stores Due
                </div>
                <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2 }}>
                  {rentData.stores.filter((s: any) => s.rentStatus === "paid").length} Stores Paid Up to Date
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Stores Rent Status & Invoicing Table */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ padding: "16px 24px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>
                Stores & Monthly Billing Status
              </h3>
              <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
                Click "Record Payment" to log payment received date, or send invoice via Email/WhatsApp
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "white", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Store & Owner</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Joined & Active Days</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Rent Payment Status</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Set Rent (PKR)</th>
                  <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingRent ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>Loading store rent details...</td></tr>
                ) : rentData.stores.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>No stores found.</td></tr>
                ) : rentData.stores.map(s => {
                  const isPaid = s.rentStatus === "paid";
                  const isDue = s.rentStatus === "due";
                  const isEditingThis = editingRentVendorId === s.id;

                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--gray-100)", background: isDue ? "#fffdf5" : "white" }}>
                      {/* Store & Owner */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--gray-900)" }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>{s.ownerName}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 1 }}>✉ {s.email}</div>
                        {s.phone && <div style={{ fontSize: 12, color: "#166534", fontWeight: 600, marginTop: 2 }}>📞 {s.phone}</div>}
                      </td>

                      {/* Joined & Active Days */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-800)" }}>
                          {s.daysActive} Days Active
                        </div>
                        <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>
                          Created: {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Rent Payment Status with Date Info */}
                      <td style={{ padding: "16px 24px" }}>
                        {isPaid ? (
                          <div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800, border: "1px solid #bbf7d0" }}>
                              <CheckCircle size={14} /> Paid & Up to Date
                            </span>
                            <div style={{ fontSize: 11, color: "#15803d", marginTop: 4, fontWeight: 600 }}>
                              📅 Last Paid: {s.lastPayment?.paymentDate} ({s.lastPayment?.monthCycle})
                            </div>
                            <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 1 }}>
                              Next Due: {s.nextDueDate}
                            </div>
                          </div>
                        ) : isDue ? (
                          <div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fef2f2", color: "#b91c1c", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800, border: "1px solid #fecaca" }}>
                              <AlertCircle size={14} /> Month {s.monthNum} Due
                            </span>
                            <div style={{ fontSize: 11, color: "#991b1b", marginTop: 4, fontWeight: 600 }}>
                              Rent pending since {s.nextDueDate}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1e40af", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                              <Clock size={13} /> Trial Active ({s.daysActive}/30 Days)
                            </span>
                            <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4 }}>
                              First rent due on: {s.nextDueDate}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Set Rent Amount in PKR */}
                      <td style={{ padding: "16px 24px" }}>
                        {isEditingThis ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input
                              type="number"
                              value={customRentInput}
                              onChange={e => setCustomRentInput(Number(e.target.value))}
                              style={{ width: 90, padding: "6px 8px", border: "1.5px solid var(--red)", borderRadius: 6, fontSize: 13, fontWeight: 700 }}
                            />
                            <button onClick={() => handleSaveCustomRent(s.id)} style={{ padding: 6, background: "#22c55e", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }} title="Save">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingRentVendorId(null)} style={{ padding: 6, background: "var(--gray-200)", color: "var(--gray-700)", border: "none", borderRadius: 6, cursor: "pointer" }} title="Cancel">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: "var(--red)" }}>
                              Rs. {Number(s.rentAmount).toLocaleString()} <span style={{ fontSize: 11, color: "var(--gray-500)" }}>PKR</span>
                            </span>
                            <button
                              onClick={() => {
                                setEditingRentVendorId(s.id);
                                setCustomRentInput(s.rentAmount);
                              }}
                              style={{ border: "none", background: "none", color: "var(--gray-400)", cursor: "pointer", padding: 2 }}
                              title="Set Custom Rent for this Store"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {/* Record Payment / Mark Complete Button */}
                          <button
                            onClick={() => handleOpenRecordPayment(s)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 13px",
                              background: "#16a34a",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                            }}
                            title="Mark rent as complete and enter payment date"
                          >
                            <Calendar size={13} /> Record Payment
                          </button>

                          {/* Send Email Notice */}
                          <button
                            onClick={() => handleSendRentNotice(s)}
                            disabled={sendingRentVendorId === s.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 12px",
                              background: isDue ? "var(--red)" : "var(--gray-900)",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: sendingRentVendorId === s.id ? "not-allowed" : "pointer"
                            }}
                          >
                            {sendingRentVendorId === s.id ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                            {sendingRentVendorId === s.id ? "Sending..." : "Email Invoice"}
                          </button>

                          {/* Direct WhatsApp Button */}
                          {s.whatsappUrl ? (
                            <a
                              href={s.whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 11px",
                                background: "#dcfce7",
                                color: "#15803d",
                                border: "1px solid #bbf7d0",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: "none"
                              }}
                              title="Open WhatsApp with Pre-filled Rent Message"
                            >
                              <MessageSquare size={13} /> WhatsApp
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--gray-400)", fontStyle: "italic" }}>
                              No Phone
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 2: Date-Wise Store Rent Payments Ledger (Calendar & History Log) */}
          {(() => {
            const filteredPayments = rentData.allPayments?.filter((p: any) => {
              if (historyStoreFilter === "all") return true;
              return p.vendorId === historyStoreFilter;
            }) || [];

            return (
              <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--gray-200)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ padding: "18px 24px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={18} color="#15803d" />
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>
                        Date-Wise Rent Payments Ledger (Calendar & Payment History)
                      </h3>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--gray-500)", margin: "4px 0 0 0" }}>
                      Har store ke hisaab se payment kis date ko aayi aur complete hui — mukammal date-wise record.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {/* Filter by store */}
                    <select
                      value={historyStoreFilter}
                      onChange={e => setHistoryStoreFilter(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gray-300)", fontSize: 13, fontWeight: 600, background: "white" }}
                    >
                      <option value="all">All Stores ({rentData.allPayments?.length || 0} Records)</option>
                      {rentData.stores.map((st: any) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleOpenRecordPayment()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <Plus size={15} /> Record Payment (Calendar Date)
                    </button>
                  </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "white", borderBottom: "1px solid var(--gray-200)" }}>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Payment Date</th>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Store & Owner</th>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Billing Cycle</th>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Amount Received</th>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Method & Trx ID</th>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>
                          <Calendar size={32} color="var(--gray-300)" style={{ margin: "0 auto 8px auto", display: "block" }} />
                          No payments recorded yet. Click "Record Payment" to log a completed store rent payment with date.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p: any) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: "var(--gray-900)", fontSize: 13 }}>
                              <Calendar size={14} color="#15803d" />
                              {new Date(p.paymentDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{p.paymentDate}</div>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--gray-900)" }}>{p.storeName}</div>
                            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{p.ownerName} • {p.email}</div>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                              {p.monthCycle}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontWeight: 900, color: "#15803d", fontSize: 15 }}>
                              Rs. {Number(p.amount).toLocaleString()} PKR
                            </div>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>
                              {p.paymentMethod}
                            </div>
                            {p.transactionRef && (
                              <div style={{ fontSize: 11, color: "var(--gray-500)", fontFamily: "monospace" }}>
                                Trx: {p.transactionRef}
                              </div>
                            )}
                            {p.notes && (
                              <div style={{ fontSize: 11, color: "var(--gray-500)", fontStyle: "italic" }}>
                                {p.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                              <CheckCircle size={12} /> COMPLETED
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <button
                              onClick={() => handleDeletePayment(p.id, p.storeName, p.paymentDate)}
                              title="Delete Payment Record"
                              style={{ padding: "6px 8px", background: "#fee2e2", color: "var(--red)", border: "none", borderRadius: 6, cursor: "pointer" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD NEW VENDOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Add New Vendor</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Store Name</label>
                <input required placeholder="e.g. Trendy Collections" className="input" value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Owner Name</label>
                <input required placeholder="e.g. Muhammad Ali" className="input" value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Phone Number</label>
                <input placeholder="e.g. 03001234567" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Pickup / Business Address</label>
                <input placeholder="e.g. Shop #12, Saddar, Karachi" className="input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Login Email</label>
                <input required type="email" placeholder="vendor@example.com" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Login Password</label>
                <input required type="password" placeholder="Password" className="input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "10px 16px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 16px", background: "var(--gray-900)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Create Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: CONFIGURE DEFAULT RENT & BANK DETAILS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isRentSettingsModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <CreditCard size={22} color="var(--red)" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Configure Store Rent & Deposit Account</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20 }}>
              Set the standard monthly store rent in PKR and bank deposit details shown on vendor rent invoices.
            </p>

            <form onSubmit={handleSaveRentSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  Default Monthly Store Rent (PKR) <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  required
                  type="number"
                  placeholder="5000"
                  value={rentSettingsForm.default_rent}
                  onChange={e => setRentSettingsForm({ ...rentSettingsForm, default_rent: Number(e.target.value) })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 15, fontWeight: 700 }}
                />
                <span style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4, display: "block" }}>
                  This amount (e.g. Rs. 5,000 PKR) will be sent to vendors when their 1-month billing cycle is completed.
                </span>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Bank Name / Service</label>
                <input
                  placeholder="e.g. Meezan Bank Ltd / JazzCash"
                  value={rentSettingsForm.bank_name}
                  onChange={e => setRentSettingsForm({ ...rentSettingsForm, bank_name: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Account Title</label>
                <input
                  placeholder="e.g. Dastiyab Store Official"
                  value={rentSettingsForm.account_title}
                  onChange={e => setRentSettingsForm({ ...rentSettingsForm, account_title: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Account Number / IBAN</label>
                <input
                  placeholder="e.g. 0102030405060708 / PK00MEZN..."
                  value={rentSettingsForm.account_number}
                  onChange={e => setRentSettingsForm({ ...rentSettingsForm, account_number: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Payment Instructions / Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Deposit via online banking or JazzCash and share screenshot with Admin on WhatsApp."
                  value={rentSettingsForm.instructions}
                  onChange={e => setRentSettingsForm({ ...rentSettingsForm, instructions: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsRentSettingsModalOpen(false)}
                  style={{ padding: "10px 18px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  disabled={savingRentSettings}
                  type="submit"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--red)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: savingRentSettings ? "not-allowed" : "pointer" }}
                >
                  {savingRentSettings ? <Loader2 size={16} className="animate-spin" /> : null}
                  {savingRentSettings ? "Saving..." : "Save Rent Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: RECORD RENT PAYMENT (CALENDAR & DATE-WISE LOG) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isRecordPaymentModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Calendar size={22} color="#15803d" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Record Store Rent Payment</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20 }}>
              Jis date ko vendor ki payment aayi hai aur complete hui hai, use calendar se select karke save karein.
            </p>

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Select Vendor */}
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  Store / Vendor <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <select
                  required
                  value={paymentForm.vendorId}
                  onChange={e => {
                    const selId = e.target.value;
                    const st = rentData.stores.find((x: any) => x.id === selId);
                    setPaymentForm({
                      ...paymentForm,
                      vendorId: selId,
                      amount: st ? (st.rentAmount || 5000) : paymentForm.amount,
                      monthCycle: st ? `Month ${(st.paymentsCount || 0) + 1}` : paymentForm.monthCycle
                    });
                  }}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "white" }}
                >
                  <option value="">-- Select Store --</option>
                  {rentData.stores.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.ownerName}) — Rent: Rs. {Number(s.rentAmount).toLocaleString()} PKR
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Date (Calendar Picker) */}
              <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 800, fontSize: 13, color: "#166534" }}>
                  📅 Payment Received Date (Calendar) <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  required
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #86efac", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "white" }}
                />
                <span style={{ fontSize: 11, color: "#15803d", marginTop: 4, display: "block" }}>
                  Kis calendar date ko payment aayi aur complete hui?
                </span>
              </div>

              {/* Billing Cycle & Amount */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                    Billing Cycle / Month
                  </label>
                  <input
                    required
                    placeholder="e.g. Month 1"
                    value={paymentForm.monthCycle}
                    onChange={e => setPaymentForm({ ...paymentForm, monthCycle: e.target.value })}
                    style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                    Amount Paid (PKR) <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    required
                    type="number"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 14, fontWeight: 800, color: "#15803d" }}
                  />
                </div>
              </div>

              {/* Payment Method & Trx ID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 13, background: "white" }}
                  >
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                    <option value="Online Bank Transfer">Online Bank Transfer / Raast</option>
                    <option value="Cash / Hand-to-Hand">Cash / Hand-to-Hand</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                    Transaction Ref / Slip ID
                  </label>
                  <input
                    placeholder="e.g. TRX-90142"
                    value={paymentForm.transactionRef}
                    onChange={e => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 13, fontFamily: "monospace" }}
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  Admin Remarks / Notes (Optional)
                </label>
                <input
                  placeholder="e.g. Screenshot verified on WhatsApp"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 13 }}
                />
              </div>

              {/* Email Receipt Option */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>
                <input
                  type="checkbox"
                  checked={paymentForm.sendReceiptEmail}
                  onChange={e => setPaymentForm({ ...paymentForm, sendReceiptEmail: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                Send official payment confirmation receipt email to store owner
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  style={{ padding: "10px 18px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  disabled={recordingPayment}
                  type="submit"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: recordingPayment ? "not-allowed" : "pointer" }}
                >
                  {recordingPayment ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {recordingPayment ? "Saving Payment..." : "Save Payment & Mark Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
