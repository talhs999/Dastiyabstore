-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  password text NOT NULL,
  address text,
  city text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for easy public operations
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
