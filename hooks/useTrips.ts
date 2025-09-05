import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/database'
import type { Trip } from '@/lib/supabase'

export interface UseTripsReturn {
  todaysTrips: Trip[]
  upcomingTrips: Trip[]
  unassignedTrips: Trip[]
  isLoading: boolean
  error: string | null
  refreshTrips: () => Promise<void>
  updateTripStatus: (tripId: string, status: Trip['status']) => Promise<{ success: boolean; error?: string }>
  acceptTrip: (tripId: string) => Promise<{ success: boolean; error?: string }>
}

export function useTrips(driverId: string | null): UseTripsReturn {
  const [todaysTrips, setTodaysTrips] = useState<Trip[]>([])
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([])
  const [unassignedTrips, setUnassignedTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTrips = async () => {
    if (!driverId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch driver's today trips
      const todaysResult = await DatabaseService.getDriverTripsToday(driverId)
      if (todaysResult.success) {
        setTodaysTrips(todaysResult.data || [])
      }

      // Fetch upcoming trips
      const upcomingResult = await DatabaseService.getDriverUpcomingTrips(driverId)
      if (upcomingResult.success) {
        setUpcomingTrips(upcomingResult.data || [])
      }

      // Fetch unassigned trips (for notifications)
      const unassignedResult = await DatabaseService.getUnassignedTrips()
      if (unassignedResult.success) {
        setUnassignedTrips(unassignedResult.data || [])
      }

    } catch (err) {
      setError('Failed to load trips')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTripStatus = async (tripId: string, status: Trip['status']) => {
    try {
      const result = await DatabaseService.updateTripStatus(tripId, { status })
      
      if (result.success) {
        // Update local state
        const updateTrip = (trips: Trip[]) =>
          trips.map(trip => 
            trip.id === tripId ? { ...trip, status } : trip
          )
        
        setTodaysTrips(updateTrip)
        setUpcomingTrips(updateTrip)
        
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to update trip status' }
    }
  }

  const acceptTrip = async (tripId: string) => {
    if (!driverId) {
      return { success: false, error: 'Driver not authenticated' }
    }

    try {
      const result = await DatabaseService.assignTripToDriver(tripId, driverId)
      
      if (result.success) {
        // Remove from unassigned and add to today's trips
        setUnassignedTrips(prev => prev.filter(trip => trip.id !== tripId))
        
        if (result.data) {
          setTodaysTrips(prev => [...prev, result.data!].sort((a, b) => 
            new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()
          ))
        }
        
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Failed to accept trip' }
    }
  }

  // Initial load and setup real-time subscriptions
  useEffect(() => {
    refreshTrips()

    if (!driverId) return

    // Subscribe to driver's trip changes
    const driverTripsSubscription = DatabaseService.subscribeToDriverTrips(
      driverId,
      (payload) => {
        refreshTrips() // Refresh data when changes occur
      }
    )

    // Subscribe to unassigned trips for notifications
    const unassignedSubscription = DatabaseService.subscribeToUnassignedTrips(
      (payload) => {
        refreshTrips() // Refresh to get latest unassigned trips
      }
    )

    return () => {
      DatabaseService.unsubscribe(driverTripsSubscription)
      DatabaseService.unsubscribe(unassignedSubscription)
    }
  }, [driverId])

  return {
    todaysTrips,
    upcomingTrips,
    unassignedTrips,
    isLoading,
    error,
    refreshTrips,
    updateTripStatus,
    acceptTrip,
  }
}