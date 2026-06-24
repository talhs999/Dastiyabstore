-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS delivery_areas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  distance numeric NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS
ALTER TABLE delivery_areas DISABLE ROW LEVEL SECURITY;

-- Insert default rules
INSERT INTO delivery_areas (name, distance, is_active)
VALUES 
  ('Model Colony / Malir Cantt', 0, true),
  ('Malir Halt / Malir City', 3, true),
  ('Scheme 33 / Safari Park', 5, true),
  ('Korangi', 7, true),
  ('Landhi', 9, true),
  ('Gulistan-e-Jauhar', 7, true),
  ('Gulshan-e-Iqbal', 10, true),
  ('Bahadurabad / PECHS', 12, true),
  ('Saddar / City Area', 15, true),
  ('Federal B Area / Nazimabad', 15, true),
  ('North Nazimabad', 18, true),
  ('Clifton', 18, true),
  ('DHA (Phase 1-6)', 20, true),
  ('DHA (Phase 7-8)', 25, true),
  ('North Karachi / Surjani Town', 25, true),
  ('Orangi / Baldia Town', 22, true),
  ('Karsaz / Shahrah-e-Faisal', 10, true),
  ('SMCHS / Shaheed-e-Millat', 13, true),
  ('Bin Qasim / Steel Town', 12, true),
  ('Bahria Town Karachi', 30, true),
  ('Other Area', 15, true)
ON CONFLICT DO NOTHING;
