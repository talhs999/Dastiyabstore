"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Package, FolderTree, ShoppingCart, 
  Users, Star, Settings, LogOut, MessageSquare, LayoutList
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    let isUserAdmin = false;

    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        if (user.role === "ADMIN" || user.email === "admin@dastiyab.com") {
          isUserAdmin = true;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Fallback check for manual admin cookie
      if (document.cookie.includes("admin_session=true")) {
        isUserAdmin = true;
      }
    }

    if (!isUserAdmin) {
      // Not an admin, but trying to access admin panel
      document.cookie = "admin_session=; path=/; max-age=0";
      window.location.href = "/";
    } else {
      setIsAuthorized(true);
    }
  }, []);

  const handleSignOut = () => {
    document.cookie = "admin_session=; path=/; max-age=0";
    router.push("/login");
  };

  if (!isAuthorized) return null; // Or a loading spinner

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Products", href: "/admin/products", icon: <Package size={20} /> },
    { label: "Categories", href: "/admin/categories", icon: <FolderTree size={20} /> },
    { label: "Orders", href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { label: "Customers", href: "/admin/customers", icon: <Users size={20} /> },
    { label: "Reviews", href: "/admin/reviews", icon: <Star size={20} /> },
    { label: "Q&A", href: "/admin/qna", icon: <MessageSquare size={20} /> },
    { label: "Homepage Sidebar", href: "/admin/sidebar", icon: <LayoutList size={20} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)", fontFamily: "Inter, sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: 260, 
        background: "white", 
        borderRight: "1px solid var(--gray-200)",
        display: "flex", 
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto"
      }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--gray-100)" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--gray-900)", margin: 0, letterSpacing: "-0.5px" }}>
            Dastiyab<span style={{ color: "var(--red)" }}>Admin</span>
          </h2>
        </div>

        <nav style={{ padding: "24px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {menuItems.map(item => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                borderRadius: "var(--radius)", textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "white" : "var(--gray-600)",
                background: isActive ? "var(--gray-900)" : "transparent",
                transition: "all 0.2s ease"
              }}>
                {item.icon}
                <span style={{ fontSize: 15 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px 16px", borderTop: "1px solid var(--gray-100)" }}>
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
      <main style={{ flex: 1, overflowX: "hidden" }}>
        {children}
      </main>

    </div>
  );
}
