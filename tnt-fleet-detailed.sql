-- TNT Fleet with Enhanced Details for Driver Portal
-- This version includes additional fields that drivers might find useful

-- Clear existing vehicles first
TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE;

-- Insert TNT fleet with detailed information
INSERT INTO vehicles (
    make, model, year, type, capacity, license_plate, vin, status, 
    created_at, updated_at
) VALUES

-- SEDANS (Units 04 & 05)
('Lincoln', 'Town Car Unit 04', 2020, 'sedan', 3, 'TNT-04', 'SEDAN04VIN123456', 'available', NOW(), NOW()),
('Lincoln', 'Town Car Unit 05', 2020, 'sedan', 3, 'TNT-05', 'SEDAN05VIN123457', 'available', NOW(), NOW()),

-- TRANSIT VANS (12-15 passenger)
('Ford', 'Transit Van 12-Pass', 2022, 'van', 12, 'TNT-TRANSIT-12', 'TRANSIT12VIN123458', 'available', NOW(), NOW()),
('Ford', 'Transit Van 15-Pass', 2022, 'van', 15, 'TNT-TRANSIT-15', 'TRANSIT15VIN123459', 'available', NOW(), NOW()),

-- EXECUTIVE MINI BUS (Unit 09)
('Mercedes', 'Executive Mini Bus', 2021, 'van', 12, 'TNT-09', 'EXECUTIVE09VIN123460', 'available', NOW(), NOW()),

-- MINI BUS WITH SOFA (Unit 01)
('Ford', 'Mini Bus Sofa', 2019, 'van', 10, 'TNT-01', 'MINIBUS01VIN123461', 'available', NOW(), NOW()),

-- STRETCH LIMO (Unit 03)
('Lincoln', 'Stretch Limousine', 2018, 'limousine', 8, 'TNT-03', 'STRETCH03VIN123462', 'available', NOW(), NOW()),

-- SPRINTER LIMO (Unit 02)
('Mercedes', 'Sprinter Limo', 2020, 'limousine', 10, 'TNT-02', 'SPRINTER02VIN123463', 'available', NOW(), NOW()),

-- LIMO BUS (Unit 10)
('Freightliner', 'Limo Bus', 2017, 'party-bus', 18, 'TNT-10', 'LIMOBUS10VIN123464', 'available', NOW(), NOW());

-- Add some useful metadata as comments for future reference
COMMENT ON TABLE vehicles IS 'TNT Limousine Fleet - Updated with actual vehicle data and unit numbers';

-- View the updated fleet
SELECT 
    license_plate as "Unit Number",
    make || ' ' || model as "Vehicle Description",
    type as "Category",
    capacity || ' passengers' as "Capacity",
    year as "Year",
    status as "Current Status"
FROM vehicles 
ORDER BY 
    CASE type 
        WHEN 'sedan' THEN 1
        WHEN 'van' THEN 2 
        WHEN 'limousine' THEN 3
        WHEN 'party-bus' THEN 4
    END,
    license_plate;