require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS is_in_sidebar boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS sidebar_icon text DEFAULT 'Package',
      ADD COLUMN IF NOT EXISTS sidebar_desc text DEFAULT '',
      ADD COLUMN IF NOT EXISTS sidebar_image text DEFAULT '',
      ADD COLUMN IF NOT EXISTS sidebar_popular_items jsonb DEFAULT '[]'::jsonb;
    `);
    
    // Set some defaults based on what's currently in the hardcoded arrays
    await client.query(`
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Headphones', sidebar_desc = 'Wireless neckband earphones with super bass & mic', sidebar_image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80', sidebar_popular_items = '["DastiyabSound X1", "Bass Pro X2", "Sport Flex"]'::jsonb WHERE slug = 'neckband';
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Music', sidebar_desc = 'True wireless earbuds with ANC & long battery life', sidebar_image = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80', sidebar_popular_items = '["DastiyabBuds Pro", "DastiyabBuds Lite", "AirMax"]'::jsonb WHERE slug = 'airpods';
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Wind', sidebar_desc = 'Bladeless wearable neck fans for summer cooling', sidebar_image = 'https://images.unsplash.com/photo-1625765503151-c1a10cc57b44?w=300&q=80', sidebar_popular_items = '["NeckCool Pro", "360° AirWrap", "SlimFan Mini"]'::jsonb WHERE slug = 'neck-fan';
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Fan', sidebar_desc = 'USB & rechargeable portable desk fans', sidebar_image = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', sidebar_popular_items = '["USB Desk Fan", "Handheld Mini Fan", "Tower Fan"]'::jsonb WHERE slug = 'portable-fan';
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Laptop', sidebar_desc = 'Adjustable aluminum stands for all laptop sizes', sidebar_image = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80', sidebar_popular_items = '["Aluminum Pro Stand", "Foldable Lite", "XL Stand"]'::jsonb WHERE slug = 'laptop-stand';
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Smartphone', sidebar_desc = 'Cables, cases, chargers and more', sidebar_image = 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&q=80', sidebar_popular_items = '["Type-C Cable", "Fast Charger", "Phone Stand"]'::jsonb WHERE slug = 'mobile-accessories';
      UPDATE categories SET is_in_sidebar = true, sidebar_icon = 'Cpu', sidebar_desc = 'Smart home gadgets for everyday life', sidebar_image = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', sidebar_popular_items = '["Smart Plug", "LED Strip"]'::jsonb WHERE slug = 'home-gadgets';
    `);

    console.log("Categories table updated successfully for Sidebar.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
