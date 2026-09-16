"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Store } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorLoginPage() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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
        if (user.role === "VENDOR" || user.store) {
          localStorage.setItem("customer_session", JSON.stringify(user));
          document.cookie = "customer_session=true; path=/";
          document.cookie = "admin_session=; path=/; max-age=0";
          window.dispatchEvent(new Event("storage"));
          
          showToast("Welcome back to your Vendor Dashboard!", "success");
          setTimeout(() => { window.location.href = "/vendor"; }, 1000);
        } else {
          showToast("This account does not have vendor access. Please use the standard login.", "error");
        }
      } else {
        showToast("Invalid email/phone or password. Please try again.", "error");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      showToast("Login failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "var(--gray-50)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", overflow: "hidden", border: "1px solid var(--gray-200)", position: "relative" }}>
            <Store size={32} color="var(--red)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--gray-900)" }}>
            Vendor <span style={{ color: "var(--red)" }}>Portal</span>
          </h1>
          <p style={{ color: "var(--gray-500)", marginTop: 4, fontSize: 14 }}>Sign in to manage your DastiyabStore shop</p>
        </div>

        {/* Form Card */}
        <div className="animate-fade-up" style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 32, boxShadow: "var(--shadow-lg)", border: "1px solid var(--gray-200)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="label">Email or Phone</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="Enter vendor email" value={email} onChange={e => setEmail(e.target.value)} required />
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
            <button type="submit" disabled={loading} className="btn-red" style={{ justifyContent: "center", padding: "14px", marginTop: 8 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In as Vendor"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
