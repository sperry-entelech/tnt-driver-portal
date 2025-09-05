/**
 * TNT Pricing Tool Sync Service
 * Connects driver portal with pricing tools for real-time availability
 */

import { supabase } from './supabase'
import { DatabaseService } from './database'
import type { Trip, Vehicle } from './supabase'

export interface PricingAvailability {
  available: boolean
  assignedVehicleId?: string
  vehicleClass: string
  driverAvailable?: boolean
  conflictingTrips: Trip[]
}

export interface VehicleAvailabilityCheck {
  vehicleId: string
  isAvailable: boolean
  currentTrip?: Trip
  nextAvailableTime?: string
  maintenanceStatus: 'available' | 'maintenance' | 'in-service' | 'out-of-service'
}

export class PricingSyncService {
  
  /**
   * Check real-time vehicle availability for pricing tools
   * This is called by your HTML pricing tools via API
   */
  static async checkVehicleAvailability(
    requestedDateTime: string,
    passengerCount: number,
    serviceType: 'airport' | 'hourly' | 'point-to-point' | 'corporate'
  ): Promise<PricingAvailability> {
    
    try {
      // Determine required vehicle class based on passenger count
      const vehicleClass = this.determineVehicleClass(passengerCount, serviceType)
      
      // Get vehicles of the required class
      const availableVehicles = await this.getAvailableVehiclesByClass(vehicleClass, requestedDateTime)
      
      // Check for driver availability
      const availableDrivers = await this.getAvailableDrivers(requestedDateTime)
      
      // Find conflicting trips
      const conflicts = await this.getConflictingTrips(requestedDateTime, vehicleClass)
      
      return {
        available: availableVehicles.length > 0 && availableDrivers.length > 0,
        assignedVehicleId: availableVehicles[0]?.id,
        vehicleClass,
        driverAvailable: availableDrivers.length > 0,
        conflictingTrips: conflicts
      }
      
    } catch (error) {
      return {
        available: false,
        vehicleClass: 'sedan',
        conflictingTrips: []
      }
    }
  }
  
  /**
   * Get real-time status of all vehicles for pricing tool
   */
  static async getFleetStatus(): Promise<VehicleAvailabilityCheck[]> {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          trips!trips_vehicle_id_fkey (
            id,
            status,
            pickup_time,
            customer_name,
            pickup_location,
            dropoff_location
          )
        `)
        .eq('status', 'available')
      
      if (error) throw error
      
      return vehicles.map(vehicle => ({
        vehicleId: vehicle.id,
        isAvailable: this.isVehicleCurrentlyAvailable(vehicle),
        currentTrip: this.getCurrentTrip(vehicle.trips),
        nextAvailableTime: this.calculateNextAvailableTime(vehicle.trips),
        maintenanceStatus: vehicle.status
      }))
      
    } catch (error) {
      return []
    }
  }
  
  /**
   * Sync booking from pricing tool to driver portal
   * Called when pricing tool creates a booking
   */
  static async syncBookingToDriverPortal(bookingData: {
    customerId?: string
    corporateAccountId?: string
    serviceType: string
    vehicleClass: string
    pickupDateTime: string
    pickupLocation: any
    dropoffLocation?: any
    passengerCount: number
    totalAmount: number
    platform: 'standard' | 'gnet' | 'groundspan' | 'corporate'
    specialInstructions?: string
  }): Promise<{ success: boolean; tripId?: string; error?: string }> {
    
    try {
      // Find available vehicle and driver
      const availability = await this.checkVehicleAvailability(
        bookingData.pickupDateTime,
        bookingData.passengerCount,
        bookingData.serviceType as any
      )
      
      if (!availability.available) {
        return { success: false, error: 'No vehicles or drivers available' }
      }
      
      // Create trip in driver portal database
      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          vehicle_id: availability.assignedVehicleId,
          customer_name: bookingData.platform === 'gnet' ? 'GNET Customer' : 
                        bookingData.platform === 'groundspan' ? 'Capital One Associate' :
                        'Customer',
          pickup_location: typeof bookingData.pickupLocation === 'string' 
            ? bookingData.pickupLocation 
            : JSON.stringify(bookingData.pickupLocation),
          dropoff_location: bookingData.dropoffLocation 
            ? (typeof bookingData.dropoffLocation === 'string' 
                ? bookingData.dropoffLocation 
                : JSON.stringify(bookingData.dropoffLocation))
            : null,
          pickup_time: bookingData.pickupDateTime,
          trip_type: bookingData.serviceType,
          status: 'scheduled',
          fare_amount: bookingData.totalAmount,
          special_instructions: this.buildSpecialInstructions(bookingData),
          // Metadata for tracking platform
          platform_source: bookingData.platform,
          corporate_account_id: bookingData.corporateAccountId
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Trigger notifications to drivers
      await this.notifyAvailableDrivers(trip.id, availability.assignedVehicleId)
      
      return { success: true, tripId: trip.id }
      
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  /**
   * FastTrack integration - update trip from external dispatch system
   */
  static async updateFromFastTrack(tripId: string, fastTrackData: {
    driverId?: string
    status?: string
    actualPickupTime?: string
    actualDropoffTime?: string
    mileage?: number
    duration?: number
  }) {
    try {
      const updates: any = {}
      
      if (fastTrackData.driverId) {
        updates.driver_id = fastTrackData.driverId
        updates.status = 'confirmed'
      }
      
      if (fastTrackData.status) {
        updates.status = fastTrackData.status
      }
      
      if (fastTrackData.actualPickupTime) {
        updates.actual_pickup_time = fastTrackData.actualPickupTime
      }
      
      if (fastTrackData.actualDropoffTime) {
        updates.actual_dropoff_time = fastTrackData.actualDropoffTime
        updates.status = 'completed'
      }
      
      if (fastTrackData.mileage) {
        updates.actual_mileage = fastTrackData.mileage
      }
      
      if (fastTrackData.duration) {
        updates.actual_duration = fastTrackData.duration
      }
      
      const { error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
      
      if (error) throw error
      
      return { success: true }
      
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // Helper methods
  
  private static determineVehicleClass(
    passengerCount: number, 
    serviceType: string
  ): string {
    if (passengerCount <= 4) return 'sedan'
    if (passengerCount <= 6) return 'suv' 
    if (passengerCount <= 10) return serviceType === 'wedding' ? 'limousine' : 'van'
    if (passengerCount <= 14) return 'van'
    return 'party-bus'
  }
  
  private static async getAvailableVehiclesByClass(
    vehicleClass: string, 
    requestedDateTime: string
  ): Promise<any[]> {
    
    const startTime = new Date(requestedDateTime)
    const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000) // 4-hour window
    
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('type', vehicleClass)
      .eq('status', 'available')
      .not('id', 'in', 
        supabase
          .from('trips')
          .select('vehicle_id')
          .in('status', ['scheduled', 'confirmed', 'in-progress'])
          .gte('pickup_time', startTime.toISOString())
          .lte('pickup_time', endTime.toISOString())
      )
    
    if (error) throw error
    return vehicles || []
  }
  
  private static async getAvailableDrivers(requestedDateTime: string): Promise<any[]> {
    const startTime = new Date(requestedDateTime)
    const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000)
    
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'active')
      .not('id', 'in',
        supabase
          .from('trips')
          .select('driver_id')
          .not('driver_id', 'is', null)
          .in('status', ['scheduled', 'confirmed', 'in-progress'])
          .gte('pickup_time', startTime.toISOString())
          .lte('pickup_time', endTime.toISOString())
      )
    
    if (error) throw error
    return drivers || []
  }
  
  private static async getConflictingTrips(
    requestedDateTime: string, 
    vehicleClass: string
  ): Promise<Trip[]> {
    
    const startTime = new Date(requestedDateTime)
    const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000)
    
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        vehicles (type)
      `)
      .in('status', ['scheduled', 'confirmed', 'in-progress'])
      .gte('pickup_time', startTime.toISOString())
      .lte('pickup_time', endTime.toISOString())
    
