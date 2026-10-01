import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getProductBySlug, products } from '@/data/products';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let cleanSlug = decodeURIComponent(slug).trim().replace(/\s+/g, '-');
  
  if (/^[a-fA-F0-9]{32}$/.test(cleanSlug)) {
    cleanSlug = `${cleanSlug.slice(0, 8)}-${cleanSlug.slice(8, 12)}-${cleanSlug.slice(12, 16)}-${cleanSlug.slice(16, 20)}-${cleanSlug.slice(20)}`;
  }

  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanSlug);

  let product: any = null;
  try {
    product = await prisma.product.findFirst({
      where: isUUID ? {
        OR: [{ id: cleanSlug }, { slug: cleanSlug }]
      } : { slug: cleanSlug },
      include: { category: true, store: true }
    });
  } catch (e) {
    console.error("Error generating product metadata:", e);
  }

  if (!product) {
    product = getProductBySlug(cleanSlug) || products.find(p => p.id === cleanSlug);
  }

  if (!product) {
    return {
      title: "Product | DastiyabStore Pakistan",
      description: "Browse premium tech gadgets and lifestyle products on DastiyabStore with Cash on Delivery across Pakistan."
    };
  }

  const title = `${product.name} — Buy in Pakistan`;
  const description = product.description 
    ? product.description.slice(0, 160).replace(/\n+/g, ' ').trim() 
    : `Buy ${product.name} at the best price of Rs. ${product.price.toLocaleString()} in Pakistan with Cash on Delivery and easy returns on DastiyabStore.`;
  const image = product.image || 'https://dastiyabstore.com/icon.png';
  const url = `https://dastiyabstore.com/product/${product.slug || cleanSlug}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category?.name || "Shopping",
      "buy online Pakistan",
      "Cash on Delivery",
      "Karachi delivery",
      "DastiyabStore"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'DastiyabStore',
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    }
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
