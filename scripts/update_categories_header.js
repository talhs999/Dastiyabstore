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
      ADD COLUMN IF NOT EXISTS is_in_header boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS header_badge text DEFAULT NULL;
    `);
    
    // Set some default categories to be in the header just to keep it working
    await client.query(`
      UPDATE categories SET is_in_header = true, header_badge = 'HOT' WHERE slug = 'neck-fan';
      UPDATE categories SET is_in_header = true WHERE slug IN ('laptop-stand', 'airpods');
    `);

    console.log("Categories table updated successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
