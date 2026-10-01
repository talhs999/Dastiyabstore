"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, User, Check, X, Edit, Lock, Mail, Phone, MapPin, Send, Loader2, CreditCard, MessageSquare, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);

  // Rent Invoice State
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [rentAmount, setRentAmount] = useState<number>(5000);
  const [sendingRent, setSendingRent] = useState(false);
  const [rentSettings, setRentSettings] = useState<any>(null);

  // Rent Payment Recording State (Calendar)
  const [storeRentInfo, setStoreRentInfo] = useState<any>(null);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 5000,
    paymentDate: new Date().toISOString().split("T")[0],
    monthCycle: "Month 1",
    paymentMethod: "Easypaisa",
    transactionRef: "",
    notes: "",
    sendReceiptEmail: true
  });

  const { showToast } = useToast();

  const [editFormData, setEditFormData] = useState({
    store_name: "",
    owner_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: ""
  });

  useEffect(() => {
    fetchVendor();
  }, [params.id]);

  const fetchVendor = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/vendors/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setVendor(data);
      setEditFormData({
        store_name: data.name || "",
        owner_name: data.owner?.name || "",
        email: data.owner?.email || "",
        password: "", // Leave blank unless updating
        phone: data.owner?.phone || "",
        address: data.owner?.address || "",
        city: data.owner?.city || ""
      });
      setLoading(false);
      // Fetch rent settings to get configured default or custom rent
      try {
        const rentRes = await fetch("/api/admin/vendors/rent");
        if (rentRes.ok) {
          const rentData = await rentRes.json();
          setRentSettings(rentData.settings);
          const sInfo = rentData.stores?.find((s: any) => s.id === data.id);
          setStoreRentInfo(sInfo || null);
          const customRent = rentData.settings?.custom_rents?.[data.id];
          const finalRent = customRent !== undefined ? customRent : (rentData.settings?.default_rent || 5000);
          setRentAmount(finalRent);
          if (sInfo) {
            setPaymentForm(prev => ({
              ...prev,
              amount: finalRent,
              monthCycle: `Month ${(sInfo.paymentsCount || 0) + 1}`,
              paymentMethod: rentData.settings?.bank_name || "Easypaisa"
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      showToast("Failed to fetch vendor", "error");
      setLoading(false);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordingPayment(true);
    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          vendorId: vendor.id,
          ...paymentForm
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Rent payment recorded for ${data.payment.paymentDate}!`, "success");
        if (data.receiptEmailSent) {
          showToast(`Official receipt email sent to ${vendor.owner?.email}!`, "info");
        }
        setIsRecordPaymentModalOpen(false);
        fetchVendor();
      } else {
        showToast(data.error || "Failed to record payment", "error");
      }
    } catch (err) {
      showToast("Error recording payment", "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string, date: string) => {
    if (!confirm(`Delete payment record from ${date}?`)) return;

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
        fetchVendor();
      } else {
        showToast("Failed to delete payment record", "error");
      }
    } catch (e) {
      showToast("Error deleting payment", "error");
    }
  };

  const handleSendRentNotice = async (sendWhatsApp: boolean = false) => {
    setSendingRent(true);
    try {
      const res = await fetch("/api/admin/vendors/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_rent_notice",
          vendorId: vendor.id,
          rentAmount: Number(rentAmount)
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Rent invoice emailed to ${vendor.owner?.email}!`, "success");
        if (sendWhatsApp && data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank");
        } else if (data.whatsappUrl) {
          if (confirm(`Rent invoice also prepared for WhatsApp (${data.phone}). Open WhatsApp now?`)) {
            window.open(data.whatsappUrl, "_blank");
          }
        }
        setIsRentModalOpen(false);
      } else {
        showToast(data.error || "Failed to send rent notice", "error");
      }
    } catch (e) {
      showToast("Error sending rent notice", "error");
    } finally {
      setSendingRent(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/vendors/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Vendor credentials and details updated successfully", "success");
        setIsEditModalOpen(false);
        fetchVendor();
      } else {
        showToast(data.error || "Failed to update vendor", "error");
      }
    } catch (err) {
      showToast("Error updating vendor", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSendSingleNotification = async (action: "profile_update" | "smtp_setup") => {
    const label = action === "profile_update" ? "Profile Update" : "SMTP Setup";
    if (!confirm(`Send ${label} notification to ${vendor.owner?.email}?`)) return;

    setSendingNotification(action);
    try {
      const res = await fetch("/api/admin/vendors/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, vendorId: vendor.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`${label} email sent to ${vendor.owner?.email}`, "success");
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch (err) {
      showToast("Error sending notification", "error");
    } finally {
      setSendingNotification(null);
    }
  };

  const toggleProductField = async (productId: string, field: string, currentValue: boolean) => {
    // Optimistic update
    setVendor((prev: any) => ({
      ...prev,
      products: prev.products.map((p: any) => 
        p.id === productId ? { ...p, [field]: !currentValue } : p
      )
    }));

    const res = await fetch("/api/admin/products/toggle", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        field,
        value: !currentValue
      })
    });

    if (res.ok) {
      showToast("Updated successfully", "success");
    } else {
      // Revert if failed
      setVendor((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) => 
          p.id === productId ? { ...p, [field]: currentValue } : p
        )
      }));
      showToast("Failed to update", "error");
    }
  };

  if (loading) return <div style={{ padding: 40, color: "var(--gray-500)" }}>Loading vendor details...</div>;
  if (!vendor) return <div style={{ padding: 40 }}>Vendor not found.</div>;

  return (
    <div style={{ padding: "32px 40px" }}>
      <button 
        onClick={() => router.back()} 
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--gray-600)", fontWeight: 600, cursor: "pointer", marginBottom: 24, fontSize: 14 }}
      >
        <ArrowLeft size={16} /> Back to Vendors
      </button>

      {/* Top Details Card */}
      <div style={{ background: "white", padding: 28, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", marginBottom: 32, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--gray-900)", margin: 0 }}>
                {vendor.name}
              </h1>
              <p style={{ fontSize: 13, color: "var(--gray-500)", margin: 0, marginTop: 2 }}>
                Vendor ID: {vendor.id} • Joined: {new Date(vendor.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => handleSendSingleNotification("profile_update")}
              disabled={Boolean(sendingNotification)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "#fef2f2",
                color: "var(--red)",
                border: "1px solid #fee2e2",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: sendingNotification ? "not-allowed" : "pointer"
              }}
            >
              <Send size={14} /> Send Profile Email
            </button>

            <button
              onClick={() => handleSendSingleNotification("smtp_setup")}
              disabled={Boolean(sendingNotification)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #dbeafe",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: sendingNotification ? "not-allowed" : "pointer"
              }}
            >
              <Mail size={14} /> Send SMTP Email
            </button>

            <button
              onClick={() => setIsRentModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <CreditCard size={14} /> Send Store Rent Notice
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "var(--gray-900)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <Edit size={14} /> Edit Credentials & Details
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, paddingTop: 16, borderTop: "1px solid var(--gray-100)" }}>
          <div>
            <span style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Store URL Slug</span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0 0" }}>/shop/{vendor.slug}</p>
          </div>

          <div>
            <span style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Owner Full Name</span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0 0" }}>{vendor.owner?.name || "Not set"}</p>
          </div>

          <div>
            <span style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Login Email (Admin Only)</span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0 0", color: "var(--gray-900)" }}>{vendor.owner?.email}</p>
          </div>

          <div>
            <span style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Phone Number</span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0 0" }}>{vendor.owner?.phone || <span style={{ color: "#dc2626" }}>Missing Phone</span>}</p>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Pickup / Business Address</span>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 0 0", color: vendor.owner?.address ? "var(--gray-800)" : "#dc2626" }}>
              {vendor.owner?.address || "Address not provided yet"}
            </p>
          </div>
        </div>

        {/* Rent & Age Status Box */}
        {(() => {
          const createdDate = vendor.created_at ? new Date(vendor.created_at) : new Date();
          const daysActive = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          const monthsCompleted = Math.floor(daysActive / 30);
          const isMonthCompleted = daysActive >= 30;
          const monthNum = Math.max(1, monthsCompleted || 1);
          const isPaid = storeRentInfo?.rentStatus === "paid";
          const isDue = storeRentInfo ? storeRentInfo.rentStatus === "due" : isMonthCompleted;

          const bg = isPaid ? "#f0fdf4" : isDue ? "#fefce8" : "#f8fafc";
          const border = isPaid ? "1px solid #bbf7d0" : isDue ? "1px solid #fef08a" : "1px solid var(--gray-200)";

          return (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, background: bg, padding: "16px 20px", borderRadius: 12, border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: isPaid ? "#dcfce7" : isDue ? "#fde047" : "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", color: isPaid ? "#166534" : isDue ? "#854d0e" : "var(--gray-700)" }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-900)" }}>
                      Store Age: {daysActive} Days
                    </span>
                    {isPaid ? (
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Check size={12} /> Paid & Up to Date
                      </span>
                    ) : isDue ? (
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <AlertCircle size={12} /> Month {monthNum} Rent Due
                      </span>
                    ) : (
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, background: "#e0e7ff", color: "#3730a3" }}>
                        Trial Active (Day {daysActive}/30)
                      </span>
                    )}
                  </div>
                  <div style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--gray-600)" }}>
                    Configured Monthly Rent: <strong style={{ color: "#16a34a" }}>Rs. {Number(rentAmount).toLocaleString()} PKR</strong>
                    {storeRentInfo?.lastPayment && (
                      <span style={{ marginLeft: 10, color: "#15803d", fontWeight: 700 }}>
                        • 📅 Last Payment: {storeRentInfo.lastPayment.paymentDate} ({storeRentInfo.lastPayment.monthCycle})
                      </span>
                    )}
                    {storeRentInfo?.nextDueDate && (
                      <span style={{ marginLeft: 10, color: "var(--gray-500)" }}>
                        • Next Due Date: {storeRentInfo.nextDueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => setIsRecordPaymentModalOpen(true)}
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
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                  }}
                >
                  <Calendar size={14} /> Record Payment (Calendar)
                </button>

                <button
                  onClick={() => setIsRentModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: isDue ? "var(--red)" : "var(--gray-900)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <CreditCard size={14} /> Send Rent Notice (Email/WhatsApp)
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Products Table */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <Package size={20} /> Vendor Products ({vendor.products?.length || 0})
          </h2>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4, margin: 0 }}>
            Control which products from this vendor appear in the homepage Featured and Best Seller sections.
          </p>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "white", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Product</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Price</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", textAlign: "center" }}>Best Seller</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", textAlign: "center" }}>Featured</th>
            </tr>
          </thead>
          <tbody>
            {!vendor.products || vendor.products.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>This vendor has no products yet.</td></tr>
            ) : vendor.products.map((product: any) => (
              <tr key={product.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {(product.images && product.images.length > 0 ? product.images[0] : product.image) && (
                      <img src={product.images && product.images.length > 0 ? product.images[0] : product.image} alt={product.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-200)" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{product.category?.name || (typeof product.category === 'string' ? product.category : "") || "Uncategorized"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                  <div>Rs. {(product.price || 0).toLocaleString()}</div>
                  {product.original_price && (
                    <div style={{ fontSize: 11, color: "var(--gray-400)", textDecoration: "line-through", marginTop: 2 }}>
                      Rs. {product.original_price.toLocaleString()}
                    </div>
                  )}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button 
                    onClick={() => toggleProductField(product.id, "is_best_seller", product.is_best_seller)}
                    style={{ 
                      padding: "6px 12px", 
                      borderRadius: 20, 
                      border: "1px solid", 
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: product.is_best_seller ? "#dcfce7" : "var(--gray-100)",
                      borderColor: product.is_best_seller ? "#bbf7d0" : "var(--gray-200)",
                      color: product.is_best_seller ? "#166534" : "var(--gray-500)",
                    }}
                  >
                    {product.is_best_seller ? <><Check size={14} /> Yes</> : <><X size={14} /> No</>}
                  </button>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button 
                    onClick={() => toggleProductField(product.id, "is_featured", product.is_featured)}
                    style={{ 
                      padding: "6px 12px", 
                      borderRadius: 20, 
                      border: "1px solid", 
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: product.is_featured ? "#dbeafe" : "var(--gray-100)",
                      borderColor: product.is_featured ? "#bfdbfe" : "var(--gray-200)",
                      color: product.is_featured ? "#1e40af" : "var(--gray-500)",
                    }}
                  >
                    {product.is_featured ? <><Check size={14} /> Yes</> : <><X size={14} /> No</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Store Rent Payment History Ledger (Date-wise) */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden", marginTop: 32 }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} color="#15803d" />
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>
                Store Rent Payment History (Date-Wise Ledger)
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4, margin: 0 }}>
              All rent payments recorded for {vendor.name} with calendar payment dates, amounts, and receipt verification.
            </p>
          </div>

          <button
            onClick={() => setIsRecordPaymentModalOpen(true)}
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
            <Calendar size={15} /> Record Payment (Calendar Date)
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "white", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Payment Date</th>
              <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Cycle / Month</th>
              <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Amount (PKR)</th>
              <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Method & Reference</th>
              <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {!storeRentInfo?.payments || storeRentInfo.payments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 36, textAlign: "center", color: "var(--gray-500)" }}>
                  <Calendar size={32} color="var(--gray-300)" style={{ margin: "0 auto 8px auto", display: "block" }} />
                  No rent payments recorded yet for this store. Click "Record Payment" to log a payment with calendar date.
                </td>
              </tr>
            ) : (
              storeRentInfo.payments.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: "var(--gray-900)" }}>
                      <Calendar size={14} color="#15803d" />
                      {new Date(p.paymentDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{p.paymentDate}</div>
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
                      <Check size={12} /> COMPLETED
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={() => handleDeletePayment(p.id, p.paymentDate)}
                      title="Delete Payment Record"
                      style={{ padding: "6px 8px", background: "#fee2e2", color: "var(--red)", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Credentials & Details Modal (ADMIN ONLY) */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Lock size={20} color="var(--red)" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Edit Vendor Credentials & Details</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20, marginTop: 4 }}>
              As Admin, you have full authority to update this vendor's login email, password, and contact profile.
            </p>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Store Name</label>
                <input required className="input" value={editFormData.store_name} onChange={e => setEditFormData({ ...editFormData, store_name: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Owner Full Name</label>
                <input required className="input" value={editFormData.owner_name} onChange={e => setEditFormData({ ...editFormData, owner_name: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>

              <div style={{ background: "#fef2f2", padding: 14, borderRadius: 10, border: "1px solid #fee2e2" }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--red)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={14} /> Vendor Login Credentials (Admin Editable)
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Login Email Address</label>
                  <input required type="email" className="input" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-300)", borderRadius: 8, background: "white" }} />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>New Password (Leave blank to keep existing)</label>
                  <input type="text" placeholder="Enter new password to change" className="input" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-300)", borderRadius: 8, background: "white" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Phone Number</label>
                <input placeholder="e.g. 03001234567" className="input" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8 }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Pickup / Business Address</label>
                <textarea rows={2} placeholder="Complete shop / pickup address" className="input" value={editFormData.address} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontFamily: "inherit" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: "10px 18px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button disabled={savingEdit} type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--gray-900)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: savingEdit ? "not-allowed" : "pointer" }}>
                  {savingEdit ? <Loader2 size={16} className="animate-spin" /> : null}
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rent Notice Modal */}
      {isRentModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CreditCard size={20} color="#16a34a" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Send Monthly Store Rent Invoice</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 18, marginTop: 4 }}>
              Manually dispatch a professional store rent invoice to <strong>{vendor.name}</strong>. Only triggers when you click.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  Store Monthly Rent Amount (PKR)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "var(--gray-500)", fontSize: 14 }}>
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 42px",
                      borderRadius: 8,
                      border: "1px solid var(--gray-300)",
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#16a34a"
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4, display: "block" }}>
                  You can change this PKR amount for this vendor before sending.
                </span>
              </div>

              {/* Deposit Bank Summary */}
              {rentSettings && (
                <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)", fontSize: 13 }}>
                  <div style={{ fontWeight: 800, color: "var(--gray-800)", marginBottom: 6 }}>Bank Deposit Info Included in Invoice:</div>
                  <div style={{ color: "var(--gray-600)", lineHeight: 1.5 }}>
                    <strong>Bank:</strong> {rentSettings.bank_name || "Meezan Bank Ltd"}<br />
                    <strong>Title:</strong> {rentSettings.account_title || "Dastiyab Store Official"}<br />
                    <strong>Account / IBAN:</strong> {rentSettings.account_number || "0102030405060708"}<br />
                    <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{rentSettings.instructions}</span>
                  </div>
                </div>
              )}

              {/* Recipient Details */}
              <div style={{ background: "#eff6ff", padding: 12, borderRadius: 8, border: "1px solid #dbeafe", fontSize: 13 }}>
                <div><strong>Recipient Email:</strong> {vendor.owner?.email || "No email"}</div>
                <div style={{ marginTop: 4 }}><strong>Recipient Phone / WhatsApp:</strong> {vendor.owner?.phone || <span style={{ color: "#dc2626" }}>No phone on record</span>}</div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setIsRentModalOpen(false)}
                  style={{ padding: "10px 16px", background: "var(--gray-100)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={sendingRent}
                  onClick={() => handleSendRentNotice(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: sendingRent ? "not-allowed" : "pointer"
                  }}
                >
                  {sendingRent ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send Email Invoice (PKR {Number(rentAmount).toLocaleString()})
                </button>

                {vendor.owner?.phone && (
                  <button
                    type="button"
                    disabled={sendingRent}
                    onClick={() => handleSendRentNotice(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 18px",
                      background: "#25d366",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: sendingRent ? "not-allowed" : "pointer"
                    }}
                  >
                    <MessageSquare size={16} />
                    Email + WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Rent Payment Modal (Calendar / Date-wise) */}
      {isRecordPaymentModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Calendar size={22} color="#15803d" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Record Rent Payment for {vendor.name}</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20 }}>
              Payment kis calendar date ko receive hui aur verify hui, enter karein.
            </p>

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Payment Date (Calendar) */}
              <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 800, fontSize: 13, color: "#166534" }}>
                  📅 Payment Date Received (Calendar) <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  required
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #86efac", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "white" }}
                />
              </div>

              {/* Billing Cycle & Amount */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                    Billing Cycle
                  </label>
                  <input
                    required
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
                    Transaction Reference
                  </label>
                  <input
                    placeholder="e.g. TRX-90142"
                    value={paymentForm.transactionRef}
                    onChange={e => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 13, fontFamily: "monospace" }}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>
                  Admin Notes / Remarks
                </label>
                <input
                  placeholder="e.g. Screenshot verified on WhatsApp"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid var(--gray-200)", borderRadius: 8, fontSize: 13 }}
                />
              </div>

              {/* Checkbox send receipt */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>
                <input
                  type="checkbox"
                  checked={paymentForm.sendReceiptEmail}
                  onChange={e => setPaymentForm({ ...paymentForm, sendReceiptEmail: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                Send official payment confirmation receipt email to {vendor.owner?.email}
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
                  {recordingPayment ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
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
