-- TNT Driver Portal Database Setup
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security) globally
ALTER DATABASE postgres SET row_security = on;

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  license_number VARCHAR(50),
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  type VARCHAR(50) CHECK (type IN ('sedan', 'suv', 'van', 'limousine', 'party-bus')),
  capacity INTEGER NOT NULL,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  vin VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'out-of-service')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_duration INTEGER, -- in minutes
  trip_type VARCHAR(50) CHECK (trip_type IN ('airport', 'hourly', 'point-to-point', 'wedding', 'wine-tour', 'corporate')),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  special_instructions TEXT,
  fare_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver_shifts table
CREATE TABLE IF NOT EXISTS driver_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_employee_id ON drivers(employee_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_pickup_time ON trips(pickup_time);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_driver_shifts_driver_id ON driver_shifts(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_shifts_shift_date ON driver_shifts(shift_date);

-- Enable RLS on all tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drivers (drivers can only see their own data)
CREATE POLICY "Drivers can view own profile" ON drivers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Drivers can update own profile" ON drivers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for vehicles (all drivers can see all vehicles)
CREATE POLICY "Drivers can view all vehicles" ON vehicles
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for trips (drivers can only see their assigned trips)
CREATE POLICY "Drivers can view own trips" ON trips
  FOR SELECT USING (driver_id::text = auth.uid()::text);

CREATE POLICY "Drivers can update own trips" ON trips
  FOR UPDATE USING (driver_id::text = auth.uid()::text);

-- RLS Policies for driver_shifts (drivers can only see their own shifts)
CREATE POLICY "Drivers can view own shifts" ON driver_shifts
  FOR SELECT USING (driver_id::text = auth.uid()::text);

-- Insert TNT Fleet Vehicles
INSERT INTO vehicles (make, model, year, type, capacity, license_plate, vin, status) VALUES
('Lincoln', 'Town Car', 2020, 'sedan', 4, 'TNT-01', 'VIN0001TNT', 'available'),
('Cadillac', 'Escalade', 2021, 'suv', 6, 'TNT-02', 'VIN0002TNT', 'available'),
('Mercedes-Benz', 'Sprinter', 2022, 'van', 12, 'TNT-03', 'VIN0003TNT', 'available'),
('Lincoln', 'Navigator', 2020, 'suv', 7, 'TNT-04', 'VIN0004TNT', 'available'),
('Chrysler', '300C Stretch', 2021, 'limousine', 8, 'TNT-05', 'VIN0005TNT', 'available'),
('Lincoln', 'MKT', 2022, 'sedan', 4, 'TNT-06', 'VIN0006TNT', 'available'),
('Mercedes-Benz', 'Sprinter', 2021, 'van', 14, 'TNT-07', 'VIN0007TNT', 'available'),
('Lincoln', 'Continental Stretch', 2020, 'limousine', 10, 'TNT-08', 'VIN0008TNT', 'available'),
('Ford', 'Transit', 2022, 'van', 15, 'TNT-09', 'VIN0009TNT', 'available'),
('Custom', 'Party Bus', 2021, 'party-bus', 25, 'TNT-10', 'VIN0010TNT', 'available');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_shifts_updated_at BEFORE UPDATE ON driver_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;