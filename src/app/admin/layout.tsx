"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Package, FolderTree, ShoppingCart, 
  Users, Star, Settings, LogOut, MessageSquare, LayoutList, Activity,
  Menu, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

let globalAudioCtx: any = null;
let audioInitialized = false;

const initAudio = () => {
  if (typeof window === 'undefined') return;
  if (audioInitialized) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!globalAudioCtx) {
        globalAudioCtx = new AudioContextClass();
      }
      if (globalAudioCtx && globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume().then(() => {
          audioInitialized = true;
          document.removeEventListener('click', initAudio);
          document.removeEventListener('keydown', initAudio);
        }).catch((e: any) => console.error("Audio resume error", e));
      } else {
        audioInitialized = true;
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

if (typeof window !== 'undefined') {
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Attempt to init audio if user interacted before this mounted
    initAudio();
    
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

  useEffect(() => {
    if (!isAuthorized) return;

    // Listen for new orders in real-time
    const channel = supabase
      .channel('realtime-orders-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        if (!newOrder) return;

        // 1. Play Sound chime if enabled
        const soundVal = localStorage.getItem("admin_sound_notifications") !== "false";
        if (soundVal) {
          try {
            if (!globalAudioCtx) {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) globalAudioCtx = new AudioContextClass();
            }
            if (globalAudioCtx) {
              if (globalAudioCtx.state === "suspended") {
                globalAudioCtx.resume();
              }
              const now = globalAudioCtx.currentTime;
              
              const osc1 = globalAudioCtx.createOscillator();
              const gain1 = globalAudioCtx.createGain();
              osc1.type = "sine";
              osc1.frequency.setValueAtTime(880, now);
              gain1.gain.setValueAtTime(0.3, now);
              gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
              osc1.connect(gain1);
              gain1.connect(globalAudioCtx.destination);
              osc1.start(now);
              osc1.stop(now + 0.6);

              const osc2 = globalAudioCtx.createOscillator();
              const gain2 = globalAudioCtx.createGain();
              osc2.type = "sine";
              osc2.frequency.setValueAtTime(659.25, now + 0.15);
              gain2.gain.setValueAtTime(0.3, now + 0.15);
              gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
              osc2.connect(gain2);
              gain2.connect(globalAudioCtx.destination);
              osc2.start(now + 0.15);
              osc2.stop(now + 0.8);
            }
          } catch (e) {
            console.error("Audio chime error:", e);
          }
        }

        // 2. Custom Toast Alert
        showToast(`🔔 New Order! Rs. ${Number(newOrder.total_amount).toLocaleString()} from ${newOrder.customer_name}`, "success");

        // 3. Desktop Push Notification if enabled
        const pushVal = localStorage.getItem("admin_push_notifications") === "true";
        if (pushVal && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("🔔 New Order Received!", {
            body: `Total: Rs. ${Number(newOrder.total_amount).toLocaleString()} - Customer: ${newOrder.customer_name} (${newOrder.shipping_city})`,
            icon: "/favicon.ico"
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthorized, showToast]);

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
    { label: "Live Tracking", href: "/admin/live", icon: <Activity size={20} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)", fontFamily: "Inter, sans-serif" }}>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="admin-mobile-overlay"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ 
        width: 260, 
        background: "white", 
        borderRight: "1px solid var(--gray-200)",
        display: "flex", 
        flexDirection: "column",
        height: "100vh",
        overflowY: "auto",
        zIndex: 50,
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <img src="/icon.png" alt="Dastiyab Admin Logo" style={{ height: 40, width: 40, objectFit: "contain", flexShrink: 0, marginLeft: -6 }} />
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--red)" }}>Dastiyab</span><span style={{ color: "#FFB703" }}>Admin</span>
            </span>
          </div>
          <button 
            className="admin-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "none" }}
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ padding: "24px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {menuItems.map(item => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        {/* Mobile Header */}
        <div className="admin-mobile-header" style={{ 
          display: "none", 
          alignItems: "center", 
          padding: "16px 20px", 
          background: "white", 
          borderBottom: "1px solid var(--gray-200)",
          position: "sticky", top: 0, zIndex: 30
        }}>
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Menu size={24} />
          </button>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
            <img src="/icon.png" alt="Dastiyab Admin Logo" style={{ height: 32, width: 32, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--red)" }}>Dastiyab</span><span style={{ color: "#FFB703" }}>Admin</span>
            </span>
          </div>
          <div style={{ width: 24 }} /> {/* placeholder for balance */}
        </div>

        <main style={{ flex: 1, overflowX: "hidden" }}>
          {children}
        </main>
      </div>

      <style>{`
        .admin-sidebar {
          position: sticky;
          top: 0;
          transition: transform 0.3s ease;
        }
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-mobile-close {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
