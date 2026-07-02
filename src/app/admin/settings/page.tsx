"use client";
import { useState, useEffect } from "react";
import { Store, Truck, Tag, CreditCard, Mail, Bell, Shield, Plus, Edit2, Trash2, X, AlertCircle, MapPin, Landmark, MessageCircle } from "lucide-react";

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

  // Coupons states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "", discount_type: "percentage", discount_value: 10,
    is_newsletter_coupon: false, is_active: true
  });

  // Marketing states
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [savingMarketing, setSavingMarketing] = useState(false);
  const [newsletterCouponId, setNewsletterCouponId] = useState<string | null>(null);
  const [newsletterDiscount, setNewsletterDiscount] = useState(10);
  const [newsletterCode, setNewsletterCode] = useState("WELCOME10");
  const [newsletterMaxUses, setNewsletterMaxUses] = useState(0);
  const [newsletterUsedCount, setNewsletterUsedCount] = useState(0);

  // SMTP Email Configuration states
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpSenderName, setSmtpSenderName] = useState("Dastiyab Store");
  const [adminEmail, setAdminEmail] = useState("");

  // Payment states
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [savingPayments, setSavingPayments] = useState(false);
  const [paymentCODEnabled, setPaymentCODEnabled] = useState(true);
  const [paymentBankEnabled, setPaymentBankEnabled] = useState(false);
  const [paymentBankDetails, setPaymentBankDetails] = useState({
    bankName: "", accountName: "", accountNumber: "", iban: "", instructions: ""
  });
  const [paymentJazzCashEnabled, setPaymentJazzCashEnabled] = useState(false);
  const [paymentJazzCashDetails, setPaymentJazzCashDetails] = useState({
    accountName: "", accountNumber: "", instructions: ""
  });
  const [paymentEasyPaisaEnabled, setPaymentEasyPaisaEnabled] = useState(false);
  const [paymentEasyPaisaDetails, setPaymentEasyPaisaDetails] = useState({
    accountName: "", accountNumber: "", instructions: ""
  });

  // Global states
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalFreeDeliveryActive, setGlobalFreeDeliveryActive] = useState(true);
  const [globalFreeDeliveryThreshold, setGlobalFreeDeliveryThreshold] = useState(2000);

  // Notification states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundEnabled(localStorage.getItem("admin_sound_notifications") !== "false");
      setPushEnabled(localStorage.getItem("admin_push_notifications") === "true");
    }
  }, []);

  const playTestChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.error("Test chime error:", e);
    }
  };

  // Security states
  const [loadingSecurity, setLoadingSecurity] = useState(true);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24 Hours");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Chatbot states
  const [loadingChatbot, setLoadingChatbot] = useState(true);
  const [savingChatbot, setSavingChatbot] = useState(false);
  const [chatbotApiKey, setChatbotApiKey] = useState("");
  const [chatbotModel, setChatbotModel] = useState("gemini-1.5-pro");
  const [chatbotEnabled, setChatbotEnabled] = useState(true);

  const tabs = [
    { label: "General", icon: <Store size={18} /> },
    { label: "Shipping & Delivery", icon: <Truck size={18} /> },
    { label: "Delivery Areas", icon: <MapPin size={18} /> },
    { label: "Coupons & Discounts", icon: <Tag size={18} /> },
    { label: "Payments", icon: <CreditCard size={18} /> },
    { label: "Emails & Marketing", icon: <Mail size={18} /> },
    { label: "Notifications", icon: <Bell size={18} /> },
    { label: "Security", icon: <Shield size={18} /> },
    { label: "AI Chatbot", icon: <MessageCircle size={18} /> },
  ];

  useEffect(() => {
    if (activeTab === "General") fetchGeneralSettings();
    else if (activeTab === "Shipping & Delivery") fetchShippingRules();
    else if (activeTab === "Delivery Areas") fetchDeliveryAreas();
    else if (activeTab === "Coupons & Discounts") fetchCoupons();
    else if (activeTab === "Emails & Marketing") fetchMarketingSettings();
    else if (activeTab === "Payments") fetchPaymentSettings();
    else if (activeTab === "Security") fetchSecuritySettings();
    else if (activeTab === "AI Chatbot") fetchChatbotSettings();
  }, [activeTab]);

  const fetchChatbotSettings = async () => {
    setLoadingChatbot(true);
    const res = await fetch("/api/admin/settings/store_settings?key=chatbot_settings");
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        try {
          const settings = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setChatbotApiKey(settings.apiKey || "");
          setChatbotModel(settings.model || "gemini-1.5-pro");
          setChatbotEnabled(settings.enabled !== false);
        } catch (e) {
          console.error("Failed to parse chatbot settings", e);
        }
      }
    }
    setLoadingChatbot(false);
  };

  const saveChatbotSettings = async () => {
    setSavingChatbot(true);
    const res = await fetch("/api/admin/settings/store_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "chatbot_settings",
        value: { apiKey: chatbotApiKey, model: chatbotModel, enabled: chatbotEnabled }
      })
    });
    setSavingChatbot(false);
    if (!res.ok) alert("Failed to save Chatbot settings");
    else alert("Chatbot settings saved successfully!");
  };

  const fetchGeneralSettings = async () => {
    setGlobalLoading(true);
    try {
      const res = await fetch("/api/settings/global");
      if (res.ok) {
        const data = await res.json();
        setGlobalFreeDeliveryActive(data.is_active);
        setGlobalFreeDeliveryThreshold(data.threshold);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGlobalLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    setGlobalSaving(true);
    try {
      const res = await fetch("/api/settings/global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: globalFreeDeliveryActive, threshold: globalFreeDeliveryThreshold })
      });
      if (!res.ok) throw new Error("Failed to save global settings");
      alert("General settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save general settings");
    } finally {
      setGlobalSaving(false);
    }
  };

  const fetchPaymentSettings = async () => {
    setLoadingPayments(true);
    const res = await fetch("/api/admin/settings/store_settings?key=payment_settings");
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        try {
          const settings = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setPaymentCODEnabled(settings.cod?.enabled ?? true);
          setPaymentBankEnabled(settings.bank?.enabled ?? false);
          if (settings.bank?.details) setPaymentBankDetails(settings.bank.details);
          setPaymentJazzCashEnabled(settings.jazzcash?.enabled ?? false);
          if (settings.jazzcash?.details) setPaymentJazzCashDetails(settings.jazzcash.details);
          setPaymentEasyPaisaEnabled(settings.easypaisa?.enabled ?? false);
          if (settings.easypaisa?.details) setPaymentEasyPaisaDetails(settings.easypaisa.details);
        } catch (e) {
          console.error("Failed to parse payment settings", e);
        }
      }
    }
    setLoadingPayments(false);
  };

  const savePaymentSettings = async () => {
    setSavingPayments(true);
    const payload = {
      cod: { enabled: paymentCODEnabled },
      bank: { enabled: paymentBankEnabled, details: paymentBankDetails },
      jazzcash: { enabled: paymentJazzCashEnabled, details: paymentJazzCashDetails },
      easypaisa: { enabled: paymentEasyPaisaEnabled, details: paymentEasyPaisaDetails }
    };
    const res = await fetch("/api/admin/settings/store_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "payment_settings", value: payload })
    });
    
    setSavingPayments(false);
    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to save payment settings:", data.error);
      alert("Failed to save payment settings: " + data.error);
    } else {
      alert("Payment settings saved successfully!");
    }
  };

  const fetchSecuritySettings = async () => {
    setLoadingSecurity(true);
    const res = await fetch("/api/admin/settings/store_settings?key=security_settings");
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        try {
          const settings = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setTwoFactorEnabled(settings.twoFactorEnabled ?? false);
          setSessionTimeout(settings.sessionTimeout ?? "24 Hours");
        } catch (e) {
          console.error("Failed to parse security settings", e);
        }
      }
    }
    setLoadingSecurity(false);
  };

  const saveSecuritySettings = async () => {
    setSavingSecurity(true);
    const payload = {
      twoFactorEnabled,
      sessionTimeout
    };
    await fetch("/api/admin/settings/store_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "security_settings", value: payload })
    });
    setSavingSecurity(false);
    alert("Security settings saved!");
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Please enter both current and new password");
      return;
    }
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }
    
    setPasswordLoading(true);

    let userEmail = "admin@dastiyab.com";
    try {
      const sessionStr = localStorage.getItem("customer_session");
      if (sessionStr) {
        const sessionObj = JSON.parse(sessionStr);
        if (sessionObj && sessionObj.email) userEmail = sessionObj.email;
      }
    } catch(e) {}
    
    const res = await fetch("/api/admin/settings/admin_user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, userEmail })
    });
    
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update password");
      setPasswordLoading(false);
      return;
    }
    
    setPasswordLoading(false);
    alert("Password updated successfully! You can use this new password on the login screen.");
    setCurrentPassword("");
    setNewPassword("");
  };

  const fetchMarketingSettings = async () => {
    const resSettings = await fetch("/api/admin/settings/store_settings?key=newsletter_enabled");
    if (resSettings.ok) {
      const data = await resSettings.json();
      if (data) setNewsletterEnabled(data.value === true || data.value === 'true');
    }
    
    const resCoupon = await fetch("/api/admin/settings/coupons?is_newsletter_coupon=true");
    if (resCoupon.ok) {
      const couponData = await resCoupon.json();
      if (couponData) {
        setNewsletterCouponId(couponData.id);
        setNewsletterDiscount(couponData.discount_value);
        setNewsletterCode(couponData.code);
        setNewsletterMaxUses(couponData.max_uses || 0);
        setNewsletterUsedCount(couponData.used_count || 0);
      }
    }

    // Load SMTP Settings
    const resSmtp = await fetch("/api/admin/settings/store_settings?key=smtp_settings");
    if (resSmtp.ok) {
      const smtpData = await resSmtp.json();
      if (smtpData && smtpData.value) {
        try {
          const settings = typeof smtpData.value === "string" ? JSON.parse(smtpData.value) : smtpData.value;
          if (settings.host) setSmtpHost(settings.host);
          if (settings.port) setSmtpPort(Number(settings.port));
          if (settings.user) setSmtpUser(settings.user);
          if (settings.password) setSmtpPassword(settings.password);
          if (settings.senderName) setSmtpSenderName(settings.senderName);
          if (settings.adminEmail) setAdminEmail(settings.adminEmail);
        } catch (e) {
          console.error("Failed to parse smtp settings:", e);
        }
      }
    }
  };

  const saveMarketingSettings = async () => {
    setSavingMarketing(true);
    const resSettings = await fetch("/api/admin/settings/store_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "newsletter_enabled", value: newsletterEnabled })
    });
    
    if (!resSettings.ok) {
      const data = await resSettings.json();
      alert("Failed to save settings: " + data.error);
      setSavingMarketing(false);
      return;
    }
    
    const couponPayload = {
      code: newsletterCode.toUpperCase().trim(),
      discount_type: "percentage",
      discount_value: newsletterDiscount,
      is_newsletter_coupon: true,
      is_active: true,
      max_uses: newsletterMaxUses
    };
    
    if (newsletterCouponId) {
      const res = await fetch("/api/admin/settings/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newsletterCouponId, ...couponPayload })
      });
      if (!res.ok) {
        const data = await res.json();
        alert("Failed to update coupon: " + data.error);
        setSavingMarketing(false);
        return;
      }
    } else {
      const res = await fetch("/api/admin/settings/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponPayload)
      });
      if (!res.ok) {
        const data = await res.json();
        alert("Failed to create coupon: " + data.error);
        setSavingMarketing(false);
        return;
      }
      const data = await res.json();
      if (data) setNewsletterCouponId(data.id);
    }

    // Save SMTP Settings
    const smtpPayload = {
      host: smtpHost,
      port: Number(smtpPort),
      user: smtpUser,
      password: smtpPassword,
      senderName: smtpSenderName,
      adminEmail: adminEmail
    };
    const resSmtp = await fetch("/api/admin/settings/store_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "smtp_settings", value: smtpPayload })
    });

    setSavingMarketing(false);
    if (!resSmtp.ok) {
      const data = await resSmtp.json();
      alert("Failed to save SMTP settings: " + data.error);
    } else {
      alert("Marketing & SMTP settings saved successfully!");
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    const res = await fetch("/api/admin/settings/coupons");
    if (res.ok) {
      const data = await res.json();
      setCoupons(data);
    }
    setLoadingCoupons(false);
  };

  const fetchShippingRules = async () => {
    setLoadingRules(true);
    try {
      const res = await fetch("/api/admin/settings/shipping");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setShippingRules(data);
        } else {
          setShippingRules([
            { id: "1", name: "Karachi Local", city: "Karachi", base_fee: 150, per_km_fee: 15, free_delivery_threshold: 2000, free_delivery_km: 15, free_areas: "Clifton, DHA, Gulshan-e-Iqbal, PECHS, Bahadurabad", estimated_days: "1-2 Business Days", is_active: true },
            { id: "2", name: "Rest of Pakistan (Default)", city: "Default", base_fee: 250, per_km_fee: 0, free_delivery_threshold: 3000, free_delivery_km: null, free_areas: "", estimated_days: "3-5 Business Days", is_active: true }
          ]);
        }
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
      const res = await fetch("/api/admin/settings/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRule.id, ...payload })
      });

      if (res.ok) {
        alert("Shipping rule updated successfully!");
        setEditingRule(null);
        fetchShippingRules();
      } else {
        const data = await res.json();
        alert("Failed to update: " + data.error);
      }
    } else {
      const res = await fetch("/api/admin/settings/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Shipping rule created successfully!");
        setShowAddRuleModal(false);
        fetchShippingRules();
      } else {
        const data = await res.json();
        alert("Failed to insert: " + data.error);
      }
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping rule?")) return;
    const res = await fetch(`/api/admin/settings/shipping?id=${id}`, { method: "DELETE" });

    if (res.ok) {
      alert("Deleted rule.");
      fetchShippingRules();
    } else {
      const data = await res.json();
      alert("Failed to delete: " + data.error);
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
      const res = await fetch("/api/admin/settings/delivery_areas");
      if (res.ok) {
        const data = await res.json();
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
      const res = await fetch("/api/admin/settings/delivery_areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingArea.id, ...payload })
      });
      if (res.ok) {
        setEditingArea(null);
        setShowAddAreaModal(false);
        fetchDeliveryAreas();
      } else {
        const data = await res.json();
        alert("Failed to update: " + data.error);
      }
    } else {
      const res = await fetch("/api/admin/settings/delivery_areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddAreaModal(false);
        fetchDeliveryAreas();
      } else {
        const data = await res.json();
        alert("Failed to insert: " + data.error);
      }
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) return;
    const res = await fetch(`/api/admin/settings/delivery_areas?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchDeliveryAreas();
    } else {
      const data = await res.json();
      alert("Failed to delete: " + data.error);
    }
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

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: couponForm.code.toUpperCase().trim(), discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value), is_newsletter_coupon: couponForm.is_newsletter_coupon,
      is_active: couponForm.is_active
    };
    
    const res = await fetch("/api/admin/settings/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Coupon created successfully!");
      setShowAddCouponModal(false);
      fetchCoupons();
    } else {
      const data = await res.json();
      alert("Failed to insert: " + data.error);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/settings/coupons?id=${id}`, { method: "DELETE" });
    if (res.ok) { alert("Deleted coupon."); fetchCoupons(); }
    else {
      const data = await res.json();
      alert("Failed to delete: " + data.error);
    }
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

              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Global Promos & Settings</h2>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--gray-50)", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>Free Delivery Promotion</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>Show free delivery text on the site and apply at checkout.</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={globalFreeDeliveryActive} onChange={(e) => setGlobalFreeDeliveryActive(e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  {globalFreeDeliveryActive && (
                    <div>
                      <label className="label">Free Delivery Threshold (Rs.)</label>
                      <input type="number" className="input" value={globalFreeDeliveryThreshold} onChange={(e) => setGlobalFreeDeliveryThreshold(Number(e.target.value))} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-red" onClick={saveGeneralSettings} disabled={globalSaving}>
                  {globalSaving ? "Saving..." : "Save Changes"}
                </button>
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

          {activeTab === "Coupons & Discounts" && (
            <div>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Coupons & Discounts</h2>
                  <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Manage active coupons and your special Newsletter Welcome Coupon.</p>
                </div>
                <button onClick={() => { setCouponForm({ code: "", discount_type: "percentage", discount_value: 10, is_newsletter_coupon: false, is_active: true }); setShowAddCouponModal(true); }} className="btn-red" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}>
                  <Plus size={16} /> Add Coupon
                </button>
              </div>

              <div style={{ padding: "24px 32px" }}>
                {loadingCoupons ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading coupons...</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>CODE</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>DISCOUNT</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>NEWSLETTER COUPON?</th>
                          <th style={{ padding: "12px 16px", color: "var(--gray-500)", fontWeight: 700 }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: "center", padding: 30, color: "var(--gray-500)" }}>No coupons found. Create one!</td></tr>
                        ) : coupons.map((c) => (
                          <tr key={c.id} style={{ borderBottom: "1px solid var(--gray-150)", background: c.is_active ? "transparent" : "#f9fafb" }}>
                            <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--red)" }}>
                              {c.code}
                              {!c.is_active && <span style={{ marginLeft: 6, fontSize: 10, background: "var(--gray-200)", padding: "2px 6px", borderRadius: 4, color: "var(--gray-600)" }}>INACTIVE</span>}
                            </td>
                            <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                              {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `Rs ${c.discount_value} OFF`}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              {c.is_newsletter_coupon ? <span style={{ color: "#22c55e", fontWeight: 700 }}>YES</span> : <span style={{ color: "var(--gray-400)" }}>NO</span>}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <button onClick={() => handleDeleteCoupon(c.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--red)" }}>
                                <Trash2 size={16} />
                              </button>
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

          {activeTab === "Emails & Marketing" && (
            <div>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Emails & Marketing</h2>
                <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Manage newsletter visibility and email preferences.</p>
              </div>

              <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* Newsletter & Homepage CTA block */}
                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid var(--gray-200)" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Newsletter & Homepage CTA</h3>
                      <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>Control the discount offer section on the homepage.</p>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                      <div style={{ position: "relative" }}>
                        <input type="checkbox" className="sr-only" checked={newsletterEnabled} onChange={e => setNewsletterEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
                        <div style={{ width: 44, height: 24, background: newsletterEnabled ? "var(--gray-900)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                        <div style={{ position: "absolute", top: 2, left: newsletterEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>Visible on Homepage</span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Discount Percentage (%)</label>
                      <input type="number" className="input" value={newsletterDiscount} onChange={e => setNewsletterDiscount(Number(e.target.value))} style={{ padding: "12px 16px", background: "white" }} />
                      <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 8 }}>Shows as "Get {newsletterDiscount}% off" on the homepage.</p>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Discount Code</label>
                      <input type="text" className="input" value={newsletterCode} onChange={e => setNewsletterCode(e.target.value.toUpperCase())} style={{ padding: "12px 16px", background: "white" }} />
                      <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 8 }}>This code is sent to subscribers via email.</p>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Max Uses (0 = Unlimited)</label>
                      <input type="number" className="input" value={newsletterMaxUses} onChange={e => setNewsletterMaxUses(Number(e.target.value))} style={{ padding: "12px 16px", background: "white" }} />
                      <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 8 }}>Used so far: {newsletterUsedCount}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: 16, borderRadius: 8 }}>
                    <div style={{ width: 32, height: 32, background: "var(--gray-900)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Mail size={16} color="white" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>How it works</h4>
                      <p style={{ fontSize: 12, color: "var(--gray-600)", lineHeight: 1.5 }}>
                        When a user enters their email on the homepage and clicks "Claim Discount", they instantly receive an email containing the <strong>{newsletterCode}</strong> code. The same code works on the checkout page.
                      </p>
                    </div>
                  </div>

                </div>

                {/* SMTP Configuration block */}
                <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid var(--gray-200)" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>SMTP Email Configuration</h3>
                      <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>Configure the mail server settings used to send orders and support emails.</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>SMTP Host</label>
                      <input type="text" className="input" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} style={{ padding: "12px 16px", background: "white" }} placeholder="e.g. smtp.gmail.com" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>SMTP Port</label>
                      <input type="number" className="input" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} style={{ padding: "12px 16px", background: "white" }} placeholder="e.g. 465 or 587" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>SMTP Username / Email</label>
                      <input type="email" className="input" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} style={{ padding: "12px 16px", background: "white" }} placeholder="e.g. user@gmail.com" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>SMTP Password / App Password</label>
                      <input type="password" className="input" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} style={{ padding: "12px 16px", background: "white" }} placeholder="App Password" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Sender Name</label>
                      <input type="text" className="input" value={smtpSenderName} onChange={e => setSmtpSenderName(e.target.value)} style={{ padding: "12px 16px", background: "white" }} placeholder="e.g. Dastiyab Store" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin Notification Email</label>
                      <input type="email" className="input" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ padding: "12px 16px", background: "white" }} placeholder="inbox to receive customer inquiries" />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, background: "var(--gray-50)", border: "1px solid var(--gray-200)", padding: 16, borderRadius: 8 }}>
                    <div style={{ width: 32, height: 32, background: "var(--gray-900)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Shield size={16} color="white" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>Gmail App Password Notice</h4>
                      <p style={{ fontSize: 12, color: "var(--gray-600)", lineHeight: 1.5 }}>
                        If you are using Gmail, generate an <strong>App Password</strong> in your Google Account. Pre-filled with your provided test app password.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)" }}>
                <button onClick={saveMarketingSettings} disabled={savingMarketing} className="btn-red">
                  {savingMarketing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Payments" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Payment Providers</h2>
                <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Manage and configure payment methods for your store.</p>
              </div>

              <div style={{ padding: "24px 32px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                {loadingPayments ? (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--gray-400)" }}>Loading payment settings...</div>
                ) : (
                  <>
                    {/* COD */}
                    <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden", background: "white" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 32, background: "#111827", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800 }}>COD</div>
                          <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Cash on Delivery</h4>
                            <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Allow customers to pay when they receive their order.</p>
                          </div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                          <div style={{ position: "relative" }}>
                            <input type="checkbox" className="sr-only" checked={paymentCODEnabled} onChange={e => setPaymentCODEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                            <div style={{ width: 44, height: 24, background: paymentCODEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                            <div style={{ position: "absolute", top: 2, left: paymentCODEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden", background: "white" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 32, background: "#059669", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Landmark size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Bank Transfer</h4>
                            <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Customer transfers amount directly to your bank account.</p>
                          </div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                          <div style={{ position: "relative" }}>
                            <input type="checkbox" className="sr-only" checked={paymentBankEnabled} onChange={e => setPaymentBankEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                            <div style={{ width: 44, height: 24, background: paymentBankEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                            <div style={{ position: "absolute", top: 2, left: paymentBankEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                          </div>
                        </label>
                      </div>
                      {paymentBankEnabled && (
                        <div style={{ padding: "0 20px 20px 20px", borderTop: "1px solid var(--gray-100)", marginTop: 4, paddingTop: 20 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Bank Name</label>
                              <input className="input" placeholder="e.g. Meezan Bank" value={paymentBankDetails.bankName} onChange={e => setPaymentBankDetails({...paymentBankDetails, bankName: e.target.value})} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Account Name</label>
                              <input className="input" placeholder="e.g. John Doe" value={paymentBankDetails.accountName} onChange={e => setPaymentBankDetails({...paymentBankDetails, accountName: e.target.value})} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Account Number</label>
                              <input className="input" placeholder="e.g. 0123456789" value={paymentBankDetails.accountNumber} onChange={e => setPaymentBankDetails({...paymentBankDetails, accountNumber: e.target.value})} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>IBAN (Optional)</label>
                              <input className="input" placeholder="e.g. PK00MZN0000..." value={paymentBankDetails.iban} onChange={e => setPaymentBankDetails({...paymentBankDetails, iban: e.target.value})} />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Additional Instructions (Optional)</label>
                            <input className="input" placeholder="e.g. After transfer, send screenshot to WhatsApp" value={paymentBankDetails.instructions} onChange={e => setPaymentBankDetails({...paymentBankDetails, instructions: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* JazzCash */}
                    <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden", background: "white" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 32, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid var(--gray-200)" }}>
                            <img src="/jazzcash.png" alt="JazzCash" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>JazzCash</h4>
                            <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Customer transfers amount to your JazzCash mobile account.</p>
                          </div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                          <div style={{ position: "relative" }}>
                            <input type="checkbox" className="sr-only" checked={paymentJazzCashEnabled} onChange={e => setPaymentJazzCashEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                            <div style={{ width: 44, height: 24, background: paymentJazzCashEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                            <div style={{ position: "absolute", top: 2, left: paymentJazzCashEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                          </div>
                        </label>
                      </div>
                      {paymentJazzCashEnabled && (
                        <div style={{ padding: "0 20px 20px 20px", borderTop: "1px solid var(--gray-100)", marginTop: 4, paddingTop: 20 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Account Name</label>
                              <input className="input" placeholder="e.g. John Doe" value={paymentJazzCashDetails.accountName} onChange={e => setPaymentJazzCashDetails({...paymentJazzCashDetails, accountName: e.target.value})} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Mobile Number</label>
                              <input className="input" placeholder="e.g. 03001234567" value={paymentJazzCashDetails.accountNumber} onChange={e => setPaymentJazzCashDetails({...paymentJazzCashDetails, accountNumber: e.target.value})} />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Additional Instructions (Optional)</label>
                            <input className="input" placeholder="e.g. Send a screenshot of the confirmation SMS" value={paymentJazzCashDetails.instructions} onChange={e => setPaymentJazzCashDetails({...paymentJazzCashDetails, instructions: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* EasyPaisa */}
                    <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden", background: "white" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 32, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid var(--gray-200)" }}>
                            <img src="/easypaisa.png" alt="EasyPaisa" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>EasyPaisa</h4>
                            <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Customer transfers amount to your EasyPaisa mobile account.</p>
                          </div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                          <div style={{ position: "relative" }}>
                            <input type="checkbox" className="sr-only" checked={paymentEasyPaisaEnabled} onChange={e => setPaymentEasyPaisaEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                            <div style={{ width: 44, height: 24, background: paymentEasyPaisaEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                            <div style={{ position: "absolute", top: 2, left: paymentEasyPaisaEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                          </div>
                        </label>
                      </div>
                      {paymentEasyPaisaEnabled && (
                        <div style={{ padding: "0 20px 20px 20px", borderTop: "1px solid var(--gray-100)", marginTop: 4, paddingTop: 20 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Account Name</label>
                              <input className="input" placeholder="e.g. John Doe" value={paymentEasyPaisaDetails.accountName} onChange={e => setPaymentEasyPaisaDetails({...paymentEasyPaisaDetails, accountName: e.target.value})} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Mobile Number</label>
                              <input className="input" placeholder="e.g. 03001234567" value={paymentEasyPaisaDetails.accountNumber} onChange={e => setPaymentEasyPaisaDetails({...paymentEasyPaisaDetails, accountNumber: e.target.value})} />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 6 }}>Additional Instructions (Optional)</label>
                            <input className="input" placeholder="e.g. Send a screenshot of the confirmation SMS" value={paymentEasyPaisaDetails.instructions} onChange={e => setPaymentEasyPaisaDetails({...paymentEasyPaisaDetails, instructions: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)" }}>
                <button onClick={savePaymentSettings} disabled={savingPayments} className="btn-red" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {savingPayments ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}


          {activeTab === "Notifications" && (
            <div>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Order Alerts & Notifications</h2>
                <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>Configure real-time alerts when new orders are placed on your store.</p>
              </div>

              <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Sound Alerts */}
                <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 20, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: "var(--gray-50)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-700)", border: "1px solid var(--gray-200)" }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Sound Chime Alerts</h4>
                      <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Play a live chime sound in the admin panel as soon as a customer completes an order.</p>
                      
                      <button 
                        onClick={playTestChime} 
                        style={{
                          marginTop: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          background: "var(--gray-100)",
                          border: "1px solid var(--gray-200)",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--gray-700)",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-200)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "var(--gray-100)"}
                      >
                        Play Test Sound
                      </button>
                    </div>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={soundEnabled} 
                        onChange={e => {
                          const val = e.target.checked;
                          setSoundEnabled(val);
                          localStorage.setItem("admin_sound_notifications", String(val));
                        }} 
                        style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} 
                      />
                      <div style={{ width: 44, height: 24, background: soundEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                      <div style={{ position: "absolute", top: 2, left: soundEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                    </div>
                  </label>
                </div>

                {/* Push Notifications */}
                <div style={{ border: "1px solid var(--gray-200)", borderRadius: 12, padding: 20, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: "var(--gray-50)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-700)", border: "1px solid var(--gray-200)" }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>Desktop Push Notifications</h4>
                      <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Show browser desktop notifications even when you are working in another tab or the admin panel is minimized.</p>
                      
                      <div style={{ marginTop: 8, fontSize: 11, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>Status:</span>
                        {typeof window !== "undefined" && "Notification" in window ? (
                          Notification.permission === "granted" ? (
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>Granted (Allowed)</span>
                          ) : Notification.permission === "denied" ? (
                            <span style={{ color: "var(--red)", fontWeight: 700 }}>Denied (Blocked by browser settings)</span>
                          ) : (
                            <span style={{ color: "#ca8a04", fontWeight: 700 }}>Default (Not requested yet)</span>
                          )
                        ) : (
                          <span style={{ color: "var(--red)", fontWeight: 700 }}>Not supported in this browser</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={pushEnabled} 
                        onChange={e => {
                          const val = e.target.checked;
                          if (val) {
                            if (typeof window !== "undefined" && "Notification" in window) {
                              Notification.requestPermission().then(permission => {
                                if (permission === "granted") {
                                  setPushEnabled(true);
                                  localStorage.setItem("admin_push_notifications", "true");
                                  alert("System desktop notifications enabled successfully!");
                                } else {
                                  setPushEnabled(false);
                                  localStorage.setItem("admin_push_notifications", "false");
                                  alert("Notification permission denied or dismissed. Please enable permissions manually in your browser address bar.");
                                }
                              });
                            } else {
                              alert("Notifications are not supported in this browser.");
                            }
                          } else {
                            setPushEnabled(false);
                            localStorage.setItem("admin_push_notifications", "false");
                          }
                        }} 
                        style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} 
                      />
                      <div style={{ width: 44, height: 24, background: pushEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 999, transition: "background 0.2s" }}></div>
                      <div style={{ position: "absolute", top: 2, left: pushEnabled ? 22 : 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)" }}>
                <button onClick={() => alert("Notification settings saved successfully!")} className="btn-red">
                  Save Changes
                </button>
              </div>
            </div>
          )}
          {activeTab === "Security" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-200)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)" }}>Security Settings</h2>
              </div>
              
              <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>
                {loadingSecurity ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading security settings...</div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 24, border: "1px solid var(--gray-200)", borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-900)" }}>Two-Factor Authentication (2FA)</div>
                        <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>Require a secondary code when logging into the admin panel.</div>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input type="checkbox" style={{ display: "none" }} checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} />
                        <div style={{ width: 44, height: 24, background: twoFactorEnabled ? "var(--red)" : "var(--gray-300)", borderRadius: 12, position: "relative", transition: "background 0.2s" }}>
                          <div style={{ width: 20, height: 20, background: "white", borderRadius: "50%", position: "absolute", top: 2, left: twoFactorEnabled ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="label">Admin Session Timeout</label>
                      <select className="input" style={{ maxWidth: 300 }} value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                        <option value="1 Hour">1 Hour</option>
                        <option value="2 Hours">2 Hours</option>
                        <option value="4 Hours">4 Hours</option>
                        <option value="8 Hours">8 Hours</option>
                        <option value="12 Hours">12 Hours</option>
                        <option value="16 Hours">16 Hours</option>
                        <option value="24 Hours">24 Hours</option>
                      </select>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 8 }}>Automatically log out inactive administrators after this duration.</div>
                    </div>

                    <div className="divider" />

                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)", marginBottom: 16 }}>Change Password</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                        <input 
                          type="password" 
                          className="input" 
                          placeholder="Current Password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input 
                          type="password" 
                          className="input" 
                          placeholder="New Password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button 
                          onClick={handleUpdatePassword} 
                          disabled={passwordLoading}
                          className="btn-red" 
                          style={{ alignSelf: "flex-start", marginTop: 8 }}
                        >
                          {passwordLoading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)" }}>
                <button onClick={saveSecuritySettings} disabled={savingSecurity} className="btn-red" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {savingSecurity ? "Saving..." : "Save Changes"}

                </button>
              </div>
            </div>
          )}

          {activeTab === "AI Chatbot" && (
            <div className="animate-fade-up">
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>AI Chatbot Settings</h2>
                <p style={{ color: "var(--gray-500)", fontSize: 14, marginTop: 4 }}>Configure your Gemini AI assistant.</p>
              </div>
              
              {loadingChatbot ? (
                <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }}></div></div>
              ) : (
                <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--gray-50)", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>Enable AI Chatbot</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>Show the AI assistant on the store front.</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={chatbotEnabled} onChange={(e) => setChatbotEnabled(e.target.checked)} />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div>
                    <label className="label">Gemini API Key</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="AIzaSy..." 
                      value={chatbotApiKey} 
                      onChange={(e) => setChatbotApiKey(e.target.value)} 
                    />
                    <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 6 }}>Get your API key from Google AI Studio.</p>
                  </div>

                  <div>
                    <label className="label">Gemini Model</label>
                    <select className="input" value={chatbotModel} onChange={e => setChatbotModel(e.target.value)}>
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                      <option value="gemini-3.1-pro">Gemini 3.1 Pro</option>
                      <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
                    </select>
                  </div>

                </div>
              )}

              <div style={{ padding: "20px 32px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)" }}>
                <button onClick={saveChatbotSettings} disabled={savingChatbot} className="btn-red" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {savingChatbot ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {activeTab !== "General" && activeTab !== "Shipping & Delivery" && activeTab !== "Delivery Areas" && activeTab !== "Coupons & Discounts" && activeTab !== "Emails & Marketing" && activeTab !== "Payments" && activeTab !== "Notifications" && activeTab !== "Security" && activeTab !== "AI Chatbot" && (
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

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={() => setShowAddCouponModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div className="animate-scale-in" style={{
            position: "relative", width: "100%", maxWidth: 400, background: "white", borderRadius: 16,
            boxShadow: "var(--shadow-xl)", overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Add New Coupon</h3>
              <button onClick={() => setShowAddCouponModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCoupon}>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="label">Coupon Code *</label>
                  <input className="input" required placeholder="e.g. WELCOME10" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Discount Type *</label>
                    <select className="input" value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Value *</label>
                    <input className="input" type="number" required value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, background: "var(--gray-50)", padding: 12, borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                  <input type="checkbox" id="newsletter-coupon" checked={couponForm.is_newsletter_coupon} onChange={e => setCouponForm({ ...couponForm, is_newsletter_coupon: e.target.checked })} style={{ cursor: "pointer", width: 16, height: 16 }} />
                  <label htmlFor="newsletter-coupon" style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)", cursor: "pointer", lineHeight: 1.4 }}>
                    Set as Newsletter Welcome Coupon
                    <span style={{ display: "block", fontSize: 11, color: "var(--gray-500)", fontWeight: 400 }}>This code will be shown to users when they subscribe via the footer.</span>
                  </label>
                </div>

              </div>

              <div style={{ padding: "16px 24px", background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--gray-200)" }}>
                <button type="button" onClick={() => setShowAddCouponModal(false)} className="btn-ghost" style={{ border: "1px solid var(--gray-300)" }}>Cancel</button>
                <button type="submit" className="btn-red">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
