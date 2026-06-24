const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // 1. Add badges column
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;
    `);
    console.log("Added badges column.");

    // 2. Add trust_points column
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS trust_points jsonb DEFAULT '[]'::jsonb;
    `);
    console.log("Added trust_points column.");

    // 3. Migrate existing badge values to badges JSONB array
    await client.query(`
      UPDATE products 
      SET badges = jsonb_build_array(jsonb_build_object('text', badge, 'type', COALESCE(badge_type, 'yellow')))
      WHERE badge IS NOT NULL AND (badges IS NULL OR jsonb_array_length(badges) = 0);
    `);
    console.log("Migrated existing single badge values to badges jsonb array.");

    // 4. Migrate default trust points to products that don't have trust_points or have empty trust_points
    const defaultTrustPoints = JSON.stringify([
      { icon: "truck", text: "Free delivery on orders above Rs. 2000" },
      { icon: "shield", text: "100% authentic & quality guaranteed" },
      { icon: "rotate-ccw", text: "7-day easy returns & exchanges" },
      { icon: "zap", text: "Cash on Delivery available nationwide" }
    ]);

    await client.query(`
      UPDATE products 
      SET trust_points = $1::jsonb
      WHERE trust_points IS NULL OR jsonb_array_length(trust_points) = 0;
    `, [defaultTrustPoints]);
    console.log("Migrated default trust points to all products.");

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

migrate();
