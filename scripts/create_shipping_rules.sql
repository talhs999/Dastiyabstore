-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS shipping_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  base_fee numeric DEFAULT 200 NOT NULL,
  per_km_fee numeric DEFAULT 0 NOT NULL,
  free_delivery_threshold numeric DEFAULT 2000 NOT NULL,
  free_delivery_km numeric,
  free_areas text,
  estimated_days text DEFAULT '2-3 Business Days' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS
ALTER TABLE shipping_rules DISABLE ROW LEVEL SECURITY;

-- Insert default rules
INSERT INTO shipping_rules (name, city, base_fee, per_km_fee, free_delivery_threshold, free_delivery_km, free_areas, estimated_days, is_active)
VALUES 
('Karachi Local', 'Karachi', 150, 15, 2000, 15, 'Clifton, DHA, Gulshan-e-Iqbal, PECHS, Bahadurabad', '1-2 Business Days', true),
('Rest of Pakistan (Default)', 'Default', 250, 0, 3000, NULL, NULL, '3-5 Business Days', true)
ON CONFLICT DO NOTHING;
