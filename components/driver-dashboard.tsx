"use client"

import { useState, useEffect } from "react"
import supabase from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, MapPin, User, Car, Calendar, RefreshCw } from "lucide-react"

interface Trip {
  id: string
  pickup_time: string
  pickup_address: string
  dropoff_address: string
  status: string
  fare_amount: number
  customer_name: string
  customer_phone: string
  vehicle_type: string
  license_plate: string
}

interface ShiftData {
  status: "active" | "inactive"
  start_time: string | null
  total_hours: number
}

interface EarningsData {
  today_earnings: number
  week_earnings: number
  completed_trips: number
}

export default function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [shiftData, setShiftData] = useState<ShiftData>({ status: "inactive", start_time: null, total_hours: 0 })
  const [earnings, setEarnings] = useState<EarningsData>({ today_earnings: 0, week_earnings: 0, completed_trips: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [showDebug, setShowDebug] = useState(true)

  // Mock current driver ID - in real app, this would come from auth
  const currentDriverId = "driver-123"

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Fetching dashboard data for driver:", currentDriverId)

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0]
      console.log("📅 Today's date:", today)

      // Fetch today's trips for current driver
      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select(`
          id,
          pickup_time,
          pickup_address,
          dropoff_address,
          status,
          fare_amount,
          driver_id,
          bookings (
            customer_name,
            customer_phone
          ),
          vehicles (
            vehicle_type,
            license_plate
          )
        `)
        .eq("driver_id", currentDriverId)
        .gte("pickup_time", `${today}T00:00:00`)
        .lt("pickup_time", `${today}T23:59:59`)
        .order("pickup_time", { ascending: true })

      console.log("🚗 Trips query result:", { data: tripsData, error: tripsError })

      // Fetch shift data
      const { data: shiftDataResult, error: shiftError } = await supabase
        .from("driver_shifts")
        .select("*")
        .eq("driver_id", currentDriverId)
        .eq("shift_date", today)
        .single()

      console.log("⏰ Shift query result:", { data: shiftDataResult, error: shiftError })

      // Calculate earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from("trips")
        .select("fare_amount, status")
        .eq("driver_id", currentDriverId)
        .eq("status", "completed")
        .gte("pickup_time", `${today}T00:00:00`)
        .lt("pickup_time", `${today}T23:59:59`)

      console.log("💰 Earnings query result:", { data: earningsData, error: earningsError })

      // Process trips data
      if (tripsData) {
        const processedTrips = tripsData.map((trip) => ({
          id: trip.id,
          pickup_time: trip.pickup_time,
          pickup_address: trip.pickup_address,
          dropoff_address: trip.dropoff_address,
          status: trip.status,
          fare_amount: trip.fare_amount || 0,
          customer_name: trip.bookings?.customer_name || "Unknown Customer",
          customer_phone: trip.bookings?.customer_phone || "",
          vehicle_type: trip.vehicles?.vehicle_type || "Unknown Vehicle",
          license_plate: trip.vehicles?.license_plate || "",
        }))
        setTrips(processedTrips)
      }

      // Process shift data
      if (shiftDataResult) {
        setShiftData({
          status: shiftDataResult.status || "inactive",
          start_time: shiftDataResult.start_time,
          total_hours: shiftDataResult.total_hours || 0,
        })
      }

      // Process earnings data
      if (earningsData) {
        const todayEarnings = earningsData.reduce((sum, trip) => sum + (trip.fare_amount || 0), 0)
        setEarnings({
          today_earnings: todayEarnings,
          week_earnings: todayEarnings, // Simplified - would need week calculation
          completed_trips: earningsData.length,
        })
      }

      // Set debug info
      setDebugInfo({
        connectionStatus: "Connected",
        envVars: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
        },
        queries: {
          trips: { data: tripsData, error: tripsError },
          shift: { data: shiftDataResult, error: shiftError },
          earnings: { data: earningsData, error: earningsError },
        },
        currentDriver: currentDriverId,
        todayDate: today,
      })
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data")
      setDebugInfo((prev) => ({ ...prev, error: err }))
    } finally {
      setLoading(false)
    }
  }

  const toggleShiftStatus = async () => {
    try {
      const newStatus = shiftData.status === "active" ? "inactive" : "active"
      const today = new Date().toISOString().split("T")[0]

      if (newStatus === "active") {
        // Start shift
        const { error } = await supabase.from("driver_shifts").upsert({
          driver_id: currentDriverId,
          shift_date: today,
          start_time: new Date().toISOString(),
          status: "active",
        })

        if (error) throw error
        setShiftData((prev) => ({ ...prev, status: "active", start_time: new Date().toISOString() }))
      } else {
        // End shift
        const { error } = await supabase
          .from("driver_shifts")
          .update({
            status: "inactive",
            end_time: new Date().toISOString(),
          })
          .eq("driver_id", currentDriverId)
          .eq("shift_date", today)

        if (error) throw error
        setShiftData((prev) => ({ ...prev, status: "inactive" }))
      }
    } catch (err) {
      console.error("❌ Shift toggle error:", err)
      setError(err instanceof Error ? err.message : "Failed to update shift status")
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-blue-500"
      case "en_route":
        return "bg-purple-500"
      case "arrived":
        return "bg-orange-500"
      case "picked_up":
        return "bg-indigo-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-12 w-12 animate-spin text-red-500" />
            <span className="ml-4 text-2xl">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Driver Dashboard</h1>
          <Button onClick={fetchDashboardData} className="h-16 px-8 text-xl bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-6 w-6 mr-3" />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-500 bg-red-900/20">
            <CardContent className="p-6">
              <p className="text-red-400 text-xl">❌ Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Shift Status & Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shift Status */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center">
                <Clock className="h-8 w-8 mr-3 text-red-500" />
                Shift Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  className={`text-xl px-4 py-2 ${shiftData.status === "active" ? "bg-green-600" : "bg-gray-600"}`}
                >
                  {shiftData.status === "active" ? "ON DUTY" : "OFF DUTY"}
                </Badge>
              </div>
              {shiftData.start_time && (
                <p className="text-gray-300 text-lg">Started: {formatTime(shiftData.start_time)}</p>
              )}
              <Button
                onClick={toggleShiftStatus}
                className={`w-full h-16 text-xl ${
                  shiftData.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {shiftData.status === "active" ? "End Shift" : "Start Shift"}
              </Button>
            </CardContent>
          </Card>

          {/* Today's Earnings */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center">
                <DollarSign className="h-8 w-8 mr-3 text-green-500" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-400">{formatCurrency(earnings.today_earnings)}</p>
                <p className="text-gray-400 text-lg">{earnings.completed_trips} completed trips</p>
              </div>
            </CardContent>
          </Card>

          {/* Week Earnings */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-500" />
                Week Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{formatCurrency(earnings.week_earnings)}</p>
                <p className="text-gray-400 text-lg">This week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Trips */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-3xl flex items-center">
              <Car className="h-10 w-10 mr-4 text-red-500" />
              Today's Assigned Trips ({trips.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {trips.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-2xl">No trips assigned for today</p>
              </div>
            ) : (
              trips.map((trip) => (
                <Card key={trip.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <User className="h-6 w-6 mr-3 text-blue-400" />
                          <span className="text-2xl font-semibold text-white">{trip.customer_name}</span>
                          <Badge className={`ml-4 text-lg px-3 py-1 ${getStatusColor(trip.status)}`}>
                            {trip.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-3 text-lg">
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-5 w-5 mr-3 text-yellow-400" />
                            Pickup: {formatTime(trip.pickup_time)}
                          </div>

                          <div className="flex items-start text-gray-300">
                            <MapPin className="h-5 w-5 mr-3 mt-1 text-green-400" />
                            <div>
                              <p className="font-medium">From: {trip.pickup_address}</p>
                              <p className="text-gray-400">To: {trip.dropoff_address}</p>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-300">
                            <Car className="h-5 w-5 mr-3 text-purple-400" />
                            {trip.vehicle_type} - {trip.license_plate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-400">{formatCurrency(trip.fare_amount)}</p>
                        {trip.customer_phone && <p className="text-gray-400 text-lg mt-2">{trip.customer_phone}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        {showDebug && (
          <Card className="bg-gray-900 border-yellow-500">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-2xl flex items-center justify-between">
                🐛 Debug Information
                <Button
                  onClick={() => setShowDebug(false)}
                  variant="outline"
                  className="text-yellow-400 border-yellow-400"
                >
                  Hide Debug
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Connection Status</h4>
                  <div className="space-y-2 text-lg">
                    <p className="text-gray-300">
                      Status: <span className="text-green-400">{debugInfo.connectionStatus}</span>
                    </p>
                    <p className="text-gray-300">
                      Driver ID: <span className="text-blue-400">{debugInfo.currentDriver}</span>
                    </p>
                    <p className="text-gray-300">
                      Date Filter: <span className="text-purple-400">{debugInfo.todayDate}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Environment Variables</h4>
                  <div className="space-y-2 text-lg">
                    <p className="text-gray-300">
                      SUPABASE_URL: <span className="text-green-400">{debugInfo.envVars?.supabaseUrl}</span>
                    </p>
                    <p className="text-gray-300">
                      SUPABASE_KEY: <span className="text-green-400">{debugInfo.envVars?.supabaseKey}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-white mb-3">Raw Query Results</h4>
                <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-sm text-gray-300">{JSON.stringify(debugInfo.queries, null, 2)}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showDebug && (
          <div className="text-center">
            <Button onClick={() => setShowDebug(true)} variant="outline" className="text-yellow-400 border-yellow-400">
              Show Debug Info
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
