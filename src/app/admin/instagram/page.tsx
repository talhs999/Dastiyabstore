"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Instagram } from "lucide-react";

export default function InstagramFeedAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error(error);
      showToast("Error loading posts", "error");
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const extractShortcode = (url: string) => {
    try {
      // Examples: 
      // https://www.instagram.com/p/C5O9_XXXXXX/
      // https://www.instagram.com/reel/C5O9_XXXXXX/
      const match = url.match(/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const shortcode = extractShortcode(newUrl);
    if (!shortcode) {
      showToast("Invalid Instagram URL. Please use a /p/ or /reel/ link.", "error");
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("instagram_posts")
      .insert([{ shortcode }])
      .select();

    if (error) {
      if (error.code === '23505') {
        showToast("This post is already added.", "error");
      } else {
        showToast("Failed to add post", "error");
      }
    } else {
      showToast("Post added successfully!", "success");
      setNewUrl("");
      setPosts((prev) => [data[0], ...prev]);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this post from the homepage?")) return;
    
    const { error } = await supabase
      .from("instagram_posts")
      .delete()
      .eq("id", id);
      
    if (error) {
      showToast("Error deleting post", "error");
    } else {
      showToast("Post removed", "success");
      setPosts((prev) => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>Instagram Feed</h1>
          <p style={{ color: "var(--gray-500)", marginTop: 4 }}>Manage the Instagram carousel on the homepage</p>
        </div>
      </div>

      <div style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add New Post</h2>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: 10, color: "var(--gray-400)" }}>
              <Instagram size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Paste Instagram Post or Reel URL here..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{
                width: "100%", padding: "10px 16px 10px 42px", borderRadius: 8,
                border: "1px solid var(--gray-300)", outline: "none", fontSize: 15
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !newUrl}
            style={{
              padding: "0 24px", background: "var(--red)", color: "white",
              border: "none", borderRadius: 8, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8, opacity: (isSubmitting || !newUrl) ? 0.7 : 1
            }}
          >
            <Plus size={18} />
            {isSubmitting ? "Adding..." : "Add Post"}
          </button>
        </form>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No posts added yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "14px 24px", fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>Preview</th>
                <th style={{ padding: "14px 24px", fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>Shortcode</th>
                <th style={{ padding: "14px 24px", fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>Added On</th>
                <th style={{ padding: "14px 24px", fontSize: 13, fontWeight: 600, color: "var(--gray-500)", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <a href={`https://www.instagram.com/p/${post.shortcode}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", borderRadius: 8, overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                      <iframe src={`https://www.instagram.com/p/${post.shortcode}/embed/captioned`} width="200" height="240" frameBorder="0" scrolling="no" style={{ display: "block" }}></iframe>
                    </a>
                  </td>
                  <td style={{ padding: "16px 24px", fontWeight: 600 }}>{post.shortcode}</td>
                  <td style={{ padding: "16px 24px", color: "var(--gray-500)", fontSize: 14 }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(post.id)} style={{ background: "#fee2e2", color: "var(--red)", border: "none", padding: 8, borderRadius: 6, cursor: "pointer" }} title="Remove Post">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
