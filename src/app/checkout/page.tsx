"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, User, MapPin, Phone, Mail, Zap, Truck, Shield, ChevronRight, Loader2 } from "lucide-react";
import { useCart } from "@/store/cartStore";
import { supabase } from "@/lib/supabase";

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

const KARACHI_AREAS = [
  { name: "Saddar / PECHS / Bahadurabad", distance: 0 },
  { name: "Clifton", distance: 5 },
  { name: "DHA (Phase 1-8)", distance: 8 },
  { name: "Gulshan-e-Iqbal", distance: 7 },
  { name: "Gulistan-e-Jauhar", distance: 10 },
  { name: "Nazimabad / North Nazimabad", distance: 12 },
  { name: "Federal B Area", distance: 9 },
  { name: "Korangi / Landhi", distance: 15 },
  { name: "North Karachi / Surjani Town", distance: 18 },
  { name: "Orangi / Baldia Town", distance: 16 },
  { name: "Malir / Model Colony", distance: 16 },
  { name: "Scheme 33", distance: 15 },
  { name: "Bahria Town Karachi", distance: 35 },
  { name: "Other (Custom Distance)", distance: -1 }
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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", notes: "" });
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { items, totalPrice, clearCart } = useCart();

  // Dynamic shipping states
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("Saddar / PECHS / Bahadurabad");
  const [customDistance, setCustomDistance] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(150);
  const [shippingExplanation, setShippingExplanation] = useState<string>("");
  const [estimatedDays, setEstimatedDays] = useState<string>("2-3 Business Days");

  const [dropdownCity, setDropdownCity] = useState<string>("");
  const [customCity, setCustomCity] = useState<string>("");

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

  // 1. Fetch Shipping Rules on mount
  useEffect(() => {
    async function loadRules() {
      try {
        const { data, error } = await supabase
          .from("shipping_rules")
          .select("*")
          .eq("is_active", true);

        if (!error && data && data.length > 0) {
          setShippingRules(data);
        } else {
          setShippingRules(DEFAULT_SHIPPING_RULES);
        }
      } catch (err) {
        console.error("Failed to fetch shipping rules:", err);
        setShippingRules(DEFAULT_SHIPPING_RULES);
      }
    }
    loadRules();
  }, []);

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
    const freeThreshold = Number(rule.free_delivery_threshold) || 0;
    const freeMaxKm = rule.free_delivery_km !== null && rule.free_delivery_km !== undefined ? Number(rule.free_delivery_km) : null;
    const freeAreasList = rule.free_areas ? rule.free_areas.split(",").map((a: string) => a.trim().toLowerCase()) : [];

    // Calculate distance for Karachi local rule
    let distance = 0;
    if (form.city.toLowerCase() === "karachi") {
      if (selectedArea === "Other (Custom Distance)") {
        distance = Number(customDistance) || 0;
      } else {
        const areaObj = KARACHI_AREAS.find(a => a.name === selectedArea);
        distance = areaObj ? areaObj.distance : 0;
      }
    }

    let isFree = false;
    let explanation = "";

    // Check free delivery by order threshold
    if (totalPrice >= freeThreshold) {
      let areaEligible = true;
      let kmEligible = true;

      // Check if location is restricted for free shipping
      if (freeAreasList.length > 0) {
        const areaNameToCheck = (selectedArea === "Other (Custom Distance)" ? "other" : selectedArea).toLowerCase();
        const matched = freeAreasList.some((fa: string) => areaNameToCheck.includes(fa) || fa.includes(areaNameToCheck));
        if (!matched) {
          areaEligible = false;
        }
      }

      // Check if distance is restricted for free shipping
      if (freeMaxKm !== null && distance > freeMaxKm) {
        kmEligible = false;
      }

      if (areaEligible && kmEligible) {
        isFree = true;
        explanation = `Free shipping applied (Order above Rs. ${freeThreshold.toLocaleString()})`;
      } else if (!areaEligible) {
        explanation = `Order above Rs. ${freeThreshold.toLocaleString()}, but free shipping is only for select areas.`;
      } else if (!kmEligible) {
        explanation = `Order above Rs. ${freeThreshold.toLocaleString()}, but free shipping is restricted within ${freeMaxKm} km.`;
      }
    } else {
      explanation = `Add Rs. ${(freeThreshold - totalPrice).toLocaleString()} more for Free Shipping.`;
    }

    if (isFree) {
      setShippingFee(0);
      setShippingExplanation(explanation);
    } else {
      const calculatedFee = baseFee + (perKmFee * distance);
      setShippingFee(calculatedFee);
      
      let breakdown = `Base rate: Rs. ${baseFee}`;
      if (perKmFee > 0 && distance > 0) {
        breakdown += ` + Rs. ${perKmFee}/km × ${distance} km (Total: Rs. ${calculatedFee})`;
      }
      setShippingExplanation(`${breakdown}. ${explanation}`);
    }
  }, [form.city, selectedArea, customDistance, totalPrice, shippingRules]);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. Format the delivery address with selected area and estimated distance
      const distanceVal = selectedArea === "Other (Custom Distance)" 
        ? customDistance 
        : (KARACHI_AREAS.find(a => a.name === selectedArea)?.distance || 0);

      const formattedAddress = form.city.toLowerCase() === "karachi"
        ? `${form.address}, Area: ${selectedArea === "Other (Custom Distance)" ? "Custom Location" : selectedArea} (Est. Distance: ${distanceVal} km)`
        : form.address;

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: formattedAddress,
          shipping_city: form.city,
          order_notes: form.notes,
          subtotal: totalPrice,
          shipping_fee: shippingFee,
          total_amount: totalPrice + shippingFee,
          payment_method: 'COD',
          status: 'Pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(order.id);
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
              Payment Method: <strong style={{ color: "var(--red)" }}>Cash on Delivery</strong>
            </p>
            <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 12 }}>Please save your order number to track your order status.</p>
          </div>
          <a href="/" className="btn-red" style={{ textDecoration: "none", display: "inline-flex" }}>
            Continue Shopping
          </a>
        </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>

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
                    <input className="input" placeholder="0300-1234567" value={form.phone} onChange={e => set("phone", e.target.value)} />
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
                        {KARACHI_AREAS.map(a => (
                          <option key={a.name} value={a.name}>
                            {a.name} {a.distance >= 0 ? `(${a.distance} km)` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedArea === "Other (Custom Distance)" && (
                      <div className="animate-fade-up">
                        <label className="label">Estimated Distance from Central Saddar/PECHS Hub (km) *</label>
                        <input 
                          className="input" 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={customDistance || ""} 
                          onChange={e => setCustomDistance(Math.max(0, Number(e.target.value)))} 
                          placeholder="e.g. 12" 
                          style={{ background: "white" }}
                        />
                        <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 6 }}>
                          Specify the delivery distance in kilometers to compute the exact per-km delivery fee.
                        </p>
                      </div>
                    )}
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
                  !form.city ||
                  (form.city.toLowerCase() === "karachi" && selectedArea === "Other (Custom Distance)" && !customDistance)
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
                  {form.city.toLowerCase() === "karachi" && `, ${selectedArea === "Other (Custom Distance)" ? `${customDistance} km (Custom)` : selectedArea}`}
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
              <div style={{ border: "2px solid var(--yellow)", borderRadius: "var(--radius)", padding: 20, marginBottom: 20, background: "#fffbeb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Zap size={20} fill="var(--yellow)" color="var(--yellow-dark)" />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: 13, color: "var(--gray-600)" }}>Pay when your order arrives at your doorstep</div>
                  </div>
                </div>
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
            {items.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: "16px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray-500)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            
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
              <span style={{ fontWeight: 900, fontSize: 22, color: "var(--red)" }}>Rs. {(totalPrice + shippingFee).toLocaleString()}</span>
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
