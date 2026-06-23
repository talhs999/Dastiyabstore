"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowRight, User, Phone } from "lucide-react";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");

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
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="label">Email or Phone</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40, paddingRight: 44 }} type={show ? "text" : "password"} placeholder="Enter your password" />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--red)", textDecoration: "none", fontWeight: 600 }}>Forgot Password?</Link>
              </div>
              <button type="submit" className="btn-red" style={{ justifyContent: "center", padding: "14px" }}>
                Sign In <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="Muhammad Ali" />
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="tel" placeholder="0300-1234567" />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="email" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="label">Create Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} type="password" placeholder="Min 8 characters" />
                </div>
              </div>
              <button type="submit" className="btn-red" style={{ justifyContent: "center", padding: "14px" }}>
                Create Account <ArrowRight size={16} />
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
