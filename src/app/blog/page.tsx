import { Metadata } from "next";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dastiyab Blog — Tech Guides, Streetwear & Shopping in Pakistan",
  description: "Read the latest tech guides, streetwear trends, gadget reviews, and online shopping tips from Dastiyab Store. Discover top smartwatches, baggy trousers, and seller tips.",
  alternates: {
    canonical: "https://dastiyabstore.com/blog",
  },
  openGraph: {
    title: "Dastiyab Blog — Tech Guides, Streetwear & Shopping in Pakistan",
    description: "Read the latest tech guides, streetwear trends, gadget reviews, and online shopping tips from Dastiyab Store.",
    url: "https://dastiyabstore.com/blog",
    siteName: "DastiyabStore",
    type: "website",
    images: [
      {
        url: "https://dastiyabstore.com/icon.png",
        width: 800,
        height: 600,
        alt: "Dastiyab Store Blog",
      },
    ],
  },
};

export default function BlogPage() {
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Dastiyab Store Official Blog",
    "url": "https://dastiyabstore.com/blog",
    "description": "Guides, reviews, and shopping insights for smart tech, streetwear, and lifestyle gadgets in Pakistan.",
    "blogPost": blogs.map(b => ({
      "@type": "BlogPosting",
      "headline": b.title,
      "description": b.excerpt,
      "url": `https://dastiyabstore.com/blog/${b.slug}`,
      "datePublished": b.date,
      "author": {
        "@type": "Person",
        "name": b.author
      },
      "image": b.image
    }))
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px", minHeight: "80vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "inline-block", background: "rgba(220,38,38,0.08)", color: "var(--red)", fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 20, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Insights & Guides
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "var(--gray-900)", marginBottom: 16 }}>
          Dastiyab <span style={{ color: "var(--red)" }}>Blog</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--gray-600)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
          Expert shopping guides, streetwear styling tips, tech gadget reviews, and seller resources in Pakistan.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-card {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .blog-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
          border-color: rgba(220,38,38,0.3);
        }
        .blog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.06);
        }
      `}} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 32 }}>
        {blogs.map((blog) => (
          <article key={blog.id} className="blog-card">
            <Link href={`/blog/${blog.slug}`} style={{ display: "block", position: "relative", height: 230, overflow: "hidden", background: "var(--gray-100)" }}>
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="blog-card-img" 
                loading="lazy" 
                decoding="async" 
                width="600" 
                height="340"
              />
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <span className="badge badge-yellow" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontWeight: 700 }}>
                  {blog.category}
                </span>
              </div>
            </Link>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--gray-500)", marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={14} color="var(--gray-400)" /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <User size={14} color="var(--gray-400)" /> {blog.author}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
                  <Clock size={13} color="var(--gray-400)" /> 4 min
                </span>
              </div>
              
              <Link href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }}>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12, lineHeight: 1.4 }}>
                  {blog.title}
                </h2>
              </Link>
              
              <p style={{ color: "var(--gray-600)", fontSize: 14, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                {blog.excerpt}
              </p>
              
              <Link href={`/blog/${blog.slug}`} className="btn-primary" style={{ alignSelf: "flex-start", padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                Read Guide <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
