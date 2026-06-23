-- Run this in your Supabase SQL Editor
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS reply_text text;
