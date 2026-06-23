-- Run this in your Supabase SQL Editor to create the product reviews table
CREATE TABLE product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) so anyone can read and write reviews
ALTER TABLE product_reviews DISABLE ROW LEVEL SECURITY;
