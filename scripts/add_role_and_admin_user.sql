-- 1. Add role column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS role text DEFAULT 'CUSTOMER';

-- 2. Insert or update the default admin user
INSERT INTO customers (name, email, phone, password, address, city, role)
VALUES (
  'Dastiyab Store Admin',
  'admin@dastiyab.com',
  '0300-1234567',
  'dastiyab@123',
  'Admin Headquarters, Saddar',
  'Karachi',
  'ADMIN'
)
ON CONFLICT (email) 
DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  password = EXCLUDED.password,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  role = EXCLUDED.role;
