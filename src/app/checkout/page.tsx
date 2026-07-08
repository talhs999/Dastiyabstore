"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, User, MapPin, Phone, Mail, Zap, Truck, Shield, ChevronRight, Loader2, Landmark } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { useSettings } from "@/components/SettingsProvider";

const steps = ["Shipping", "Review", "Confirm"];

const DEFAULT_SHIPPING_RULES = [
  { 
    id: "1", 
    name: "Karachi Local", 
    city: "Karachi", 
    base_fee: 150, 
    per_km_fee: 15, 
    free_delivery_threshold: 2000, 
    free_delivery_km: 15, 
    free_areas: "Clifton, DHA, Gulshan-e-Iqbal, PECHS, Bahadurabad", 
    estimated_days: "1-2 Business Days", 
    is_active: true 
  },
  { 
    id: "2", 
    name: "Rest of Pakistan (Default)", 
    city: "Default", 
    base_fee: 250, 
    per_km_fee: 0, 
    free_delivery_threshold: 3000, 
    free_delivery_km: null, 
    free_areas: "", 
    estimated_days: "3-5 Business Days", 
    is_active: true 
  }
];

const DEFAULT_KARACHI_AREAS = [
  { name: "Model Colony / Malir Cantt", distance: 0 },
  { name: "Malir Halt / Malir City", distance: 3 },
  { name: "Scheme 33 / Safari Park", distance: 5 },
  { name: "Korangi", distance: 7 },
  { name: "Landhi", distance: 9 },
  { name: "Gulistan-e-Jauhar", distance: 7 },
  { name: "Gulshan-e-Iqbal", distance: 10 },
  { name: "Bahadurabad / PECHS", distance: 12 },
  { name: "Saddar / City Area", distance: 15 },
  { name: "Federal B Area / Nazimabad", distance: 15 },
  { name: "North Nazimabad", distance: 18 },
  { name: "Clifton", distance: 18 },
  { name: "DHA (Phase 1-6)", distance: 20 },
  { name: "DHA (Phase 7-8)", distance: 25 },
  { name: "North Karachi / Surjani Town", distance: 25 },
  { name: "Orangi / Baldia Town", distance: 22 },
  { name: "Karsaz / Shahrah-e-Faisal", distance: 10 },
  { name: "SMCHS / Shaheed-e-Millat", distance: 13 },
  { name: "Bin Qasim / Steel Town", distance: 12 },
  { name: "Bahria Town Karachi", distance: 30 },
  { name: "Other Area", distance: 15 },
];

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Abbottabad",
  "Bahawalpur",
  "Chiniot",
  "Dera Ghazi Khan",
  "Gujranwala",
  "Gujrat",
  "Hyderabad",
  "Jhang",
  "Kasur",
  "Larkana",
  "Mardan",
  "Mingora",
  "Mirpur (AJK)",
  "Nawabshah",
  "Okara",
  "Rahim Yar Khan",
  "Sahiwal",
  "Sargodha",
  "Sheikhupura",
  "Sialkot",
  "Sukkur",
  "Wah Cantonment",
  "Other (Specify)"
];

