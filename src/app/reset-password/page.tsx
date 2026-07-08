"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "16px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <AlertCircle />
          <span style={{ fontWeight: 600 }}>Invalid Password Reset Link</span>
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/forgot-password" style={{ color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ width: 64, height: 64, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--red)" }}>
          <Lock size={32} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>Set New Password</h1>
        <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
          Please enter your new password below.
        </p>
      </div>

      {success ? (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 20, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
          <CheckCircle2 color="#16a34a" size={48} />
          <div style={{ color: "#166534", fontWeight: 600 }}>Password Reset Successfully!</div>
          <div style={{ color: "#15803d", fontSize: 14 }}>
            You will be redirected to the login page momentarily...
          </div>
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
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--gray-700)", marginBottom: 8 }}>New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--gray-300)", borderRadius: 8, fontSize: 15, outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--gray-700)", marginBottom: 8 }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--gray-300)", borderRadius: 8, fontSize: 15, outline: "none" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !password || !confirmPassword}
            style={{ 
              width: "100%", 
              padding: 14, 
              background: (loading || !password || !confirmPassword) ? "var(--gray-300)" : "var(--red)", 
              color: "white", 
              border: "none", 
              borderRadius: 8, 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: (loading || !password || !confirmPassword) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" }}>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 450, background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
          <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
