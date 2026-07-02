"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowRight, User, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  // Register state variables
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      if (!res.ok) {
        throw new Error('Invalid email/phone or password');
      }

      const { user } = await res.json();

      if (user) {
        localStorage.setItem("customer_session", JSON.stringify(user));
        document.cookie = "customer_session=true; path=/";

        // Check if the user is an administrator
        if (user.role === "ADMIN") {
          document.cookie = "admin_session=true; path=/";
          window.dispatchEvent(new Event("storage"));
          showToast("Logged in as Administrator successfully!", "success");
          setTimeout(() => { window.location.href = "/admin"; }, 1000);
        } else {
          document.cookie = "admin_session=; path=/; max-age=0";
          window.dispatchEvent(new Event("storage"));
          showToast("Logged in successfully!", "success");
          setTimeout(() => { window.location.href = "/account/orders"; }, 1000);
        }
      } else {
        // Fallback to hardcoded admin login
        if (cleanEmail === "admin@dastiyab.com" && cleanPassword === "dastiyab@123") {
          document.cookie = "admin_session=true; path=/";
          showToast("Logged in as Administrator successfully!", "success");
          setTimeout(() => { window.location.href = "/admin"; }, 1000);
          return;
        }
        showToast("Invalid email/phone or password. Please try again.", "error");
      }
    } catch (err: any) {
      console.error("Login failed, trying local fallback:", err);
      // Fallback to hardcoded admin login on network failure
      if (cleanEmail === "admin@dastiyab.com" && cleanPassword === "dastiyab@123") {
        document.cookie = "admin_session=true; path=/";
        showToast("Logged in as Administrator (Offline) successfully!", "success");
        setTimeout(() => { window.location.href = "/admin"; }, 1000);
        return;
      }
      showToast("Login failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast("All fields are required!", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: regPhone.trim(),
          password: regPassword.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const { user: newCustomer } = await res.json();

      // 3. Save session in localStorage
      localStorage.setItem("customer_session", JSON.stringify(newCustomer));
      document.cookie = "customer_session=true; path=/";
      document.cookie = "admin_session=; path=/; max-age=0";
      
      // Trigger storage event to update other components
      window.dispatchEvent(new Event("storage"));
      
      showToast("Account created successfully!", "success");
      setTimeout(() => { window.location.href = "/account/orders"; }, 1000);
    } catch (err: any) {
      console.error("Registration failed:", err);
      showToast("Registration failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "var(--gray-50)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, var(--red), var(--yellow))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShoppingBag size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--gray-900)" }}>
            Welcome to <span style={{ color: "var(--red)" }}>DastiyabStore</span>
          </h1>
          <p style={{ color: "var(--gray-500)", marginTop: 4, fontSize: 14 }}>Jo Chahiye, Wahi Dastiyab</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "var(--radius)", padding: 4, marginBottom: 28 }}>
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 16px", borderRadius: "var(--radius-sm)",
              border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "var(--red)" : "var(--gray-500)",
              boxShadow: tab === t ? "var(--shadow-sm)" : "none",
              textTransform: "capitalize", transition: "all 0.2s",
            }}>{t === "login" ? "Sign In" : "Create Account"}</button>
          ))}
        </div>

        {/* Form Card */}
        <div className="animate-fade-up" style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 32, boxShadow: "var(--shadow-lg)", border: "1px solid var(--gray-200)" }}>

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="label">Email or Phone</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="admin@dastiyab.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40, paddingRight: 44 }} type={show ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--red)", textDecoration: "none", fontWeight: 600 }}>Forgot Password?</Link>
              </div>
              <button type="submit" disabled={loading} className="btn-red" style={{ justifyContent: "center", padding: "14px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"} 
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="Muhammad Ali" value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="tel" placeholder="0316-2975195" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="email" placeholder="email@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Create Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="password" placeholder="Min 8 characters" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-red" style={{ justifyContent: "center", padding: "14px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Account"} 
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--gray-500)" }}>
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setTab(tab === "login" ? "register" : "login")} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {tab === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
