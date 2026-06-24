-- Run this in your Supabase SQL Editor to create the product qna table
CREATE TABLE product_qna (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  customer_name text NOT NULL,
  question text NOT NULL,
  answer text,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'answered', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  answered_at timestamp with time zone
);

-- Disable Row Level Security (RLS) so anyone can read and write QnA for now
ALTER TABLE product_qna DISABLE ROW LEVEL SECURITY;
