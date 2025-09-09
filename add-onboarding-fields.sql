-- Add onboarding tracking fields to drivers table
-- Run this in Supabase SQL Editor

-- Add onboarding completion tracking
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferred_communication VARCHAR(20) DEFAULT 'sms' CHECK (preferred_communication IN ('sms', 'email', 'phone'));

-- Update existing drivers to have onboarding_completed = true 
-- (since they're already active drivers)
UPDATE drivers 
SET onboarding_completed = true, 
    onboarding_completed_at = created_at 
WHERE onboarding_completed IS FALSE OR onboarding_completed IS NULL;

-- Add index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_drivers_onboarding ON drivers(onboarding_completed);

-- Add trigger to update updated_at when onboarding fields change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Make sure trigger exists on drivers table
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();