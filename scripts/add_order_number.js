const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function addOrderNumber() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // Add order_number column
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
    `);
    console.log("Added order_number column to orders table.");

  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    await client.end();
  }
}

addOrderNumber();
