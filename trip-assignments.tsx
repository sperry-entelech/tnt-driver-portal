"use client"

import { useState, useEffect } from "react"
import { MapPin, Car, Phone, User, Loader2 } from "lucide-react"
import supabase from "@/lib/supabase"

interface Trip {
  id: string
  status: string
  assigned_at: string
  driver_id: string
  vehicle_id: string
  booking_id: string
  bookings: {
    pickup_datetime: string
    customer_name: string
    pickup_address: string
  }
  vehicles: {
    unit_number: string
    vehicle_type: string
  }
}

const statusOptions = [
  { value: "pending", label: "Accept", color: "bg-green-600 hover:bg-green-700", icon: "✓" },
  { value: "accepted", label: "En Route", color: "bg-blue-600 hover:bg-blue-700", icon: "🚗" },
  { value: "en_route", label: "Arrived", color: "bg-yellow-600 hover:bg-yellow-700", icon: "📍" },
  { value: "arrived", label: "Picked Up", color: "bg-purple-600 hover:bg-purple-700", icon: "👥" },
  { value: "picked_up", label: "Complete", color: "bg-gray-600 hover:bg-gray-700", icon: "✅" },
]

export default function TripAssignments() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingTrip, setUpdatingTrip] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({
    connectionStatus: "Not tested",
    rawData: null,
    transformedData: null,
    queryError: null,
    supabaseUrl: "",
    timestamp: null,
    sqlQuery: "",
    recordCount: 0,
    queryExecutedAt: null,
  })
  const [showDebug, setShowDebug] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🚗 Starting trips fetch...")
      console.log("📡 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("🔑 Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      const timestamp = new Date().toISOString()
      const exactQuery = `
SELECT 
  trips.id,
  trips.status,
  trips.assigned_at,
  bookings.customer_name,
  bookings.pickup_address,
  bookings.pickup_datetime,
  vehicles.unit_number,
  vehicles.vehicle_type
FROM trips
LEFT JOIN bookings ON trips.booking_id = bookings.id  
LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
ORDER BY trips.assigned_at ASC;`

      console.log("🔍 Equivalent SQL Query:", exactQuery)

      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: "Connecting...",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
        timestamp: timestamp,
        sqlQuery: exactQuery,
      }))

      console.log("🔍 Executing Supabase trips query...")

      const { data, error: supabaseError } = await supabase
        .from("trips")
        .select(`
          id,
          status,
          assigned_at,
          bookings (
            customer_name,
            pickup_address,
            pickup_datetime
          ),
          vehicles (
            unit_number,
            vehicle_type
          )
        `)
        .order("assigned_at", { ascending: true })

      console.log("📊 Raw Supabase trips response:", { data, error: supabaseError })
      console.log("🔢 Total records returned:", data?.length || 0)

      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: supabaseError ? "Error" : "Connected",
        rawData: data,
        queryError: supabaseError,
        recordCount: data?.length || 0,
        queryExecutedAt: new Date().toISOString(),
      }))

      if (supabaseError) {
        console.error("❌ Supabase trips error:", supabaseError)
        throw supabaseError
      }

      const transformedData =
        data?.map((trip) => ({
          id: trip.id,
          status: trip.status,
          assigned_at: trip.assigned_at,
          bookings: {
            pickup_datetime: trip.bookings?.pickup_datetime || trip.assigned_at,
            customer_name: trip.bookings?.customer_name || "N/A",
            pickup_address: trip.bookings?.pickup_address || "N/A",
          },
          vehicles: {
            unit_number: trip.vehicles?.unit_number || "N/A",
            vehicle_type: trip.vehicles?.vehicle_type || "N/A",
          },
        })) || []

      console.log("🔄 Transformed trips data:", transformedData)
      console.log("✅ Found active trips:", transformedData.length)

      setDebugInfo((prev) => ({
        ...prev,
        transformedData: transformedData,
        connectionStatus: "Success",
      }))

      setTrips(transformedData)
    } catch (err) {
      console.error("❌ Error fetching trips:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch trips")

      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: "Failed",
        queryError: err,
      }))
    } finally {
      setLoading(false)
    }
  }

  const updateTripStatus = async (tripId: string, newStatus: string) => {
    try {
      setUpdatingTrip(tripId)
      console.log(`🔄 Updating trip ${tripId} to status: ${newStatus}`)

      const { error: updateError } = await supabase.from("trips").update({ status: newStatus }).eq("id", tripId)

      if (updateError) {
        console.error("❌ Error updating trip status:", updateError)
        throw updateError
      }

      console.log("✅ Trip status updated successfully")

      await fetchTrips()
    } catch (err) {
      console.error("❌ Error updating trip status:", err)
      setError(err instanceof Error ? err.message : "Failed to update trip status")
    } finally {
      setUpdatingTrip(null)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusOptions.findIndex((option) => option.value === currentStatus)
    return currentIndex < statusOptions.length - 1 ? statusOptions[currentIndex + 1] : null
  }

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: { label: "PENDING", color: "bg-yellow-600 border-yellow-400" },
      accepted: { label: "ACCEPTED", color: "bg-green-600 border-green-400" },
      en_route: { label: "EN ROUTE", color: "bg-blue-600 border-blue-400" },
      arrived: { label: "ARRIVED", color: "bg-purple-600 border-purple-400" },
      picked_up: { label: "PICKED UP", color: "bg-orange-600 border-orange-400" },
      completed: { label: "COMPLETED", color: "bg-gray-600 border-gray-400" },
    }
    return statusMap[status] || { label: status.toUpperCase(), color: "bg-gray-600 border-gray-400" }
  }

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return timeString
    }
  }

  const handleRefresh = () => {
    console.log("🔄 Manual trips refresh triggered")
    fetchTrips()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="text-white text-xl font-medium">Loading active trips...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        {showDebug && (
          <div className="bg-yellow-900 border border-yellow-600 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-yellow-200 text-xl font-bold">🔍 Trip Debug Information</h2>
              <button onClick={() => setShowDebug(false)} className="text-yellow-400 hover:text-yellow-200 text-sm">
                Hide Debug
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-yellow-200 font-semibold mb-2">📝 Equivalent SQL Query</h3>
              <div className="bg-gray-800 p-3 rounded max-h-32 overflow-y-auto">
                <pre className="text-blue-400 text-xs font-mono whitespace-pre-wrap">{debugInfo.sqlQuery}</pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-yellow-200 font-semibold mb-2">Connection Status</h3>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-white">
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        debugInfo.connectionStatus === "Success"
                          ? "text-green-400"
                          : debugInfo.connectionStatus === "Failed"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {debugInfo.connectionStatus}
                    </span>
                  </div>
                  <div className="text-gray-300">URL: {debugInfo.supabaseUrl}</div>
                  <div className="text-gray-300">Query Time: {debugInfo.queryExecutedAt}</div>
                  <div className="text-green-400 font-bold">Records Found: {debugInfo.recordCount}</div>
                </div>
              </div>

              <div>
                <h3 className="text-yellow-200 font-semibold mb-2">Query Results</h3>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-white">Raw Records: {debugInfo.rawData?.length || 0}</div>
                  <div className="text-white">Transformed: {debugInfo.transformedData?.length || 0}</div>
                  <div className="text-white">Current Display: {trips.length}</div>
                </div>
              </div>
            </div>

            {debugInfo.queryError && (
              <div className="mt-4">
                <h3 className="text-red-400 font-semibold mb-2">❌ Query Error</h3>
                <div className="bg-red-900 border border-red-600 p-3 rounded text-red-200 text-xs font-mono">
                  {JSON.stringify(debugInfo.queryError, null, 2)}
                </div>
              </div>
            )}

            {debugInfo.rawData && (
              <div className="mt-4">
                <h3 className="text-yellow-200 font-semibold mb-2">📊 Raw Database Response</h3>
                <div className="bg-gray-800 p-3 rounded max-h-40 overflow-y-auto">
                  <pre className="text-green-400 text-xs font-mono">{JSON.stringify(debugInfo.rawData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {!showDebug && (
          <button
            onClick={() => setShowDebug(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 px-4 rounded-lg text-sm mb-6"
          >
            Show Debug Info
          </button>
        )}

        <div className="bg-gray-900 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">Active Trip Assignments</h1>
              <p className="text-gray-300 text-lg">
                {trips.length} active trip{trips.length !== 1 ? "s" : ""} requiring attention
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-lg text-lg min-h-[64px] transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center">
              <div className="text-red-400 text-xl font-medium mb-4">❌ Error Loading Trips</div>
              <p className="text-red-200 text-lg mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-8 rounded-lg text-lg min-h-[64px] transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!error && trips.length === 0 ? (
          <div className="bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-gray-400 text-xl font-medium mb-4">No Active Trips</div>
              <p className="text-gray-500 text-lg">No trips are currently pending or in progress.</p>
            </div>
          </div>
        ) : (
          !error && (
            <div className="space-y-6">
              {trips.map((trip) => {
                const statusDisplay = getStatusDisplay(trip.status)
                const nextStatus = getNextStatus(trip.status)
                const isUpdating = updatingTrip === trip.id

                return (
                  <div
                    key={trip.id}
                    className="bg-gray-900 rounded-2xl shadow-lg p-8 border-l-6 border-red-500 hover:shadow-xl transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-2">
                          {formatTime(trip.bookings.pickup_datetime)}
                        </h3>
                        <p className="text-white text-xl">{trip.bookings.customer_name}</p>
                      </div>
                      <span
                        className={`px-6 py-3 rounded-xl text-lg font-bold border-2 text-white ${statusDisplay.color}`}
                      >
                        {statusDisplay.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <MapPin className="w-8 h-8 mr-4 text-red-400" />
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Pickup Address</p>
                            <p className="text-white text-lg">{trip.bookings.pickup_address}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-8 h-8 mr-4 text-red-400" />
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Customer Phone</p>
                            <p className="text-white text-lg font-mono">N/A</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Car className="w-8 h-8 mr-4 text-red-400" />
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Vehicle Assigned</p>
                            <p className="text-white text-lg">{trip.vehicles.vehicle_type}</p>
                            <p className="text-gray-400 text-sm font-mono">Unit: {trip.vehicles.unit_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="w-8 h-8 mr-4 text-red-400" />
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Trip ID</p>
                            <p className="text-white text-lg font-mono">{trip.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {nextStatus && (
                      <button
                        onClick={() => updateTripStatus(trip.id, nextStatus.value)}
                        disabled={isUpdating}
                        className={`w-full py-6 text-2xl rounded-2xl font-black transition duration-200 min-h-[80px] shadow-xl border-2 border-opacity-50 text-white disabled:opacity-50 flex items-center justify-center ${nextStatus.color}`}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                            UPDATING...
                          </>
                        ) : (
                          <>
                            <span className="mr-3 text-3xl">{nextStatus.icon}</span>
                            {nextStatus.label.toUpperCase()}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
