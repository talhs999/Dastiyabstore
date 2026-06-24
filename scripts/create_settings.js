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
      CREATE TABLE IF NOT EXISTS store_settings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        key text NOT NULL UNIQUE,
        value jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;
      
      INSERT INTO store_settings (key, value)
      VALUES ('newsletter_enabled', 'true')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log("Settings table created successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
