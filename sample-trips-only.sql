-- Add sample trips for the existing test driver
-- Run this to add trips for testing

-- First, let's clear any existing trips for this driver to avoid duplicates
DELETE FROM trips WHERE driver_id = 'f6dc1e1a-9f6a-4961-895e-ef8b67850404';

-- Create some sample trips for testing
INSERT INTO trips (driver_id, vehicle_id, customer_name, customer_phone, pickup_location, dropoff_location, pickup_time, estimated_duration, trip_type, status) 
VALUES 
(
  'f6dc1e1a-9f6a-4961-895e-ef8b67850404',
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
),
(
  'f6dc1e1a-9f6a-4961-895e-ef8b67850404',
  (SELECT id FROM vehicles WHERE license_plate = 'TNT-03' LIMIT 1),
  'Corporate Client',
  '555-0300',
  'American Airlines Center',
  'The Joule Hotel',
  NOW() + INTERVAL '6 hours',
  45,
  'corporate',
  'scheduled'
);