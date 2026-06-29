import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    return NextResponse.json({ error: "No SUPABASE_DATABASE_URL" }, { status: 500 });
  }

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.instagram_posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        shortcode TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await client.query(`
      ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public can view instagram posts" ON public.instagram_posts;
      CREATE POLICY "Public can view instagram posts"
        ON public.instagram_posts FOR SELECT
        TO public
        USING (true);

      DROP POLICY IF EXISTS "Admin can insert instagram posts" ON public.instagram_posts;
      CREATE POLICY "Admin can insert instagram posts"
        ON public.instagram_posts FOR INSERT
        TO public
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Admin can delete instagram posts" ON public.instagram_posts;
      CREATE POLICY "Admin can delete instagram posts"
        ON public.instagram_posts FOR DELETE
        TO public
        USING (true);
    `);

    // Insert dummy post
    const res = await client.query('SELECT COUNT(*) FROM public.instagram_posts');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO public.instagram_posts (shortcode) 
        VALUES ('DEa_VbUN90I') 
        ON CONFLICT DO NOTHING
      `);
    }

    await client.end();
    return NextResponse.json({ success: true, message: "Migration completed successfully" });
  } catch (error: any) {
    console.error("Migration error:", error);
    try { await client.end(); } catch (e) {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
