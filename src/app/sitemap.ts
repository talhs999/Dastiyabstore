import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dastiyabstore.com';

  // Define static routes
  const staticRoutes = [
    '',
    '/shop',
    '/gifts',
    '/about',
    '/contact',
    '/faqs',
    '/returns',
    '/account/wishlist',
    '/cart',
    '/checkout',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic product and category routes
  let products: any[] = [];
  let categories: any[] = [];
  try {
    products = await prisma.product.findMany({
      select: { slug: true, created_at: true },
    });
    categories = await prisma.category.findMany({
      select: { slug: true },
    });
  } catch (error) {
    console.error("Error fetching data for sitemap", error);
  }

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.created_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/shop/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Import blogs dynamically or use static data
  const { blogs } = await import('@/data/blogs');
  const blogRoutes = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
