-- Run this in your Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price numeric NOT NULL,
  original_price numeric,
  image text NOT NULL,
  images text[] DEFAULT '{}',
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  badge text,
  badge_type text,
  is_new boolean DEFAULT false,
  in_stock boolean DEFAULT true,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  specs jsonb DEFAULT '[]'::jsonb,
  features text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Disable RLS for easy access (since it's a public store)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
