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

  const sendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const userMessage = textOverride || input.trim();
    if (!userMessage) return;
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
          history: messages.filter(m => m.role !== "model" || m.content !== "Hi there! I am the DastiyabStore AI Assistant. How can I help you today?"),
          message: userMessage
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream available");
      
      const decoder = new TextDecoder("utf-8");
      let botMessage = "";
      
      // Initialize empty bot message in UI
      setMessages([...newMessages, { role: "model", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        botMessage += decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "model", content: botMessage };
          return updated;
        });
      }
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
        className="chatbot-floating-btn"
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
          className="chatbot-window animate-fade-up"
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
            {messages.map((msg, i) => {
              // Parse links in the format [Text](URL)
              const formatMessage = (text: string) => {
                const linkRegex = /\[(.*?)\]\((.*?)\)/g;
                const parts: React.ReactNode[] = [];
                let lastIndex = 0;
                let match;
                
                while ((match = linkRegex.exec(text)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(text.substring(lastIndex, match.index));
                  }
                  parts.push(
                    <a key={`link-${match.index}`} href={match[2]} target={match[2].startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 6, marginBottom: 6, marginRight: 6, padding: "6px 12px", background: msg.role === "user" ? "rgba(255,255,255,0.2)" : "var(--red)", color: "white", borderRadius: "12px", textDecoration: "none", fontSize: "12px", fontWeight: 600, border: "none" }}>
                      {match[1]}
                    </a>
                  );
                  lastIndex = linkRegex.lastIndex;
                }
                
                if (lastIndex < text.length) {
                  parts.push(text.substring(lastIndex));
                }
                
                return parts.map((part, i) => {
                  if (typeof part === 'string') {
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const subParts: React.ReactNode[] = [];
                    let bLastIndex = 0;
                    let bMatch;
                    while ((bMatch = boldRegex.exec(part)) !== null) {
                      if (bMatch.index > bLastIndex) subParts.push(part.substring(bLastIndex, bMatch.index));
                      subParts.push(<strong key={`bold-${i}-${bMatch.index}`}>{bMatch[1]}</strong>);
                      bLastIndex = boldRegex.lastIndex;
                    }
                    if (bLastIndex < part.length) subParts.push(part.substring(bLastIndex));
                    return subParts.length > 0 ? subParts : part;
                  }
                  return part;
                });
              };

              return (
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
                    border: msg.role === "model" ? "1px solid var(--gray-200)" : "none",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {formatMessage(msg.content)}
                </div>
              </div>
            );
          })}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "white", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", border: "1px solid var(--gray-200)" }}>
                <Loader2 size={16} className="animate-spin" color="var(--gray-500)" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div style={{ padding: "12px 16px 0", background: "white", display: "flex", gap: 8, overflowX: "auto", whiteSpace: "nowrap", borderTop: "1px solid var(--gray-200)" }} className="hide-scrollbar">
              {["Salam 👋", "Best Neck Fans?", "Delivery details?", "Contact info?"].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(undefined, prompt)}
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    background: "var(--gray-50)",
                    border: "1px solid var(--gray-200)",
                    borderRadius: 16,
                    fontSize: 12,
                    color: "var(--gray-700)",
                    cursor: loading ? "default" : "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={e => sendMessage(e)} style={{ padding: 16, background: "white", borderTop: messages.length === 1 ? "none" : "1px solid var(--gray-200)", display: "flex", gap: 8 }}>
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
