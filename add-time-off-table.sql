-- Add time off requests table
-- Run this in Supabase SQL Editor

-- Create time_off_requests table
CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    approved_by UUID REFERENCES drivers(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure end date is not before start date
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_off_driver_id ON time_off_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_off_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON time_off_requests(start_date, end_date);

-- Enable RLS
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Drivers can view their own time off requests" ON time_off_requests
    FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create their own time off requests" ON time_off_requests
    FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own pending requests" ON time_off_requests
    FOR UPDATE USING (auth.uid() = driver_id AND status = 'pending');

-- Add trigger for updated_at
CREATE TRIGGER update_time_off_requests_updated_at 
    BEFORE UPDATE ON time_off_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample time off requests for existing drivers (optional)
-- INSERT INTO time_off_requests (driver_id, start_date, end_date, reason, status)
-- SELECT 
--     id,
--     CURRENT_DATE + INTERVAL '7 days',
--     CURRENT_DATE + INTERVAL '9 days',
--     'Vacation',
--     'approved'
-- FROM drivers 
-- WHERE email IN ('aric@tntlimousine.com', 'brett@tntlimousine.com')
-- LIMIT 2;