import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { Calendar, User, ChevronLeft, Share2 } from "lucide-react";

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const p = await params;
  const blog = blogs.find(b => b.slug === p.slug);
  
  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      images: [blog.image],
      type: "article",
    }
  };
}

export default async function SingleBlogPage({ params }: { params: any }) {
  const p = await params;
  const blog = blogs.find(b => b.slug === p.slug);
  
  if (!blog) {
    return notFound();
  }

  return (
    <article style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px", minHeight: "80vh" }}>
      {/* Back button */}
      <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gray-500)", textDecoration: "none", marginBottom: 32, fontWeight: 500 }}>
        <ChevronLeft size={16} /> Back to Blogs
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span className="badge badge-yellow">{blog.category}</span>
          <span style={{ color: "var(--gray-400)" }}>|</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--gray-500)" }}>
            <Calendar size={16} /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "var(--gray-900)", lineHeight: 1.3, marginBottom: 24 }}>
          {blog.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--red)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {blog.author.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{blog.author}</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Author</div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div style={{ width: "100%", height: "auto", aspectRatio: "16/9", position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 48, boxShadow: "var(--shadow-lg)" }}>
        <img 
          src={blog.image} 
          alt={blog.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </div>

      {/* Content */}
      <div 
        className="blog-content"
        style={{ 
          fontSize: 17, 
          lineHeight: 1.8, 
          color: "var(--gray-700)"
        }}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      
      {/* Dynamic CSS for the blog content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--gray-900);
          margin-top: 40px;
          margin-bottom: 20px;
        }
        .blog-content h3 {
          font-size: 22px;
          font-weight: 600;
          color: var(--gray-800);
          margin-top: 32px;
          margin-bottom: 16px;
        }
        .blog-content p {
          margin-bottom: 24px;
        }
        .blog-content .backlink {
          color: var(--red);
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s;
        }
        .blog-content .backlink:hover {
          border-bottom-color: var(--red);
        }
        .share-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          cursor: pointer;
          color: var(--gray-600);
          transition: all 0.2s;
        }
        .share-btn:hover {
          border-color: var(--red);
          color: var(--red);
        }
      `}} />

      {/* Share Section */}
      <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--gray-900)" }}>Share this article</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="share-btn">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
