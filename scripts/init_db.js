const { Client } = require('pg');

async function initDB() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // Create Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city TEXT NOT NULL,
        order_notes TEXT,
        subtotal NUMERIC NOT NULL,
        shipping_fee NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        payment_method TEXT DEFAULT 'COD',
        status TEXT DEFAULT 'Pending'
      );
    `);
    console.log("Created orders table.");

    // Create Order Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_image TEXT,
        price NUMERIC NOT NULL,
        quantity INTEGER NOT NULL
      );
    `);
    console.log("Created order_items table.");

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    await client.end();
  }
}

initDB();
