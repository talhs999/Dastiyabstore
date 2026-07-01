import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load both .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('Starting data migration from Supabase to MySQL...');

  try {
    // 1. Migrate Categories
    console.log('Migrating Categories...');
    const { data: categories } = await supabase.from('categories').select('*');
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image: cat.image || null,
            is_in_sidebar: cat.is_in_sidebar || false,
            created_at: new Date(cat.created_at)
          }
        });
      }
      console.log(`✅ Migrated ${categories.length} categories.`);
    }

    // 2. Migrate Products
    console.log('Migrating Products...');
    const { data: products } = await supabase.from('products').select('*');
    if (products && products.length > 0) {
      for (const prod of products) {
        await prisma.product.upsert({
          where: { slug: prod.slug },
          update: {},
          create: {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: Number(prod.price),
            original_price: prod.original_price ? Number(prod.original_price) : null,
            image: prod.image,
            images: prod.images || [],
            rating: Number(prod.rating) || 0,
            reviews: Number(prod.reviews) || 0,
            badge: prod.badge || null,
            badge_type: prod.badge_type || null,
            is_new: prod.is_new || false,
            in_stock: prod.in_stock !== false,
            category_id: prod.category_id || null,
            description: prod.description || null,
            specs: prod.specs || [],
            features: prod.features || [],
            is_featured: prod.is_featured || false,
            is_best_seller: prod.is_best_seller || false,
            created_at: new Date(prod.created_at)
          }
        });
      }
      console.log(`✅ Migrated ${products.length} products.`);
    }

    // 3. Migrate Customers
    console.log('Migrating Customers...');
    const { data: customers } = await supabase.from('customers').select('*');
    if (customers && customers.length > 0) {
      for (const cust of customers) {
        await prisma.customer.upsert({
          where: { email: cust.email },
          update: {},
          create: {
            id: cust.id,
            email: cust.email,
            password: cust.password,
            name: cust.name || null,
            role: cust.role || 'customer',
            created_at: new Date(cust.created_at)
          }
        });
      }
      console.log(`✅ Migrated ${customers.length} customers.`);
    }

    // 4. Migrate Orders
    console.log('Migrating Orders...');
    const { data: orders } = await supabase.from('orders').select('*');
    if (orders && orders.length > 0) {
      for (const order of orders) {
        await prisma.order.upsert({
          where: { id: order.id },
          update: {},
          create: {
            id: order.id,
            customer_id: order.customer_id || null,
            total: Number(order.total) || 0,
            status: order.status || 'pending',
            payment_method: order.payment_method || 'cod',
            shipping_address: order.shipping_address || null,
            email: order.email || null,
            first_name: order.first_name || null,
            last_name: order.last_name || null,
            phone: order.phone || null,
            company: order.company || null,
            address: order.address || null,
            apartment: order.apartment || null,
            city: order.city || null,
            state: order.state || null,
            postal_code: order.postal_code || null,
            save_info: order.save_info || false,
            created_at: new Date(order.created_at),
            items: order.items || []
          }
        });
      }
      console.log(`✅ Migrated ${orders.length} orders.`);
    }
    
    // 5. Migrate Settings
    console.log('Migrating Store Settings...');
    const { data: settings } = await supabase.from('store_settings').select('*');
    if (settings && settings.length > 0) {
      for (const setting of settings) {
        await prisma.storeSetting.upsert({
          where: { key: setting.key },
          update: { 
            value: setting.value, 
            updated_at: setting.updated_at ? new Date(setting.updated_at) : new Date() 
          },
          create: {
            key: setting.key,
            value: setting.value,
            created_at: setting.created_at ? new Date(setting.created_at) : new Date(),
            updated_at: setting.updated_at ? new Date(setting.updated_at) : new Date()
          }
        });
      }
      console.log(`✅ Migrated ${settings.length} settings.`);
    }

    // 6. Migrate Instagram Posts
    console.log('Migrating Instagram Posts...');
    const { data: insta } = await supabase.from('instagram_posts').select('*');
    if (insta && insta.length > 0) {
      for (const post of insta) {
        await prisma.instagramPost.upsert({
          where: { shortcode: post.shortcode },
          update: {},
          create: {
            id: post.id,
            shortcode: post.shortcode,
            image_url: post.image_url || null,
            video_url: post.video_url || null,
            caption: post.caption || null,
            created_at: new Date(post.created_at)
          }
        });
      }
      console.log(`✅ Migrated ${insta.length} instagram posts.`);
    }

    // 7. Migrate QnA
    console.log('Migrating QnA...');
    const { data: qnas } = await supabase.from('product_qna').select('*');
    if (qnas && qnas.length > 0) {
      for (const qna of qnas) {
        await prisma.productQna.upsert({
          where: { id: qna.id },
          update: {},
          create: {
            id: qna.id,
            product_id: qna.product_id,
            customer_id: qna.customer_id || null,
            customer_name: qna.customer_name,
            question: qna.question,
            answer: qna.answer || null,
            is_answered: qna.is_answered || false,
            answered_at: qna.answered_at ? new Date(qna.answered_at) : null,
            created_at: new Date(qna.created_at)
          }
        });
      }
      console.log(`✅ Migrated ${qnas.length} QnAs.`);
    }
    
    // 8. Migrate Reviews
    console.log('Migrating Reviews...');
    const { data: reviews } = await supabase.from('product_reviews').select('*');
    if (reviews && reviews.length > 0) {
      for (const rev of reviews) {
        await prisma.productReview.upsert({
          where: { id: rev.id },
          update: {},
          create: {
            id: rev.id,
            product_id: rev.product_id,
            order_id: rev.order_id || null,
            customer_name: rev.customer_name,
            rating: Number(rev.rating),
            review_text: rev.review_text,
            images: rev.images || [],
            is_approved: rev.is_approved || false,
            created_at: new Date(rev.created_at)
          }
        });
      }
      console.log(`✅ Migrated ${reviews.length} reviews.`);
    }

    console.log('🎉 Full Migration Complete!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
