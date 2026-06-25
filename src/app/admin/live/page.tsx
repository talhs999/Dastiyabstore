"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Activity, Monitor, Smartphone, Globe, ArrowRight,
  Play, Volume2, ShieldAlert, Clock, Compass, ExternalLink
} from "lucide-react";

interface Visitor {
  session_id: string;
  current_url: string;
  location: string;
  ip_address: string;
  device_type: string;
  browser: string;
  last_active: string;
  created_at: string;
}

export default function AdminLiveTrackingPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundStyle, setSoundStyle] = useState("double_chime");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pathways, setPathways] = useState<Record<string, string[]>>({});

  // Web Audio API programmatically generated chime styles
  const playAlertChime = (style: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;

      const playTone = (freq: number, startTime: number, duration: number, oscType: OscillatorType = "sine", volume = 0.35) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      if (style === "double_chime") {
        playTone(880, now, 0.4); // A5
        playTone(659.25, now + 0.12, 0.6); // E5
      } else if (style === "success_ping") {
        playTone(1174.66, now, 0.8, "sine", 0.4); // D6
      } else if (style === "soft_notification") {
        playTone(523.25, now, 0.25); // C5
        playTone(659.25, now + 0.08, 0.25); // E5
        playTone(783.99, now + 0.16, 0.45); // G5
      } else if (style === "bell_alert") {
        playTone(987.77, now, 0.9, "triangle", 0.25); // B5
        playTone(992.77, now + 0.02, 0.8, "sine", 0.2); 
      } else if (style === "retro_beep") {
        playTone(950, now, 0.15, "square", 0.15);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  // Load sound configurations on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStyle = localStorage.getItem("admin_chime_sound_style");
      if (savedStyle) setSoundStyle(savedStyle);
      const savedEnabled = localStorage.getItem("admin_sound_notifications") !== "false";
      setSoundEnabled(savedEnabled);
    }
  }, []);

  // Save sound style changes
  const handleSoundStyleChange = (style: string) => {
    setSoundStyle(style);
    localStorage.setItem("admin_chime_sound_style", style);
    playAlertChime(style);
  };

  // Save sound enabled changes
  const toggleSound = () => {
    const val = !soundEnabled;
    setSoundEnabled(val);
    localStorage.setItem("admin_sound_notifications", String(val));
    if (val) playAlertChime(soundStyle);
  };

  // 1. Initial Load of active visitors (last 15 seconds)
  useEffect(() => {
    async function loadActiveVisitors() {
      setLoading(true);
      const cutoffTime = new Date(Date.now() - 15000).toISOString();
      
      const { data, error } = await supabase
        .from("active_visitors")
        .select("*")
        .gt("last_active", cutoffTime)
        .order("last_active", { ascending: false });

      if (!error && data) {
        setVisitors(data);
        // Initialize pathways with their current page
        const initialPaths: Record<string, string[]> = {};
        data.forEach(v => {
          initialPaths[v.session_id] = [v.current_url];
        });
        setPathways(initialPaths);
      }
      setLoading(false);
    }

    loadActiveVisitors();
  }, []);

  // 2. Real-time Subscription with chime alerts
  useEffect(() => {
    const channel = supabase
      .channel("realtime-visitors-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "active_visitors" }, (payload) => {
        const updatedRow = payload.new as Visitor;
        if (!updatedRow || !updatedRow.session_id) return;

        setVisitors((prev) => {
          const index = prev.findIndex((v) => v.session_id === updatedRow.session_id);
          const isNewVisitor = index === -1;

          // Check if this update happened in the last 15s (still active)
          const isActive = new Date(updatedRow.last_active).getTime() > Date.now() - 15000;

          if (!isActive) {
            // If inactive, filter them out
            return prev.filter((v) => v.session_id !== updatedRow.session_id);
          }

          // Trigger sound alert for new visitor landing
          if (isNewVisitor && soundEnabled) {
            playAlertChime(soundStyle);
          }

          // Update pathways log
          setPathways((prevPaths) => {
            const list = prevPaths[updatedRow.session_id] || [];
            if (list.length === 0 || list[list.length - 1] !== updatedRow.current_url) {
              return {
                ...prevPaths,
                [updatedRow.session_id]: [...list, updatedRow.current_url].slice(-5) // Keep last 5 actions
              };
            }
            return prevPaths;
          });

          if (isNewVisitor) {
            // Add new visitor at top
            return [updatedRow, ...prev];
          } else {
            // Update existing visitor details
            const updatedList = [...prev];
            updatedList[index] = updatedRow;
            return updatedList.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
          }
        });
      })
      .subscribe();

    // Loop interval to automatically prune dead sessions (> 15s inactive)
    const deadSessionPruner = setInterval(() => {
      const cutoff = Date.now() - 15000;
      setVisitors((prev) => 
        prev.filter((v) => new Date(v.last_active).getTime() > cutoff)
      );
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(deadSessionPruner);
    };
  }, [soundStyle, soundEnabled]);

  // Devices counter helpers
  const mobileCount = visitors.filter(v => v.device_type === "Mobile").length;
  const desktopCount = visitors.filter(v => v.device_type === "Desktop").length;
  const tabletCount = visitors.filter(v => v.device_type === "Tablet").length;

  return (
    <div style={{ padding: "32px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Activity size={28} style={{ color: "#22c55e" }} className="animate-pulse" />
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)" }}>Live Visitor Tracking</h1>
          </div>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Monitor customer pathways and checkout transitions in real-time</p>
        </div>

        {/* Audio Alerts Control Bar */}
        <div style={{ background: "white", padding: "12px 18px", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button 
              onClick={toggleSound}
              style={{
                border: "none",
                background: soundEnabled ? "var(--red)" : "var(--gray-200)",
                color: soundEnabled ? "white" : "var(--gray-600)",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justify: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              title={soundEnabled ? "Mute Sound Alerts" : "Enable Sound Alerts"}
            >
              <Volume2 size={18} style={{ margin: "auto" }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)" }}>Visitor Alerts</span>
          </div>

          <div style={{ width: 1, height: 24, background: "var(--gray-200)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select 
              value={soundStyle}
              onChange={e => handleSoundStyleChange(e.target.value)}
              disabled={!soundEnabled}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--gray-200)",
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                background: soundEnabled ? "white" : "var(--gray-50)",
                color: soundEnabled ? "var(--gray-800)" : "var(--gray-400)",
                cursor: soundEnabled ? "pointer" : "not-allowed"
              }}
            >
              <option value="double_chime">Double Chime (Default)</option>
              <option value="success_ping">Success Ping</option>
              <option value="soft_notification">Soft Notification</option>
              <option value="bell_alert">Bell Alert</option>
              <option value="retro_beep">Retro Beep</option>
            </select>

            <button 
              onClick={() => playAlertChime(soundStyle)}
              disabled={!soundEnabled}
              style={{
                border: "none",
                background: soundEnabled ? "var(--gray-900)" : "var(--gray-100)",
                color: soundEnabled ? "white" : "var(--gray-400)",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: soundEnabled ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <Play size={12} /> Test
            </button>
          </div>
        </div>
      </div>

      {/* Counters Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        
        {/* Total Active Visitors */}
        <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Visitors</span>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} className="animate-pulse" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "var(--gray-900)", marginTop: 8 }}>{visitors.length}</div>
          <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>Refreshes live on every action</p>
        </div>

        {/* Devices Summary */}
        <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", justify: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Devices Breakdown</span>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Monitor size={16} color="var(--gray-400)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>{desktopCount} <span style={{ fontWeight: 500, color: "var(--gray-500)", fontSize: 12 }}>Desktop</span></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Smartphone size={16} color="var(--gray-400)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-800)" }}>{mobileCount + tabletCount} <span style={{ fontWeight: 500, color: "var(--gray-500)", fontSize: 12 }}>Mobile</span></span>
            </div>
          </div>
        </div>

        {/* Status card */}
        <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d", flexShrink: 0 }}>
            <Compass size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: 15 }}>Realtime Channel</div>
            <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>CONNECTED & LISTENING</div>
          </div>
        </div>

      </div>

      {/* Main visitors list */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)" }}>Active Traffic</h2>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--gray-500)" }}>Loading active sessions...</div>
        ) : visitors.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--gray-400)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Activity size={40} color="var(--gray-300)" />
            <p style={{ fontSize: 14, fontWeight: 600 }}>No active visitors on the website right now.</p>
            <p style={{ fontSize: 12 }}>Open the shop page in incognito mode to see live updates</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "14px 24px", color: "var(--gray-500)", fontWeight: 700 }}>VISITOR LOCATION</th>
                  <th style={{ padding: "14px 24px", color: "var(--gray-500)", fontWeight: 700 }}>DEVICE & BROWSER</th>
                  <th style={{ padding: "14px 24px", color: "var(--gray-500)", fontWeight: 700 }}>CURRENT PAGE</th>
                  <th style={{ padding: "14px 24px", color: "var(--gray-500)", fontWeight: 700 }}>PATHWAY HISTORY</th>
                  <th style={{ padding: "14px 24px", color: "var(--gray-500)", fontWeight: 700 }}>LAST ACTIVE</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => {
                  const pathHistory = pathways[v.session_id] || [v.current_url];
                  return (
                    <tr key={v.session_id} style={{ borderBottom: "1px solid var(--gray-150)" }}>
                      
                      {/* Location */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)" }}>
                            <Globe size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>{v.location || "Unknown"}</div>
                            <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2 }}>IP: {v.ip_address || "Anonymous"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {v.device_type === "Mobile" ? (
                            <Smartphone size={16} color="var(--gray-600)" title="Mobile Device" />
                          ) : v.device_type === "Tablet" ? (
                            <Smartphone size={16} color="var(--gray-600)" title="Tablet Device" />
                          ) : (
                            <Monitor size={16} color="var(--gray-600)" title="Desktop Device" />
                          )}
                          <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>{v.browser}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>{v.device_type} User</div>
                      </td>

                      {/* Current Page */}
                      <td style={{ padding: "16px 24px" }}>
                        <a 
                          href={v.current_url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 4, 
                            color: "var(--red)", 
                            fontWeight: 700,
                            textDecoration: "none"
                          }}
                        >
                          {v.current_url === "/" ? "Home Page (/)" : v.current_url}
                          <ExternalLink size={12} />
                        </a>
                      </td>

                      {/* Pathway History */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                          {pathHistory.map((path, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ 
                                padding: "4px 8px", 
                                background: idx === pathHistory.length - 1 ? "#fef2f2" : "var(--gray-100)", 
                                border: idx === pathHistory.length - 1 ? "1px solid #fca5a5" : "1px solid var(--gray-200)",
                                color: idx === pathHistory.length - 1 ? "var(--red)" : "var(--gray-600)",
                                borderRadius: 4, 
                                fontSize: 11,
                                fontWeight: 600
                              }}>
                                {path === "/" ? "Home" : path.replace("/admin/", "").replace("/", "")}
                              </span>
                              {idx < pathHistory.length - 1 && <ArrowRight size={12} color="var(--gray-400)" />}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Last Active Heartbeat */}
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={14} color="var(--gray-400)" />
                          <span style={{ fontWeight: 600, color: "var(--gray-600)" }}>
                            Just now
                          </span>
                        </div>
                        <span style={{ fontSize: 10, color: "var(--gray-400)", display: "block", marginTop: 4 }}>
                          Session started: {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
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
