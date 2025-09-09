-- Add driver breaks tracking table
-- Run this in Supabase SQL Editor

-- Create driver_breaks table for break tracking
CREATE TABLE IF NOT EXISTS driver_breaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    break_type VARCHAR(20) NOT NULL CHECK (break_type IN ('lunch', 'fuel', 'rest', 'personal', 'other')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- calculated when ended, in minutes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add availability status to drivers table
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS available_status VARCHAR(20) DEFAULT 'available' 
CHECK (available_status IN ('available', 'unavailable', 'on-break', 'off-duty'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_breaks_driver_id ON driver_breaks(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_breaks_start_time ON driver_breaks(start_time);
CREATE INDEX IF NOT EXISTS idx_drivers_available_status ON drivers(available_status);

-- Enable RLS
ALTER TABLE driver_breaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver_breaks
CREATE POLICY "Drivers can view their own breaks" ON driver_breaks
    FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own breaks" ON driver_breaks
    FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own breaks" ON driver_breaks
    FOR UPDATE USING (auth.uid() = driver_id);

-- Add trigger for updated_at
CREATE TRIGGER update_driver_breaks_updated_at 
    BEFORE UPDATE ON driver_breaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate actual break duration
CREATE OR REPLACE FUNCTION calculate_break_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate actual duration when break is ended
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        NEW.actual_duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically calculate break duration
CREATE TRIGGER calculate_break_duration_trigger
    BEFORE UPDATE ON driver_breaks
    FOR EACH ROW EXECUTE FUNCTION calculate_break_duration();

-- Sample data for testing (optional)
-- INSERT INTO driver_breaks (driver_id, break_type, start_time, estimated_duration)
-- SELECT 
--     id,
--     'lunch',
--     NOW() - INTERVAL '2 hours',
--     30
-- FROM drivers 
-- WHERE email = 'testdriver@tntlimo.com'
-- LIMIT 1;