import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// Database types
export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  employee_id: string
  license_number: string
  hire_date: string
  status: 'active' | 'inactive' | 'suspended'
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  type: 'sedan' | 'suv' | 'van' | 'limousine' | 'party-bus'
  capacity: number
  license_plate: string
  vin: string
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service'
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  driver_id: string
  vehicle_id: string
  customer_name: string
  customer_phone: string
  pickup_location: string
  dropoff_location: string
  pickup_time: string
  estimated_duration: number
  trip_type: 'airport' | 'hourly' | 'point-to-point' | 'wedding' | 'wine-tour' | 'corporate'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  special_instructions?: string
  fare_amount?: number
  created_at: string
  updated_at: string
}

export interface DriverShift {
  id: string
  driver_id: string
  shift_date: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'active' | 'completed' | 'absent'
  created_at: string
  updated_at: string
}

export default supabase