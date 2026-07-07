import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dastiyabstore.pk'; // replace with your actual domain

  // Define static routes
  const staticRoutes = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/account/wishlist',
    '/cart',
    '/checkout',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic product routes
  let products = [];
  try {
    products = await prisma.product.findMany({
      select: {
        slug: true,
        updated_at: true,
      },
    });
  } catch (error) {
    console.error("Error fetching products for sitemap", error);
  }

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Import blogs dynamically or use static data
  const { blogs } = await import('@/data/blogs');
  const blogRoutes = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
