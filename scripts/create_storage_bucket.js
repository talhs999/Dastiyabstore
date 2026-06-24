require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    // Create the bucket if it doesn't exist
    await client.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('product-images', 'product-images', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Add RLS Policies for storage.objects
    // We allow anyone to SELECT (read) the images
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access'
          ) THEN
              CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
          END IF;
      END
      $$;
    `);

    // We allow anyone to INSERT (upload) images for now (in production, restrict to authenticated admins)
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow Uploads'
          ) THEN
              CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );
          END IF;
      END
      $$;
    `);

    // Ensure RLS is enabled
    await client.query(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);

    console.log("Storage bucket 'product-images' created and configured successfully!");
  } catch (err) {
    console.error("Error creating storage bucket:", err);
  } finally {
    await client.end();
  }
}
run();
