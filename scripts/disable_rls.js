require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function disableRLS() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database...");
    
    await client.query(`ALTER TABLE orders DISABLE ROW LEVEL SECURITY;`);
    console.log("Disabled RLS on orders.");
    
    await client.query(`ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;`);
    console.log("Disabled RLS on order_items.");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

disableRLS();