    if (error) throw error
    
    return (trips || []).filter(trip => 
      trip.vehicles?.type === vehicleClass
    ) as Trip[]
  }
  
  private static isVehicleCurrentlyAvailable(vehicle: any): boolean {
    const now = new Date()
    const currentTrips = vehicle.trips?.filter((trip: any) => {
      const pickupTime = new Date(trip.pickup_time)
      const endTime = new Date(pickupTime.getTime() + 4 * 60 * 60 * 1000) // Estimate 4 hours
      return pickupTime <= now && now <= endTime && ['confirmed', 'in-progress'].includes(trip.status)
    })
    
    return !currentTrips || currentTrips.length === 0
  }
  
  private static getCurrentTrip(trips: any[]): Trip | undefined {
    if (!trips) return undefined
    
    const now = new Date()
    return trips.find(trip => {
      const pickupTime = new Date(trip.pickup_time)
      const endTime = new Date(pickupTime.getTime() + 4 * 60 * 60 * 1000)
      return pickupTime <= now && now <= endTime && ['confirmed', 'in-progress'].includes(trip.status)
    })
  }
  
  private static calculateNextAvailableTime(trips: any[]): string | undefined {
    if (!trips || trips.length === 0) return undefined
    
    const now = new Date()
    const upcomingTrips = trips
      .filter(trip => new Date(trip.pickup_time) > now && ['scheduled', 'confirmed'].includes(trip.status))
      .sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime())
    
    if (upcomingTrips.length === 0) return undefined
    
    const lastTrip = upcomingTrips[upcomingTrips.length - 1]
    const lastTripEnd = new Date(new Date(lastTrip.pickup_time).getTime() + 4 * 60 * 60 * 1000)
    
    return lastTripEnd.toISOString()
  }
  
  private static buildSpecialInstructions(bookingData: any): string {
    let instructions = []
    
    // Platform-specific instructions
    switch (bookingData.platform) {
      case 'gnet':
        instructions.push('GNET Partner Booking - 12% commission tracking')
        break
      case 'groundspan':
        instructions.push('Capital One Corporate - Premium service standards')
        break
      case 'corporate':
        instructions.push('Corporate client - Volume discount applied')
        break
    }
    
    // Add custom instructions
    if (bookingData.specialInstructions) {
      instructions.push(bookingData.specialInstructions)
    }
    
    return instructions.join(' | ')
  }
  
  private static async notifyAvailableDrivers(tripId: string, assignedVehicleId?: string) {
    try {
      // Get drivers who can handle this vehicle type
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('type')
        .eq('id', assignedVehicleId)
        .single()
      
      // In a production environment, you would:
      // 1. Send push notifications to available drivers
      // 2. Trigger SMS/email notifications
      // 3. Update the driver app with new trip assignments
      // 4. Log the notification in an audit trail
      
      
    } catch (error) {
    }
  }
}