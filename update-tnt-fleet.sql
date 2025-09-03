-- Update TNT Fleet Vehicles with Real Data
-- Run this in your Supabase SQL editor to replace sample vehicles

-- First, clear existing sample vehicles
DELETE FROM vehicles WHERE license_plate LIKE 'TNT%';

-- Insert actual TNT fleet vehicles
INSERT INTO vehicles (make, model, year, type, capacity, license_plate, vin, status, created_at, updated_at) VALUES

-- Sedan Units 04/05 (combining as two separate vehicles)
('Lincoln', 'Town Car', 2020, 'sedan', 3, 'TNT-04', 'VIN_SEDAN_04', 'available', NOW(), NOW()),
('Lincoln', 'Town Car', 2020, 'sedan', 3, 'TNT-05', 'VIN_SEDAN_05', 'available', NOW(), NOW()),

-- Transit Vans (12/15 passenger capacity - using 15 as max)
('Ford', 'Transit Van', 2022, 'van', 15, 'TNT-TRANSIT-A', 'VIN_TRANSIT_A', 'available', NOW(), NOW()),
('Ford', 'Transit Van', 2022, 'van', 12, 'TNT-TRANSIT-B', 'VIN_TRANSIT_B', 'available', NOW(), NOW()),

-- Executive Mini Bus Unit 09
('Mercedes', 'Sprinter Executive', 2021, 'van', 12, 'TNT-09', 'VIN_EXECUTIVE_09', 'available', NOW(), NOW()),

-- Mini Bus Unit 01 (Sofa)
('Ford', 'Mini Bus Sofa', 2019, 'van', 10, 'TNT-01', 'VIN_MINIBUS_01', 'available', NOW(), NOW()),

-- Stretch Limo Unit 03
('Lincoln', 'Stretch Limousine', 2018, 'limousine', 8, 'TNT-03', 'VIN_STRETCH_03', 'available', NOW(), NOW()),

-- Sprinter Limo Unit 02
('Mercedes', 'Sprinter Limo', 2020, 'limousine', 10, 'TNT-02', 'VIN_SPRINTER_02', 'available', NOW(), NOW()),

-- Limo Bus Unit 10
('Freightliner', 'Party Bus', 2017, 'party-bus', 18, 'TNT-10', 'VIN_LIMOBUS_10', 'available', NOW(), NOW());

-- Verify the update
SELECT 
    license_plate as "Unit",
    make || ' ' || model as "Vehicle",
    type as "Type",
    capacity as "Capacity",
    status as "Status"
FROM vehicles 
ORDER BY license_plate;