-- TNT Limousine Driver Portal Database Schema (Simplified)
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drivers table
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    employee_id VARCHAR(10) UNIQUE NOT NULL,
    license_number VARCHAR(50),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sedan', 'suv', 'van', 'limousine', 'party-bus')),
    capacity INTEGER NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'out-of-service')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER, -- in minutes
    trip_type VARCHAR(20) NOT NULL CHECK (trip_type IN ('airport', 'hourly', 'point-to-point', 'wedding', 'wine-tour', 'corporate')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled')),
    special_instructions TEXT,
    fare_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver shifts table
CREATE TABLE driver_shifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample TNT vehicles
INSERT INTO vehicles (make, model, year, type, capacity, license_plate, vin, status) VALUES
('Lincoln', 'Navigator', 2023, 'suv', 6, 'TNT001', '1LNBL9XXXXX123456', 'available'),
('Cadillac', 'Escalade', 2022, 'suv', 6, 'TNT002', '1GYS4JKL3NR123457', 'available'),
('Mercedes', 'S-Class', 2023, 'sedan', 4, 'TNT003', 'WDDUX8GB8NA123458', 'available'),
('Ford', 'Transit', 2022, 'van', 14, 'TNT004', '1FTBW2CM9MKA12345', 'available'),
('Lincoln', 'Town Car Stretch', 2021, 'limousine', 10, 'TNT005', '1LNHM83W12Y123459', 'available');

-- Insert sample driver (replace with actual TNT drivers)
INSERT INTO drivers (name, email, phone, employee_id, license_number, hire_date, status) VALUES
('John Martinez', 'john@tntlimousine.com', '(804) 555-0101', 'TNT001', 'VA123456789', '2023-01-15', 'active'),
('Sarah Johnson', 'sarah@tntlimousine.com', '(804) 555-0102', 'TNT002', 'VA987654321', '2023-03-20', 'active'),
('Mike Wilson', 'mike@tntlimousine.com', '(804) 555-0103', 'TNT003', 'VA456789123', '2023-06-10', 'active');