"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "model";
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hi there! I am the DastiyabStore AI Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI
    const newMessages = [...messages, { role: "user", content: userMessage } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.filter(m => m.role !== "model" || m.content !== "Hi there! I am the DastiyabStore AI Assistant. How can I help you today?"), // exclude initial greeting
          message: userMessage
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages([...newMessages, { role: "model", content: data.response }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: "model", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24, // Chatbot on the left, WhatsApp on the right
          width: 60,
          height: 60,
          backgroundColor: "var(--red)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 9999,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          border: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{
            position: "fixed",
            bottom: 96,
            left: 24,
            width: "90%",
            maxWidth: 380,
            height: 500,
            backgroundColor: "white",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid var(--gray-200)"
          }}
          className="animate-fade-up"
        >
          {/* Header */}
          <div style={{ background: "var(--red)", color: "white", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <Bot size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Dastiyab Store</h3>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Powered by DastiyabStore</p>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, background: "var(--gray-50)" }}>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <span style={{ fontSize: 11, color: "var(--gray-500)", alignSelf: msg.role === "user" ? "flex-end" : "flex-start", marginLeft: 4, marginRight: 4 }}>
                  {msg.role === "user" ? "You" : "AI Assistant"}
                </span>
                <div 
                  style={{
                    background: msg.role === "user" ? "var(--red)" : "white",
                    color: msg.role === "user" ? "white" : "var(--gray-800)",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    border: msg.role === "model" ? "1px solid var(--gray-200)" : "none"
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "white", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", border: "1px solid var(--gray-200)" }}>
                <Loader2 size={16} className="animate-spin" color="var(--gray-500)" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{ padding: 16, background: "white", borderTop: "1px solid var(--gray-200)", display: "flex", gap: 8 }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "10px 16px", borderRadius: 20, border: "1px solid var(--gray-300)", outline: "none", fontSize: 14 }}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: input.trim() && !loading ? "var(--red)" : "var(--gray-200)",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "default",
                transition: "background 0.2s"
              }}
            >
              <Send size={18} style={{ marginLeft: -2 }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
