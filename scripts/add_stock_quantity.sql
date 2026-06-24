-- Run this in your Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 10;
