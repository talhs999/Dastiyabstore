import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogs } from "@/data/blogs";
import { Calendar, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Dastiyab Store Blog | Tech Guides & Gadget Reviews",
  description: "Read the latest tech guides, gadget reviews, and shopping tips from Dastiyab Store. Discover top smartwatches, headphones, and more.",
};

export default function BlogPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px", minHeight: "80vh" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "var(--gray-900)", marginBottom: 16 }}>
          Dastiyab <span style={{ color: "var(--red)" }}>Blog</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--gray-600)", maxWidth: 600, margin: "0 auto" }}>
          Stay updated with the latest trends, gadget reviews, and lifestyle tips from our experts.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-card {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--gray-200);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
        }
        .blog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.05);
        }
      `}} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 }}>
        {blogs.map((blog) => (
          <article key={blog.id} className="blog-card">
            <Link href={`/blog/${blog.slug}`} style={{ display: "block", position: "relative", height: 240, overflow: "hidden" }}>
              <img src={blog.image} alt={blog.title} className="blog-card-img" />
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <span className="badge badge-yellow">{blog.category}</span>
              </div>
            </Link>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--gray-500)", marginBottom: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={14} /> {blog.author}
                </span>
              </div>
              
              <Link href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 12, lineHeight: 1.4 }}>
                  {blog.title}
                </h2>
              </Link>
              
              <p style={{ color: "var(--gray-600)", fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                {blog.excerpt}
              </p>
              
              <Link href={`/blog/${blog.slug}`} className="btn-primary" style={{ alignSelf: "flex-start", padding: "10px 24px" }}>
                Read Article
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
