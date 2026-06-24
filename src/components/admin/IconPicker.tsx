"use client";
import { useState, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";

// Curated list of icons
const ICON_NAMES = [
  // Tech & Gadgets (35)
  "Laptop", "Smartphone", "Monitor", "Watch", "Headphones", "Speaker", "Tv", 
  "Camera", "Gamepad2", "Mouse", "Keyboard", "Printer", "Router", "Cpu", 
  "Battery", "Cable", "Zap", "Power", "Mic", "Video", "Tablet", 
  "Radio", "HardDrive", "Usb", "Bluetooth", "Plug", "Cast", "Server", 
  "Database", "Save", "Download", "Cloud", "Wifi", "Terminal", "Code",

  // E-Commerce & Shipping (20)
  "Package", "ShoppingBag", "ShoppingCart", "Gift", "Truck", "CreditCard", "Wallet", 
  "Banknote", "Percent", "Tag", "Tags", "Store", "Barcode", "Receipt", 
  "Ticket", "Archive", "Box", "MapPin", "Navigation", "Compass",

  // Home, Lifestyle & Fashion (20)
  "Home", "Coffee", "Briefcase", "Glasses", "Shirt", "Umbrella", "Scissors", 
  "Tool", "Wrench", "Hammer", "Sun", "Moon", "Flame", "Snowflake", 
  "Droplet", "Activity", "Book", "Car", "Bike", "Plane",

  // UI & General (25)
  "Heart", "Star", "ThumbsUp", "MessageCircle", "Send", "Share", "Search", 
  "Settings", "Link", "Bookmark", "Check", "Plus", "Info", "AlertCircle", 
  "Bell", "Eye", "Lock", "Shield", "User", "Users", "Key", 
  "Image", "Music", "Folder", "File"
];

export default function IconPicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentIcon = (LucideIcons as any)[value] || LucideIcons.Package;
  const ChevronDown = LucideIcons.ChevronDown;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: "flex", alignItems: "center", gap: 8, 
          padding: "6px 12px", border: "1px solid var(--gray-200)", 
          borderRadius: "var(--radius)", background: "white", 
          cursor: "pointer", fontSize: 13, color: "var(--gray-700)",
          width: 140
        }}
      >
        <CurrentIcon size={16} />
        <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || "Package"}</span>
        <ChevronDown size={14} style={{ color: "var(--gray-400)" }} />
      </button>

      {isOpen && (
        <div style={{ 
          position: "absolute", top: "100%", left: 0, marginTop: 4, 
          background: "white", border: "1px solid var(--gray-200)", 
          borderRadius: "var(--radius-lg)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", 
          width: 250, padding: 12, zIndex: 100,
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 
        }}>
          {ICON_NAMES.map(name => {
            const Icon = (LucideIcons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38, borderRadius: 8, border: "none",
                  background: value === name ? "var(--red)" : "transparent",
                  color: value === name ? "white" : "var(--gray-600)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  if (value !== name) (e.currentTarget as HTMLElement).style.background = "var(--gray-100)";
                }}
                onMouseLeave={e => {
                  if (value !== name) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
