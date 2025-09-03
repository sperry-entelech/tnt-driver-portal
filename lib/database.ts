import { supabase } from './supabase'
import type { Trip, Vehicle, DriverShift, Driver } from './supabase'

export interface TripUpdate {
  status?: Trip['status']
  special_instructions?: string
}

export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export class DatabaseService {
  // ===== TRIPS =====

  // Get driver's trips for today
  static async getDriverTripsToday(driverId: string): Promise<DatabaseResponse<Trip[]>> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            type,
            license_plate
          )
        `)
        .eq('driver_id', driverId)
        .gte('pickup_time', `${today}T00:00:00`)
        .lt('pickup_time', `${today}T23:59:59`)
        .order('pickup_time', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to fetch trips' }
    }
  }

  // Get driver's upcoming trips (next 7 days)
  static async getDriverUpcomingTrips(driverId: string): Promise<DatabaseResponse<Trip[]>> {
    try {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            type,
            license_plate
          )
        `)
        .eq('driver_id', driverId)
        .gte('pickup_time', today.toISOString())
        .lte('pickup_time', nextWeek.toISOString())
        .order('pickup_time', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to fetch upcoming trips' }
    }
  }

  // Update trip status
  static async updateTripStatus(tripId: string, updates: TripUpdate): Promise<DatabaseResponse<Trip>> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            type,
            license_plate
          )
        `)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to update trip' }
    }
  }

  // Get unassigned trips (for assignment notifications)
  static async getUnassignedTrips(): Promise<DatabaseResponse<Trip[]>> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            type,
            license_plate
          )
        `)
        .is('driver_id', null)
        .eq('status', 'scheduled')
        .gte('pickup_time', new Date().toISOString())
        .order('pickup_time', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to fetch unassigned trips' }
    }
  }

  // Assign trip to driver
  static async assignTripToDriver(tripId: string, driverId: string): Promise<DatabaseResponse<Trip>> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({ 
          driver_id: driverId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            type,
            license_plate
          )
        `)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to assign trip' }
    }
  }

  // ===== VEHICLES =====

  // Get all available vehicles
  static async getAvailableVehicles(): Promise<DatabaseResponse<Vehicle[]>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('make', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to fetch vehicles' }
    }
  }

  // Get vehicle by ID
  static async getVehicleById(vehicleId: string): Promise<DatabaseResponse<Vehicle>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to fetch vehicle' }
    }
  }

  // ===== DRIVER SHIFTS =====

  // Get driver's shifts for current week
  static async getDriverWeeklyShifts(driverId: string): Promise<DatabaseResponse<DriverShift[]>> {
    try {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

      const { data, error } = await supabase
        .from('driver_shifts')
        .select('*')
        .eq('driver_id', driverId)
        .gte('shift_date', startOfWeek.toISOString().split('T')[0])
        .lte('shift_date', endOfWeek.toISOString().split('T')[0])
        .order('shift_date', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to fetch shifts' }
    }
  }

  // Update shift status
  static async updateShiftStatus(
    shiftId: string, 
    status: DriverShift['status']
  ): Promise<DatabaseResponse<DriverShift>> {
    try {
      const { data, error } = await supabase
        .from('driver_shifts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', shiftId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to update shift status' }
    }
  }

  // ===== DRIVERS =====

  // Get all active drivers (for admin features)
  static async getActiveDrivers(): Promise<DatabaseResponse<Driver[]>> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to fetch drivers' }
    }
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====

  // Subscribe to trip changes for a specific driver
  static subscribeToDriverTrips(driverId: string, callback: (payload: any) => void) {
    return supabase
      .channel('driver-trips')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `driver_id=eq.${driverId}`,
        },
        callback
      )
      .subscribe()
  }

  // Subscribe to unassigned trips (for notifications)
  static subscribeToUnassignedTrips(callback: (payload: any) => void) {
    return supabase
      .channel('unassigned-trips')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: 'driver_id=is.null',
        },
        callback
      )
      .subscribe()
  }

  // Unsubscribe from real-time changes
  static unsubscribe(subscription: any) {
    supabase.removeChannel(subscription)
  }
}