-- SQL commands to run in Supabase SQL Editor to fix the test user
-- This updates the driver record to use a working auth user ID

-- First, create the auth user manually in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: testdriver@tntlimo.com
-- 4. Password: testpassword123
-- 5. Confirm email: Yes
-- 6. Copy the generated User ID

-- Then run this SQL (replace 'YOUR_AUTH_USER_ID' with the actual ID from step 6):
-- UPDATE drivers 
-- SET id = 'YOUR_AUTH_USER_ID'
-- WHERE email = 'testdriver@tntlimo.com';

-- Alternative: Use this query to see what auth users exist:
-- SELECT id, email, confirmed_at, created_at from auth.users ORDER BY created_at DESC LIMIT 5;

-- Alternative: If you have an existing confirmed user, you can create a new driver record:
-- INSERT INTO drivers (id, name, email, phone, employee_id, license_number, hire_date, status) 
-- VALUES (
--   'EXISTING_AUTH_USER_ID',  -- Replace with existing auth user ID
--   'Test Driver',
--   'EMAIL_OF_EXISTING_USER',  -- Replace with existing user's email
--   '555-0123',
--   'TEST001',
--   'DL123456',
--   '2024-01-01',
--   'active'
-- );

-- Check current state:
SELECT 'Driver Record:' as info, id, email, name from drivers where email = 'testdriver@tntlimo.com'
UNION ALL
SELECT 'Auth Users:' as info, id, email, email_confirmed_at::text from auth.users where email = 'testdriver@tntlimo.com';