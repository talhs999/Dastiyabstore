"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Settings, LogOut, Ticket, Menu, X, Store
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();
  const [vendorData, setVendorData] = useState<any>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    let isVendor = false;

    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.role === "vendor" || user.role === "VENDOR") {
          isVendor = true;
          setVendorData(user);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!isVendor) {
      window.location.href = "/login";
    } else {
      setIsAuthorized(true);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("customer_session");
    router.push("/login");
  };

  if (!isAuthorized) return null;

  const menuItems = [
    { label: "Dashboard", href: "/vendor", icon: <LayoutDashboard size={20} /> },
    { label: "My Products", href: "/vendor/products", icon: <Package size={20} /> },
    { label: "My Orders", href: "/vendor/orders", icon: <ShoppingCart size={20} /> },
    { label: "Coupons", href: "/vendor/coupons", icon: <Ticket size={20} /> },
    { label: "Shipping Rules", href: "/vendor/shipping", icon: <Store size={20} /> },
    { label: "Store Settings", href: "/vendor/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
        width: 260,
        background: "white",
        borderRight: "1px solid var(--gray-200)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        transition: "transform 0.3s ease"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <img src="/icon.png" alt="Dastiyab Vendor Logo" style={{ height: 40, width: 40, objectFit: "contain", flexShrink: 0, marginLeft: -6 }} />
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--red)" }}>Dastiyab</span><span style={{ color: "var(--yellow-dark)" }}>Vendor</span>
            </span>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-500)" }}>
            <X size={24} />
          </button>
        </div>
        
        <nav style={{ padding: "24px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
          {menuItems.map((item, i) => {
            const isActive = pathname === item.href || (item.href !== "/vendor" && pathname.startsWith(item.href));
            return (
              <Link key={i} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                borderRadius: "var(--radius)", textDecoration: "none",
                background: isActive ? "var(--gray-900)" : "transparent",
                color: isActive ? "white" : "var(--gray-600)",
                fontWeight: isActive ? 700 : 500,
                transition: "all 0.2s ease"
              }}>
                {item.icon}
                <span style={{ fontSize: 15 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: "24px 16px", borderTop: "1px solid var(--gray-100)" }}>
          {vendorData && (
            <div style={{ padding: "0 16px", marginBottom: 16, fontSize: 13, color: "var(--gray-500)" }}>
              Store:<br/>
              <strong style={{ color: "var(--gray-900)" }}>{vendorData.name}</strong>
            </div>
          )}
          <button onClick={handleSignOut} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
            width: "100%", border: "none", background: "none", cursor: "pointer",
            fontWeight: 500, color: "var(--gray-600)", transition: "color 0.2s ease"
          }}>
            <LogOut size={20} />
            <span style={{ fontSize: 15 }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: mobileMenuOpen ? 0 : 260, transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>
        {/* Mobile Header */}
        <header className="mobile-only" style={{ background: "white", padding: "16px 20px", borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 40 }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-700)" }}>
            <Menu size={24} />
          </button>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Vendor Panel</span>
        </header>

        <div style={{ padding: "32px 40px", flex: 1, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-only"
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
        />
      )}
    </div>
  );
}
