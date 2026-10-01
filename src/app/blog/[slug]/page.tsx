import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { Calendar, User, ChevronLeft, Share2, ShoppingBag, ArrowRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await params;
  const blog = blogs.find(b => b.slug === p.slug);
  
  if (!blog) {
    return { title: "Blog Not Found | Dastiyab Store" };
  }

  const url = `https://dastiyabstore.com/blog/${blog.slug}`;

  return {
    title: `${blog.metaTitle}`,
    description: blog.metaDescription,
    alternates: {
      canonical: url,
    },
    keywords: [
      blog.category,
      "Dastiyab Store Blog",
      "shopping guide Pakistan",
      "Cash on Delivery",
      blog.title
    ],
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      url,
      images: [
        {
          url: blog.image,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ],
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author],
      siteName: "DastiyabStore",
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle,
      description: blog.metaDescription,
      images: [blog.image],
    }
  };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const blog = blogs.find(b => b.slug === p.slug);
  
  if (!blog) {
    return notFound();
  }

  const url = `https://dastiyabstore.com/blog/${blog.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.image,
    "datePublished": blog.date,
    "dateModified": blog.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "author": {
      "@type": "Person",
      "name": blog.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Dastiyab Store",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dastiyabstore.com/icon.png"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://dastiyabstore.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://dastiyabstore.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": url
      }
    ]
  };

  const otherBlogs = blogs.filter(b => b.id !== blog.id).slice(0, 3);

  return (
    <article style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px", minHeight: "80vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Back button */}
      <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gray-500)", textDecoration: "none", marginBottom: 32, fontWeight: 600, fontSize: 14 }}>
        <ChevronLeft size={16} /> Back to All Guides
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span className="badge badge-yellow" style={{ fontWeight: 700 }}>{blog.category}</span>
          <span style={{ color: "var(--gray-300)" }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--gray-500)" }}>
            <Calendar size={15} color="var(--gray-400)" /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: "var(--gray-900)", lineHeight: 1.25, marginBottom: 24 }}>
          {blog.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--red)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>
            {blog.author.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: 15 }}>{blog.author}</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)" }}>Dastiyab Editorial Contributor</div>
          </div>
        </div>
      </div>

      {/* Featured Image with LCP Optimization */}
      <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 48, boxShadow: "var(--shadow-lg)", background: "var(--gray-100)" }}>
        <img 
          src={blog.image} 
          alt={blog.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
          fetchPriority="high"
          loading="eager"
          decoding="sync"
        />
      </div>

      {/* Content */}
      <div 
        className="blog-content"
        style={{ 
          fontSize: 18, 
          lineHeight: 1.8, 
          color: "var(--gray-800)"
        }}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      
      {/* Dynamic CSS for the blog content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h2 {
          font-size: 26px;
          font-weight: 800;
          color: var(--gray-900);
          margin-top: 44px;
          margin-bottom: 18px;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 21px;
          font-weight: 700;
          color: var(--gray-800);
          margin-top: 32px;
          margin-bottom: 14px;
        }
        .blog-content p {
          margin-bottom: 22px;
        }
        .blog-content .backlink {
          color: var(--red);
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 700;
          transition: opacity 0.2s;
        }
        .blog-content .backlink:hover {
          opacity: 0.8;
        }
      `}} />

      {/* Call to action box */}
      <div style={{ marginTop: 56, padding: "32px", borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, #fff5f5 0%, #fff9e6 100%)", border: "1px solid rgba(220,38,38,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 6 }}>Ready to Upgrade Your Lifestyle?</h3>
          <p style={{ fontSize: 14, color: "var(--gray-600)", margin: 0 }}>Browse our best-selling tech gadgets and streetwear with Cash on Delivery nationwide.</p>
        </div>
        <Link href="/shop" className="btn-red" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", textDecoration: "none", fontWeight: 700 }}>
          <ShoppingBag size={16} /> Explore Store
        </Link>
      </div>

      {/* Related articles */}
      {otherBlogs.length > 0 && (
        <div style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--gray-200)" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--gray-900)", marginBottom: 24 }}>More from Dastiyab Blog</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {otherBlogs.map(b => (
              <Link key={b.id} href={`/blog/${b.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 10, background: "var(--gray-50)", padding: 16, borderRadius: 12, border: "1px solid var(--gray-200)" }}>
                <span className="badge badge-yellow" style={{ alignSelf: "flex-start", fontSize: 11 }}>{b.category}</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)", lineHeight: 1.4 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: "auto" }}>
                  Read now <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