export default function CheckoutPage() {
  const { freeDelivery } = useSettings();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", notes: "" });
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { items, totalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic shipping states
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [karachiAreas, setKarachiAreas] = useState<any[]>(DEFAULT_KARACHI_AREAS);
  const [selectedArea, setSelectedArea] = useState<string>("Model Colony / Malir Cantt");
  const [customDistance, setCustomDistance] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(150);
  const [shippingExplanation, setShippingExplanation] = useState<string>("");
  const [estimatedDays, setEstimatedDays] = useState<string>("2-3 Business Days");

  const [dropdownCity, setDropdownCity] = useState<string>("");
  const [customCity, setCustomCity] = useState<string>("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Payment states
  const [paymentSettings, setPaymentSettings] = useState<any>({
    cod: { enabled: true },
    bank: { enabled: false, details: {} },
    jazzcash: { enabled: false, details: {} },
    easypaisa: { enabled: false, details: {} }
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("COD");


  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Load customer session details for checkout pre-filling
  useEffect(() => {
    const sessionStr = typeof window !== "undefined" && localStorage.getItem("customer_session");
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        setForm(p => ({
          ...p,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        }));

        if (user.city) {
          if (PAKISTAN_CITIES.includes(user.city)) {
            setDropdownCity(user.city);
          } else {
            setDropdownCity("Other (Specify)");
            setCustomCity(user.city);
          }
        }
      } catch (e) {
        console.error("Error loading prefill data:", e);
      }
    }
  }, []);

  // Sync form.city with dropdownCity/customCity selection
  useEffect(() => {
    if (dropdownCity === "Other (Specify)") {
      set("city", customCity.trim());
    } else {
      set("city", dropdownCity);
    }
  }, [dropdownCity, customCity]);

  // 1. Fetch Shipping Rules & Delivery Areas on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/checkout/config");
        if (!res.ok) throw new Error("Failed to load config");
        const data = await res.json();

        if (data.rules && data.rules.length > 0) {
          setShippingRules(data.rules);
        } else {
          setShippingRules(DEFAULT_SHIPPING_RULES);
        }

        if (data.areas && data.areas.length > 0) {
          setKarachiAreas(data.areas);
        }

        if (data.paymentSettings) {
          const settings = data.paymentSettings;
          setPaymentSettings(settings);
          
          if (settings.cod?.enabled) setSelectedPaymentMethod("COD");
          else if (settings.bank?.enabled) setSelectedPaymentMethod("Bank Transfer");
          else if (settings.jazzcash?.enabled) setSelectedPaymentMethod("JazzCash");
          else if (settings.easypaisa?.enabled) setSelectedPaymentMethod("EasyPaisa");
        }
      } catch (err) {
        console.error("Failed to fetch checkout config:", err);
        setShippingRules(DEFAULT_SHIPPING_RULES);
      }
    }
    loadData();
  }, []);

  // Handle COD availability based on City
  useEffect(() => {
    const isKarachi = form.city.toLowerCase() === "karachi";
    if (!isKarachi && selectedPaymentMethod === "COD") {
      // Find the first available alternative payment method
      if (paymentSettings?.bank?.enabled) setSelectedPaymentMethod("Bank Transfer");
      else if (paymentSettings?.jazzcash?.enabled) setSelectedPaymentMethod("JazzCash");
      else if (paymentSettings?.easypaisa?.enabled) setSelectedPaymentMethod("EasyPaisa");
      else setSelectedPaymentMethod(""); // fallback if no other options
    }
  }, [form.city, selectedPaymentMethod, paymentSettings]);

  // 2. Recalculate Shipping Fee dynamically
  useEffect(() => {
    if (!form.city) {
      setShippingFee(0);
      setShippingExplanation("Select city to calculate shipping.");
      setEstimatedDays("2-3 Business Days");
      return;
    }

    // Find rule for selected city
    let rule = shippingRules.find(r => r.city.toLowerCase() === form.city.toLowerCase());
    
    // Fallback to Default rule if city rule not found
    if (!rule) {
      rule = shippingRules.find(r => r.city.toLowerCase() === "default") || 
             shippingRules.find(r => r.name.toLowerCase().includes("default")) ||
             DEFAULT_SHIPPING_RULES[1];
    }

    if (!rule) {
      setShippingFee(250);
      setShippingExplanation("Standard countrywide shipping applied.");
      setEstimatedDays("3-5 Business Days");
      return;
    }

    setEstimatedDays(rule.estimated_days || "2-3 Business Days");

    const baseFee = Number(rule.base_fee) || 0;
    const perKmFee = Number(rule.per_km_fee) || 0;
    const freeThreshold = Number(rule.free_delivery_threshold) || Infinity;
    const freeMaxKm = rule.free_delivery_km !== null && rule.free_delivery_km !== undefined ? Number(rule.free_delivery_km) : null;
    const freeAreasList = rule.free_areas ? rule.free_areas.split(",").map((a: string) => a.trim().toLowerCase()) : [];

    // Calculate distance for Karachi local rule
    let distance = 0;
    if (form.city.toLowerCase() === "karachi") {
      const areaObj = karachiAreas.find(a => a.name === selectedArea);
      distance = areaObj ? areaObj.distance : 0;
    }

    let isFree = false;
    let explanation = "";

    // 1. Check if area is in the "always free delivery" list (regardless of order amount)
    if (freeAreasList.length > 0 && form.city.toLowerCase() === "karachi") {
      const areaNameToCheck = selectedArea.toLowerCase();
      const isInFreeArea = freeAreasList.some((fa: string) => areaNameToCheck.includes(fa) || fa.includes(areaNameToCheck));
      if (isInFreeArea) {
        isFree = true;
        explanation = `Free delivery — your area is eligible for free shipping!`;
      }
    }

    // 2. Check free delivery by order threshold (for areas not already free)
    if (!isFree && totalPrice >= freeThreshold) {
      let kmEligible = true;

      // Check if distance is restricted for free shipping
      if (freeMaxKm !== null && distance > freeMaxKm) {
        kmEligible = false;
      }

      if (kmEligible) {
        isFree = true;
        explanation = `Free shipping applied (Order above Rs. ${freeThreshold.toLocaleString()})`;
      } else {
        explanation = `Order above Rs. ${freeThreshold.toLocaleString()}, but free shipping is restricted within ${freeMaxKm} km.`;
      }
    } else if (!isFree && freeThreshold < Infinity) {
      explanation = `Add Rs. ${(freeThreshold - totalPrice).toLocaleString()} more for Free Shipping.`;
    }

    if (isFree) {
      setShippingFee(0);
      setShippingExplanation(explanation);
    } else {
      // Only apply per-km fee if the rule explicitly has a non-null, non-zero per_km_fee
      const hasPerKm = rule.per_km_fee !== null && rule.per_km_fee !== undefined && Number(rule.per_km_fee) > 0;
      const calculatedFee = hasPerKm ? baseFee + (perKmFee * distance) : baseFee;
      setShippingFee(calculatedFee);
      
      let breakdown = `Base rate: Rs. ${baseFee}`;
      if (hasPerKm && distance > 0) {
        breakdown += ` + Rs. ${perKmFee}/km × ${distance} km (Total: Rs. ${calculatedFee})`;
      }
      setShippingExplanation(`${breakdown}. ${explanation}`);
    }
  }, [form.city, selectedArea, customDistance, totalPrice, shippingRules]);

  // Handle Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setVerifyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/checkout/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.toUpperCase().trim() })
      });
      
      if (!res.ok) {
        setCouponError("Invalid or expired coupon code.");
        setAppliedCoupon(null);
      } else {
        const data = await res.json();
        setAppliedCoupon(data);
        setCouponError("");
      }
    } catch (err) {
      setCouponError("Error validating coupon.");
      setAppliedCoupon(null);
    }
    setVerifyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Calculate discount
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discount_type === "percentage" 
        ? Math.round(totalPrice * (appliedCoupon.discount_value / 100))
        : appliedCoupon.discount_value)
    : 0;

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. Format the delivery address with selected area and estimated distance
      const distanceVal = karachiAreas.find((a: any) => a.name === selectedArea)?.distance || 0;

      const formattedAddress = form.city.toLowerCase() === "karachi"
        ? `${form.address}, Area: ${selectedArea} (Est. Distance: ${distanceVal} km from Model Colony Hub)`
        : form.address;

      // 2. Create order
      const orderPayload = {
        order: {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: formattedAddress,
          shipping_city: form.city,
          order_notes: form.notes,
          subtotal: totalPrice,
          shipping_fee: shippingFee,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount_amount: discountAmount,
          total_amount: (totalPrice - discountAmount) + shippingFee,
          payment_method: selectedPaymentMethod,
          status: 'Pending'
        },
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          colorHex: item.colorHex
        }))
      };

      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) throw new Error("Failed to create order");
      const savedOrder = await res.json();

      // 4. Send order confirmation email asynchronously
      fetch("/api/emails/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ order: { ...orderPayload.order, ...savedOrder }, items: savedOrder.items })
      }).catch(err => console.error("Failed to trigger order confirmation email:", err));

      setOrderId(savedOrder.id);
      setPlaced(true);
      clearCart();
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("There was an error submitting your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="animate-scale-in" style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 12 }}>Order Placed Successfully!</h1>
          <p style={{ color: "var(--gray-500)", marginBottom: 8, lineHeight: 1.7 }}>
            Thank you for your order! Our team will call you shortly to confirm delivery. You will receive your order within {estimatedDays.toLowerCase()}.
          </p>
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, margin: "24px 0", border: "1px solid var(--gray-200)" }}>
            <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 8 }}>
              Order Number: <strong style={{ color: "var(--gray-900)", userSelect: "all" }}>{orderId ? orderId.split("-")[0].toUpperCase() : ""}</strong>
            </p>
            <p style={{ fontSize: 14, color: "var(--gray-600)" }}>
              Payment Method: <strong style={{ color: "var(--red)" }}>{selectedPaymentMethod}</strong>
            </p>
            {selectedPaymentMethod === "Bank Transfer" && paymentSettings?.bank?.details && (
              <div style={{ marginTop: 12, padding: 12, background: "white", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>Bank Transfer Details</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)" }}>Bank: {paymentSettings.bank.details.bankName}</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)" }}>Account Name: {paymentSettings.bank.details.accountName}</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600 }}>Account No: {paymentSettings.bank.details.accountNumber}</p>
                {paymentSettings.bank.details.iban && <p style={{ fontSize: 12, color: "var(--gray-600)" }}>IBAN: {paymentSettings.bank.details.iban}</p>}
                {paymentSettings.bank.details.instructions && <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 6, fontStyle: "italic" }}>{paymentSettings.bank.details.instructions}</p>}
              </div>
            )}
            {selectedPaymentMethod === "JazzCash" && paymentSettings?.jazzcash?.details && (
              <div style={{ marginTop: 12, padding: 12, background: "white", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>JazzCash Details</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)" }}>Account Name: {paymentSettings.jazzcash.details.accountName}</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600 }}>Mobile No: {paymentSettings.jazzcash.details.accountNumber}</p>
                {paymentSettings.jazzcash.details.instructions && <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 6, fontStyle: "italic" }}>{paymentSettings.jazzcash.details.instructions}</p>}
              </div>
            )}
            {selectedPaymentMethod === "EasyPaisa" && paymentSettings?.easypaisa?.details && (
              <div style={{ marginTop: 12, padding: 12, background: "white", borderRadius: 8, border: "1px solid var(--gray-200)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>EasyPaisa Details</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)" }}>Account Name: {paymentSettings.easypaisa.details.accountName}</p>
                <p style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600 }}>Mobile No: {paymentSettings.easypaisa.details.accountNumber}</p>
                {paymentSettings.easypaisa.details.instructions && <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 6, fontStyle: "italic" }}>{paymentSettings.easypaisa.details.instructions}</p>}
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 12 }}>Please save your order number to track your order status.</p>
          </div>
          <a href="/" className="btn-red" style={{ textDecoration: "none", display: "inline-flex" }}>
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={48} color="var(--red)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)", marginBottom: 32 }}>
        Checkout
      </h1>

      {/* Progress Steps */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 40, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: i <= step ? "var(--red)" : "var(--gray-200)",
                color: i <= step ? "white" : "var(--gray-500)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, transition: "all 0.3s",
              }}>
                {i < step ? <CheckCircle size={18} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: i <= step ? "var(--red)" : "var(--gray-400)", whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? "var(--red)" : "var(--gray-200)", margin: "0 12px", marginBottom: 22, transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

        {/* Form */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 32, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <User size={20} color="var(--red)" /> Shipping Information
              </h2>
              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="Muhammad Ali" value={form.name} onChange={e => set("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input className="input" placeholder="0316-2975195" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div>
                  <label className="label">Complete Address *</label>
                  <input className="input" placeholder="House no., Street, Area" value={form.address} onChange={e => set("address", e.target.value)} />
                </div>
                <div>
                  <label className="label">City *</label>
                  <select className="input" value={dropdownCity} onChange={e => setDropdownCity(e.target.value)}>
                    <option value="">Select City</option>
                    {PAKISTAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {dropdownCity === "Other (Specify)" && (
                  <div className="animate-fade-up">
                    <label className="label">Specify City Name *</label>
                    <input 
                      className="input" 
                      placeholder="Enter your city name" 
                      value={customCity} 
                      onChange={e => setCustomCity(e.target.value)} 
                    />
                  </div>
                )}

                {form.city.toLowerCase() === "karachi" && (
                  <div className="animate-fade-up" style={{ display: "grid", gap: 16, background: "var(--gray-50)", padding: 20, borderRadius: "var(--radius)", border: "1px solid var(--gray-200)" }}>
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Select Area / Location *</label>
                      <select className="input" value={selectedArea} onChange={e => setSelectedArea(e.target.value)} style={{ background: "white" }}>
                        {karachiAreas.map((a: any) => (
                          <option key={a.name} value={a.name}>{a.name} (~{a.distance} km)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Order Notes (Optional)</label>
                  <textarea className="input" rows={3} placeholder="Any special instructions?" value={form.notes} onChange={e => set("notes", e.target.value)} style={{ resize: "vertical" }} />
                </div>
              </div>
              <button 
                onClick={() => setStep(1)} 
                className="btn-red" 
                style={{ marginTop: 24, justifyContent: "center" }}
                disabled={
                  !form.name || 
                  !form.phone || 
                  !form.address || 
                  !form.city
                }
              >
                Continue to Review <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-up">
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={20} color="var(--red)" /> Review Your Order
              </h2>
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, marginBottom: 20, border: "1px solid var(--gray-200)" }}>
                <p style={{ fontWeight: 700, color: "var(--gray-800)", marginBottom: 8 }}>Delivering to:</p>
                <p style={{ color: "var(--gray-700)", fontSize: 15 }}>{form.name}</p>
                <p style={{ color: "var(--gray-600)", fontSize: 14 }}>
                  {form.address}
                  {form.city.toLowerCase() === "karachi" && `, ${selectedArea} (~${karachiAreas.find((a: any) => a.name === selectedArea)?.distance || 0} km)`}
                  , {form.city}
                </p>
                <p style={{ color: "var(--gray-600)", fontSize: 14 }}>{form.phone}</p>
                {shippingExplanation && (
                  <p style={{ color: "var(--gray-600)", fontSize: 12, marginTop: 12, fontStyle: "italic", borderTop: "1px solid var(--gray-200)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span><strong>Shipping Details:</strong> {shippingExplanation}</span>
                    <span><strong>Estimated Delivery:</strong> {estimatedDays}</span>
                  </p>
                )}
              </div>
              {/* Payment Method */}
              <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {paymentSettings?.cod?.enabled && form.city.toLowerCase() === "karachi" && (
                  <div 
                    onClick={() => setSelectedPaymentMethod("COD")}
                    style={{ border: selectedPaymentMethod === "COD" ? "2px solid var(--red)" : "1px solid var(--gray-200)", borderRadius: "var(--radius)", padding: 16, background: selectedPaymentMethod === "COD" ? "#fef2f2" : "white", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid", borderColor: selectedPaymentMethod === "COD" ? "var(--red)" : "var(--gray-300)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {selectedPaymentMethod === "COD" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--red)" }} />}
                      </div>
                      <div style={{ width: 40, height: 28, background: "#111827", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>COD</div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>Cash on Delivery (COD)</div>
                        <div style={{ fontSize: 12, color: "var(--gray-500)" }}>Pay when your order arrives at your doorstep</div>
                      </div>
                    </div>
                  </div>
                )}
                {paymentSettings?.bank?.enabled && (
                  <div 
                    onClick={() => setSelectedPaymentMethod("Bank Transfer")}
                    style={{ border: selectedPaymentMethod === "Bank Transfer" ? "1px solid #059669" : "1px solid var(--gray-200)", borderRadius: "var(--radius)", padding: 16, background: selectedPaymentMethod === "Bank Transfer" ? "#f0fdf4" : "white", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid", borderColor: selectedPaymentMethod === "Bank Transfer" ? "#059669" : "var(--gray-300)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {selectedPaymentMethod === "Bank Transfer" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669" }} />}
                        </div>
                        <div style={{ width: 40, height: 28, background: "#059669", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}><Landmark size={14} /></div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>Bank Transfer</div>
                          {selectedPaymentMethod !== "Bank Transfer" && <div style={{ fontSize: 12, color: "var(--gray-500)" }}>Transfer amount directly to our bank account</div>}
                        </div>
                      </div>
                      {selectedPaymentMethod === "Bank Transfer" && (
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "4px 8px", background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: 4 }}>
                          SECURE
                        </div>
                      )}
                    </div>
                    {selectedPaymentMethod === "Bank Transfer" && paymentSettings.bank?.details && (
                      <div className="animate-fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #86efac", display: "flex", flexDirection: "column", gap: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#065f46", letterSpacing: 1, textTransform: "uppercase" }}>Bank Details</p>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Bank</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{paymentSettings.bank.details.bankName}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Account Name</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{paymentSettings.bank.details.accountName}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Account Number</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)", userSelect: "all" }}>{paymentSettings.bank.details.accountNumber}</span>
                        </div>

                        {paymentSettings.bank.details.iban && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                            <span style={{ color: "var(--gray-500)" }}>IBAN</span>
                            <span style={{ fontWeight: 600, color: "var(--gray-900)", userSelect: "all" }}>{paymentSettings.bank.details.iban}</span>
                          </div>
                        )}
                        
                        {paymentSettings.bank.details.instructions && (
                          <p style={{ fontSize: 12, color: "#065f46", fontStyle: "italic", marginTop: 4 }}>{paymentSettings.bank.details.instructions}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {paymentSettings?.jazzcash?.enabled && (
                  <div 
                    onClick={() => setSelectedPaymentMethod("JazzCash")}
                    style={{ border: selectedPaymentMethod === "JazzCash" ? "1px solid #dc2626" : "1px solid var(--gray-200)", borderRadius: 8, padding: "16px 20px", background: selectedPaymentMethod === "JazzCash" ? "#fef2f2" : "white", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid", borderColor: selectedPaymentMethod === "JazzCash" ? "#dc2626" : "var(--gray-300)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "white" }}>
                        {selectedPaymentMethod === "JazzCash" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#dc2626" }} />}
                      </div>
                      <div style={{ width: 46, height: 32, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid var(--gray-200)", flexShrink: 0 }}>
                        <img src="/jazzcash.png" alt="JazzCash" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: 16 }}>JazzCash</div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Transfer to our JazzCash mobile account</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === "JazzCash" && paymentSettings.jazzcash?.details && (
                      <div className="animate-fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #fca5a5", display: "flex", flexDirection: "column", gap: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#991b1b", letterSpacing: 1, textTransform: "uppercase" }}>JazzCash Details</p>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Account Name</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{paymentSettings.jazzcash.details.accountName}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Mobile Number</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)", userSelect: "all" }}>{paymentSettings.jazzcash.details.accountNumber}</span>
                        </div>
                      </div>
                    )}
                    {selectedPaymentMethod === "JazzCash" && paymentSettings.jazzcash?.details?.instructions && (
                      <p className="animate-fade-up" style={{ fontSize: 13, color: "#991b1b", fontStyle: "italic", marginTop: 12 }}>{paymentSettings.jazzcash.details.instructions}</p>
                    )}
                  </div>
                )}
                {paymentSettings?.easypaisa?.enabled && (
                  <div 
                    onClick={() => setSelectedPaymentMethod("EasyPaisa")}
                    style={{ border: selectedPaymentMethod === "EasyPaisa" ? "1px solid #16a34a" : "1px solid var(--gray-200)", borderRadius: 8, padding: "16px 20px", background: selectedPaymentMethod === "EasyPaisa" ? "#f0fdf4" : "white", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid", borderColor: selectedPaymentMethod === "EasyPaisa" ? "#16a34a" : "var(--gray-300)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "white" }}>
                        {selectedPaymentMethod === "EasyPaisa" && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#16a34a" }} />}
                      </div>
                      <div style={{ width: 46, height: 32, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid var(--gray-200)", flexShrink: 0 }}>
                        <img src="/easypaisa.png" alt="EasyPaisa" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: 16 }}>EasyPaisa</div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Transfer to our EasyPaisa mobile account</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === "EasyPaisa" && paymentSettings.easypaisa?.details && (
                      <div className="animate-fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #86efac", display: "flex", flexDirection: "column", gap: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#166534", letterSpacing: 1, textTransform: "uppercase" }}>EasyPaisa Details</p>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Account Name</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{paymentSettings.easypaisa.details.accountName}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                          <span style={{ color: "var(--gray-500)" }}>Mobile Number</span>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)", userSelect: "all" }}>{paymentSettings.easypaisa.details.accountNumber}</span>
                        </div>
                      </div>
                    )}
                    {selectedPaymentMethod === "EasyPaisa" && paymentSettings.easypaisa?.details?.instructions && (
                      <p className="animate-fade-up" style={{ fontSize: 13, color: "#166534", fontStyle: "italic", marginTop: 12 }}>{paymentSettings.easypaisa.details.instructions}</p>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(0)} className="btn-ghost" style={{ border: "2px solid var(--gray-200)" }}>Back</button>
                <button onClick={handleOrder} className="btn-red" style={{ flex: 1, justifyContent: "center" }} disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 24, border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-md)", position: "sticky", top: 100, alignSelf: "start" }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Order Summary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {items.map((item, index) => (
              <div key={`${item.id}-${item.color || index}`} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", width: 64, height: 64 }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "var(--radius)", background: "var(--gray-50)", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Invalid+Image'; }} />
                  </div>
                  <div style={{ position: "absolute", top: -8, right: -8, background: "var(--gray-500)", color: "white", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, zIndex: 10 }}>
                    {item.quantity}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>{item.name}</p>
                  {item.color && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.colorHex || "#ccc", border: "1px solid var(--gray-200)" }}></div>
                      <span style={{ fontSize: 11, color: "var(--gray-500)" }}>{item.color}</span>
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: "16px 0" }} />
          
          {/* Coupon Section */}
          <div style={{ marginBottom: 16 }}>
            {!appliedCoupon ? (
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", display: "block", marginBottom: 8 }}>Have a coupon code?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input 
                    className="input" 
                    placeholder="Enter code" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, textTransform: "uppercase" }}
                  />
                  <button 
                    onClick={handleApplyCoupon} 
                    disabled={verifyingCoupon || !couponCode}
                    style={{ background: "var(--gray-900)", color: "white", padding: "0 16px", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: (verifyingCoupon || !couponCode) ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}
                  >
                    {verifyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && <p style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>{couponError}</p>}
              </div>
            ) : (
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: "var(--radius)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#166534", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle size={14} /> Coupon Applied!
                  </div>
                  <div style={{ color: "#15803d", fontSize: 12, marginTop: 2 }}>{appliedCoupon.code} ({appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `Rs ${appliedCoupon.discount_value}`} OFF)</div>
                </div>
                <button onClick={handleRemoveCoupon} style={{ background: "none", border: "none", color: "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Remove</button>
              </div>
            )}
          </div>

          <div className="divider" style={{ margin: "16px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray-500)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            
            {appliedCoupon && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#16a34a" }}>
                <span>Discount ({appliedCoupon.code})</span>
                <span style={{ fontWeight: 600 }}>- Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--gray-500)" }}>Shipping ({estimatedDays})</span>
                <span style={{ fontWeight: 600, color: shippingFee === 0 ? "#16a34a" : "var(--gray-900)" }}>
                  {shippingFee === 0 ? "FREE" : `Rs. ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              {shippingExplanation && (
                <p style={{ fontSize: 11, color: "var(--gray-500)", fontStyle: "italic", margin: 0, textAlign: "right" }}>
                  {shippingExplanation}
                </p>
              )}
            </div>

            <div className="divider" style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Grand Total</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: "var(--red)" }}>Rs. {((totalPrice - discountAmount) + shippingFee).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
