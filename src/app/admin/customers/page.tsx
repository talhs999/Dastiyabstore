"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, User, Mail, Phone, MapPin, Calendar, Loader2, Trash2 } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // Build the virtual admin account object
      const adminAccount = {
        id: "admin-system-account",
        name: "Dastiyab Store Admin",
        email: "admin@dastiyab.com",
        phone: "0300-1234567",
        address: "Admin Headquarters, Saddar",
        city: "Karachi",
        created_at: "2026-06-15T00:00:00Z",
        role: "ADMIN"
      };

      if (!error && data) {
        // Check if an admin account already exists in database data
        const hasAdmin = data.some((c: any) => c.role === "ADMIN" || c.email === "admin@dastiyab.com");
        if (hasAdmin) {
          setCustomers(data);
        } else {
          // Prepend the admin account to the list if not present in the DB
          setCustomers([adminAccount, ...data]);
        }
      } else {
        // Fallback dummy customers + admin for demo in case DB isn't migrated
        setCustomers([
          adminAccount,
          { id: "1", name: "Muhammad Ali", email: "ali@example.com", phone: "0300-1234567", address: "DHA Phase 6, Street 5", city: "Karachi", created_at: "2026-06-20T12:00:00Z" },
          { id: "2", name: "Ayesha Khan", email: "ayesha@gmail.com", phone: "0321-7654321", address: "Gulberg III, Block B2", city: "Lahore", created_at: "2026-06-22T08:30:00Z" },
          { id: "3", name: "Zainab Malik", email: "zainab@outlook.com", phone: "0312-9876543", address: "F-10/2, Double Road", city: "Islamabad", created_at: "2026-06-23T14:15:00Z" }
        ]);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("customer_session");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed && parsed.email) {
            setCurrentUserEmail(parsed.email);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleDeleteCustomer = async (id: string, name: string, email: string) => {
    if (id === "admin-system-account" || email === "admin@dastiyab.com") {
      alert("Error: The primary administrator account cannot be deleted.");
      return;
    }

    if (currentUserEmail && email === currentUserEmail) {
      alert("Error: You cannot delete your own logged-in account.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete the customer "${name}"? All their details will be removed.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (!error) {
        alert("Customer account deleted successfully.");
        fetchCustomers();
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error("Failed to delete customer:", err);
      alert("Failed to delete customer: " + err.message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Customers Directory</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage registered store users, view administrative privileges, and delete accounts</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ background: "white", padding: 20, borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", border: "1px solid var(--gray-200)", borderBottom: "none", display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={18} color="var(--gray-400)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search customers by name, email, phone or city..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 42px", borderRadius: "var(--radius)", border: "1px solid var(--gray-200)", fontSize: 14, outline: "none" }}
          />
        </div>
        <div style={{ fontSize: 13, color: "var(--gray-500)", marginLeft: "auto", fontWeight: 600 }}>
          Showing {filteredCustomers.length} of {customers.length} customer(s)
        </div>
      </div>

      {/* Customers Matrix Table */}
      <div style={{ background: "white", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--gray-500)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Loader2 size={32} className="animate-spin" color="var(--red)" />
            <span>Loading customer list...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--gray-400)" }}>
            <User size={40} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>No customers found matching your search</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>CUSTOMER NAME</th>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>EMAIL ADDRESS</th>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>PHONE NUMBER</th>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>CITY</th>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>DELIVERY ADDRESS</th>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>JOIN DATE</th>
                  <th style={{ padding: "14px 20px", color: "var(--gray-500)", fontWeight: 700 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const isAdmin = customer.role === "ADMIN" || customer.email === "admin@dastiyab.com";
                  
                  return (
                    <tr key={customer.id} style={{ borderBottom: "1px solid var(--gray-150)", transition: "background 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--gray-900)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: "50%", 
                            background: isAdmin ? "var(--yellow)" : "#fff0f0", 
                            color: isAdmin ? "var(--black)" : "var(--red)", 
                            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 
                          }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            {customer.name}
                            {isAdmin && (
                              <span style={{ fontSize: 9, background: "var(--yellow)", color: "var(--yellow-dark)", border: "1px solid var(--yellow-dark)", padding: "1px 5px", borderRadius: 4, width: "fit-content", fontWeight: 900, marginTop: 3 }}>
                                {customer.role}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--gray-700)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Mail size={14} color="var(--gray-400)" />
                          {customer.email}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--gray-700)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Phone size={14} color="var(--gray-400)" />
                          {customer.phone}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: "var(--gray-100)", color: "var(--gray-700)", padding: "4px 8px", borderRadius: 6 }}>
                          {customer.city || "Not Specified"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--gray-600)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={customer.address}>
                        {customer.address || "No saved address"}
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--gray-500)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={14} color="var(--gray-400)" />
                          {new Date(customer.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {isAdmin ? (
                          <span style={{ fontSize: 11, color: "var(--gray-400)", fontStyle: "italic", fontWeight: 600 }}>System Locked</span>
                        ) : (
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id, customer.name, customer.email)}
                            style={{ 
                              border: "none", background: "none", cursor: "pointer", 
                              color: "var(--red)", transition: "transform 0.2s" 
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}
                            title="Delete Customer Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
