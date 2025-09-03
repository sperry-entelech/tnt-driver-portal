-- Create a test driver account
-- Run this AFTER you've run the main database-setup.sql

-- Insert a test driver (you'll need to create the auth user in Supabase dashboard first)
INSERT INTO drivers (id, name, email, phone, employee_id, license_number, hire_date, status) 
VALUES (
  'f6dc1e1a-9f6a-4961-895e-ef8b67850404',
  'Test Driver',
  'testdriver@tntlimo.com',
  '555-0123',
  'TNT001',
  'DL123456',
  '2024-01-01',
  'active'
);

-- Create some sample trips for testing
INSERT INTO trips (driver_id, vehicle_id, customer_name, customer_phone, pickup_location, dropoff_location, pickup_time, estimated_duration, trip_type, status) 
VALUES 
(
  'f6dc1e1a-9f6a-4961-895e-ef8b67850404', -- Same UUID as above
  (SELECT id FROM vehicles WHERE license_plate = 'TNT-01' LIMIT 1),
  'John Smith',
  '555-0100',
  'Dallas/Fort Worth International Airport',
  '123 Main St, Dallas, TX',
  NOW() + INTERVAL '2 hours',
  90,
  'airport',
  'confirmed'
),
(
  'f6dc1e1a-9f6a-4961-895e-ef8b67850404',
  (SELECT id FROM vehicles WHERE license_plate = 'TNT-05' LIMIT 1),
  'Wedding Party',
  '555-0200',
  'Four Seasons Hotel Dallas',
  'Nasher Sculpture Center',
  NOW() + INTERVAL '4 hours',
  240,
  'wedding',
  'scheduled'
);