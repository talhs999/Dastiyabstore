-- Run this in your Supabase SQL Editor

-- 1. Add badges column
ALTER TABLE products ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;

-- 2. Add trust_points column
ALTER TABLE products ADD COLUMN IF NOT EXISTS trust_points jsonb DEFAULT '[]'::jsonb;

-- 3. Migrate existing badge values to badges JSONB array
UPDATE products 
SET badges = jsonb_build_array(jsonb_build_object('text', badge, 'type', COALESCE(badge_type, 'yellow')))
WHERE badge IS NOT NULL AND (badges IS NULL OR jsonb_array_length(badges) = 0);

-- 4. Populate default trust points for products that don't have them
UPDATE products 
SET trust_points = '[
  {"icon": "truck", "text": "Free delivery on orders above Rs. 2000"},
  {"icon": "shield", "text": "100% authentic & quality guaranteed"},
  {"icon": "rotate-ccw", "text": "7-day easy returns & exchanges"},
  {"icon": "zap", "text": "Cash on Delivery available nationwide"}
]'::jsonb
WHERE trust_points IS NULL OR jsonb_array_length(trust_points) = 0;
