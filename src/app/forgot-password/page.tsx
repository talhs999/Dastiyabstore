"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request password reset");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" }}>
      {/* Header */}
      <header style={{ padding: "20px", background: "white", borderBottom: "1px solid var(--gray-200)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center" }}>
          <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gray-600)", textDecoration: "none", fontWeight: 600 }}>
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 450, background: "white", padding: 40, borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
          
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ width: 64, height: 64, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--red)" }}>
              <Mail size={32} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>Forgot Password</h1>
            <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 20, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
              <CheckCircle2 color="#16a34a" size={48} />
              <div style={{ color: "#166534", fontWeight: 600 }}>Reset Link Sent!</div>
              <div style={{ color: "#15803d", fontSize: 14 }}>
                If an account exists with {email}, you will receive a password reset link shortly. Please check your inbox and spam folder.
              </div>
              <Link href="/login" style={{ marginTop: 10, background: "white", border: "1px solid #bbf7d0", color: "#16a34a", padding: "8px 16px", borderRadius: 6, fontWeight: 600, textDecoration: "none" }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {error && (
                <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: 8, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--gray-700)", marginBottom: 8 }}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--gray-300)", borderRadius: 8, fontSize: 15, outline: "none" }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !email}
                style={{ 
                  width: "100%", 
                  padding: 14, 
                  background: (loading || !email) ? "var(--gray-300)" : "var(--red)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 8, 
                  fontWeight: 700, 
                  fontSize: 16, 
                  cursor: (loading || !email) ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
