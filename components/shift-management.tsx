"use client"

import { useState, useEffect } from "react"
import supabase from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Car, MapPin, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface Vehicle {
  id: string
  vehicle_type: string
  license_plate: string
  make: string
  model: string
  year: number
  status: string
}

interface ShiftReport {
  id: string
  driver_id: string
  vehicle_id: string
  start_time: string
  end_time: string | null
  start_mileage: number
  end_mileage: number | null
  status: "active" | "completed"
  created_at: string
}

export default function ShiftManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentShift, setCurrentShift] = useState<ShiftReport | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [startMileage, setStartMileage] = useState("")
  const [endMileage, setEndMileage] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [currentDriverId, setCurrentDriverId] = useState<string>("")

  useEffect(() => {
    fetchDriverAndData()
  }, [])

  const fetchDriverAndData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("👤 Fetching driver ID from database...")

      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select("id, users(first_name, last_name)")
        .limit(1)
        .single()

      if (driversError) {
        console.log("❌ Driver query error:", driversError)
        setCurrentDriverId("550e8400-e29b-41d4-a716-446655440000")
        console.log("🔄 Using fallback UUID for testing")
      } else {
        console.log("✅ Found driver:", driversData)
        setCurrentDriverId(driversData.id)
      }

      await fetchData()
    } catch (err: any) {
      console.error("❌ Error fetching driver:", err)
      setCurrentDriverId("550e8400-e29b-41d4-a716-446655440000")
      await fetchData()
    }
  }

  const fetchData = async () => {
    if (!currentDriverId) return

    try {
      console.log("🔄 Fetching vehicles and current shift for driver:", currentDriverId)

      const timestamp = Date.now()

      const connectionStatus = {
        client: !!supabase,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
        actualUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
        actualKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
          : "NOT SET",
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      }

      console.log("🚗 Executing vehicles query...")
      const vehicleQuery = supabase
        .from("vehicles")
        .select(`
          id,
          vehicle_type,
          license_plate,
          make,
          model,
          year,
          status
        `)
        .order("vehicle_type", { ascending: true })
        .limit(1000)

      const { data: vehiclesData, error: vehiclesError } = await vehicleQuery

      console.log("🚗 VEHICLES QUERY DEBUG:")
      console.log(
        "   Query: SELECT id, vehicle_type, license_plate, make, model, year, status FROM vehicles ORDER BY vehicle_type ASC LIMIT 1000",
      )
      console.log("   Raw Response:", { vehiclesData, vehiclesError })
      console.log("   Data Type:", typeof vehiclesData)
      console.log("   Is Array:", Array.isArray(vehiclesData))
      console.log("   Length:", vehiclesData?.length || 0)

      if (vehiclesData && vehiclesData.length > 0) {
        console.log("   First Vehicle:", vehiclesData[0])
        console.log(
          "   All Vehicle IDs:",
          vehiclesData.map((v) => v.id),
        )
        console.log(
          "   All Vehicle Types:",
          vehiclesData.map((v) => v.vehicle_type),
        )
        console.log(
          "   All Vehicle Statuses:",
          vehiclesData.map((v) => v.status),
        )
      } else {
        console.log("   ⚠️ NO VEHICLES RETURNED!")
      }

      if (vehiclesError) {
        console.log("   ❌ Vehicle Query Error:", vehiclesError)
      }

      const { data: shiftData, error: shiftError } = await supabase
        .from("shift_reports")
        .select(`
          *,
          vehicles (vehicle_type, license_plate, make, model)
        `)
        .eq("driver_id", currentDriverId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      console.log("📊 Current shift query result:", { shiftData, shiftError })

      const { data: allShifts, error: allShiftsError } = await supabase
        .from("shift_reports")
        .select("*")
        .eq("driver_id", currentDriverId)
        .order("created_at", { ascending: false })
        .limit(10)

      console.log("📊 All recent shifts:", { allShifts, allShiftsError })

      setDebugInfo({
        connectionStatus,
        currentDriverId,
        vehiclesQuery: {
          data: vehiclesData,
          error: vehiclesError,
          sqlQuery:
            "SELECT id, vehicle_type, license_plate, make, model, year, status FROM vehicles ORDER BY vehicle_type ASC LIMIT 1000",
          resultCount: vehiclesData?.length || 0,
          isEmpty: !vehiclesData || vehiclesData.length === 0,
          rawVehicleData: vehiclesData,
        },
        shiftQuery: { data: shiftData, error: shiftError },
        allShiftsQuery: { data: allShifts, error: allShiftsError },
        timestamp: new Date().toISOString(),
        cacheTimestamp: timestamp,
        vehicleStatusSummary: vehiclesData?.reduce(
          (acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
        shiftReportsCount: allShifts?.length || 0,
        activeShiftExists: !!shiftData,
      })

      if (vehiclesError && vehiclesError.code !== "PGRST116") {
        throw vehiclesError
      }

      if (shiftError && shiftError.code !== "PGRST116") {
        console.log("ℹ️ No active shift found (expected if no shift is active)")
      }

      setVehicles(vehiclesData || [])
      setCurrentShift(shiftData || null)
    } catch (err: any) {
      console.error("❌ Error fetching data:", err)
      setError(err.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const startShift = async () => {
    if (!selectedVehicleId || !startMileage) {
      setError("Please select a vehicle and enter starting mileage")
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      console.log("🚀 Starting shift...", { selectedVehicleId, startMileage })

      const shiftData = {
        driver_id: currentDriverId,
        vehicle_id: selectedVehicleId,
        start_time: new Date().toISOString(),
        start_mileage: Number.parseInt(startMileage),
        status: "active",
      }

      const { data, error } = await supabase
        .from("shift_reports")
        .insert([shiftData])
        .select(`
          *,
          vehicles (vehicle_type, license_plate, make, model)
        `)
        .single()

      console.log("✅ Shift started:", { data, error })

      if (error) throw error

      setCurrentShift(data)
      setSelectedVehicleId("")
      setStartMileage("")

      await supabase.from("vehicles").update({ status: "in-use" }).eq("id", selectedVehicleId)

      await fetchData() // Refresh data
    } catch (err: any) {
      console.error("❌ Error starting shift:", err)
      setError(err.message || "Failed to start shift")
    } finally {
      setActionLoading(false)
    }
  }

  const endShift = async () => {
    if (!endMileage || !currentShift) {
      setError("Please enter ending mileage")
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      console.log("🏁 Ending shift...", { endMileage })

      const { data, error } = await supabase
        .from("shift_reports")
        .update({
          end_time: new Date().toISOString(),
          end_mileage: Number.parseInt(endMileage),
          status: "completed",
        })
        .eq("id", currentShift.id)
        .select()
        .single()

      console.log("✅ Shift ended:", { data, error })

      if (error) throw error

      await supabase.from("vehicles").update({ status: "available" }).eq("id", currentShift.vehicle_id)

      setCurrentShift(null)
      setEndMileage("")

      await fetchData() // Refresh data
    } catch (err: any) {
      console.error("❌ Error ending shift:", err)
      setError(err.message || "Failed to end shift")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            <span className="ml-4 text-2xl">Loading shift management...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Shift Management</h1>
          <p className="text-xl text-gray-300">Start and end your driving shifts</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-500 bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <div>
                  <h3 className="text-xl font-semibold text-red-400">Error</h3>
                  <p className="text-lg text-red-300">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Shift Status */}
        {currentShift ? (
          <Card className="border-green-500 bg-green-900/20">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400 flex items-center">
                <CheckCircle className="h-8 w-8 mr-3" />
                Active Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-lg text-gray-300">Vehicle</Label>
                  <div className="text-xl text-white">
                    {currentShift.vehicles?.vehicle_type} - {currentShift.vehicles?.license_plate}
                  </div>
                  <div className="text-lg text-gray-400">
                    {currentShift.vehicles?.make} {currentShift.vehicles?.model}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-lg text-gray-300">Start Time</Label>
                  <div className="text-xl text-white">{new Date(currentShift.start_time).toLocaleString()}</div>
                  <div className="text-lg text-gray-400">
                    Start Mileage: {currentShift.start_mileage.toLocaleString()} miles
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <Label htmlFor="endMileage" className="text-lg text-gray-300">
                  Ending Mileage
                </Label>
                <Input
                  id="endMileage"
                  type="number"
                  placeholder="Enter ending mileage"
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                  className="h-16 text-xl bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  onClick={endShift}
                  disabled={actionLoading || !endMileage}
                  className="w-full h-20 text-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      Ending Shift...
                    </>
                  ) : (
                    <>
                      <Clock className="h-6 w-6 mr-3" />
                      End Shift
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Start New Shift */
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Car className="h-8 w-8 mr-3" />
                Start New Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="vehicle" className="text-lg text-gray-300">
                  Select Vehicle
                </Label>
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger className="h-16 text-xl bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id} className="text-lg text-white hover:bg-gray-700">
                        {vehicle.vehicle_type} - {vehicle.license_plate}
                        <span className="text-gray-400 ml-2">
                          ({vehicle.make} {vehicle.model} {vehicle.year})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="startMileage" className="text-lg text-gray-300">
                  Starting Mileage
                </Label>
                <Input
                  id="startMileage"
                  type="number"
                  placeholder="Enter starting mileage"
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                  className="h-16 text-xl bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Button
                onClick={startShift}
                disabled={actionLoading || !selectedVehicleId || !startMileage}
                className="w-full h-20 text-xl bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    Starting Shift...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 mr-3" />
                    Start Shift
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* All Vehicles */}
        {!currentShift && vehicles.length > 0 && (
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white">All Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 border border-gray-600 rounded-lg bg-gray-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white">{vehicle.vehicle_type}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          vehicle.status === "available"
                            ? "bg-green-600 text-white"
                            : vehicle.status === "in-use"
                              ? "bg-yellow-600 text-white"
                              : vehicle.status === "maintenance"
                                ? "bg-red-600 text-white"
                                : "bg-gray-600 text-white"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-300">{vehicle.license_plate}</p>
                    <p className="text-lg text-gray-400">
                      {vehicle.make} {vehicle.model} {vehicle.year}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        <Card className="border-gray-700 bg-gray-900/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-gray-400">Debug Information</CardTitle>
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                className="h-12 px-4 text-sm border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Data"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Vehicle Query Debug</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="text-gray-400">SQL Query:</span>
                    <div className="mt-1 p-2 bg-gray-900 rounded text-xs text-green-400 font-mono">
                      {debugInfo.vehiclesQuery?.sqlQuery}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Result Count:</span>
                      <span className="ml-2 text-white font-bold">{debugInfo.vehiclesQuery?.resultCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Is Empty:</span>
                      <Badge variant={debugInfo.vehiclesQuery?.isEmpty ? "destructive" : "default"} className="ml-2">
                        {debugInfo.vehiclesQuery?.isEmpty ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </div>
                  {debugInfo.vehiclesQuery?.error && (
                    <div>
                      <span className="text-red-400">Query Error:</span>
                      <div className="mt-1 p-2 bg-red-900/20 rounded text-xs text-red-300">
                        {JSON.stringify(debugInfo.vehiclesQuery.error, null, 2)}
                      </div>
                    </div>
                  )}
                  {debugInfo.vehiclesQuery?.rawVehicleData && debugInfo.vehiclesQuery.rawVehicleData.length > 0 && (
                    <div>
                      <span className="text-gray-400">Raw Vehicle Data:</span>
                      <div className="mt-1 p-2 bg-gray-900 rounded text-xs text-blue-400 font-mono max-h-40 overflow-y-auto">
                        {JSON.stringify(debugInfo.vehiclesQuery.rawVehicleData, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Supabase Connection</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="text-gray-400">Client Status:</span>
                    <Badge variant={debugInfo.connectionStatus?.client ? "default" : "destructive"} className="ml-2">
                      {debugInfo.connectionStatus?.client ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_URL:</span>
                    <div className="mt-1 p-2 bg-gray-900 rounded text-xs text-green-400 font-mono break-all">
                      {debugInfo.connectionStatus?.actualUrl}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Length: {debugInfo.connectionStatus?.urlLength} characters
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                    <div className="mt-1 p-2 bg-gray-900 rounded text-xs text-blue-400 font-mono">
                      {debugInfo.connectionStatus?.actualKey}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Length: {debugInfo.connectionStatus?.keyLength} characters
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Environment Status:</span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={debugInfo.connectionStatus?.url === "Set" ? "default" : "destructive"}>
                        URL: {debugInfo.connectionStatus?.url}
                      </Badge>
                      <Badge variant={debugInfo.connectionStatus?.key === "Set" ? "default" : "destructive"}>
                        Key: {debugInfo.connectionStatus?.key}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Data Status</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Current Driver ID:</span>
                    <div className="mt-1 p-2 bg-gray-900 rounded text-xs text-blue-400 font-mono">
                      {debugInfo.currentDriverId || "Not Set"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Vehicles:</span>
                    <span className="ml-2 text-white">{vehicles.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Shift Reports Count:</span>
                    <span className="ml-2 text-white">{debugInfo.shiftReportsCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Active Shift:</span>
                    <Badge variant={debugInfo.activeShiftExists ? "default" : "secondary"} className="ml-2">
                      {debugInfo.activeShiftExists ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {debugInfo.vehicleStatusSummary && (
                    <div>
                      <span className="text-gray-400">Vehicle Status:</span>
                      <div className="ml-2 flex flex-wrap gap-2 mt-1">
                        {Object.entries(debugInfo.vehicleStatusSummary).map(([status, count]) => (
                          <Badge
                            key={status}
                            variant="outline"
                            className={
                              status === "available"
                                ? "border-green-500 text-green-400"
                                : status === "in-use"
                                  ? "border-yellow-500 text-yellow-400"
                                  : status === "maintenance"
                                    ? "border-red-500 text-red-400"
                                    : "border-gray-500 text-gray-400"
                            }
                          >
                            {status}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="ml-2 text-white">
                      {debugInfo.timestamp ? new Date(debugInfo.timestamp).toLocaleTimeString() : "Never"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cache Timestamp:</span>
                    <span className="ml-2 text-white">{debugInfo.cacheTimestamp}</span>
                  </div>
                </div>
              </div>

              {debugInfo.allShiftsQuery?.data && debugInfo.allShiftsQuery.data.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Recent Shift Reports</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {debugInfo.allShiftsQuery.data.map((shift: any, index: number) => (
                      <div key={shift.id} className="text-xs bg-gray-800/50 p-2 rounded">
                        <div className="flex justify-between">
                          <span className="text-gray-400">#{index + 1}</span>
                          <Badge variant={shift.status === "active" ? "default" : "secondary"} className="text-xs">
                            {shift.status}
                          </Badge>
                        </div>
                        <div className="text-white">Start: {new Date(shift.start_time).toLocaleString()}</div>
                        {shift.end_time && (
                          <div className="text-gray-300">End: {new Date(shift.end_time).toLocaleString()}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button
            onClick={() => (window.location.href = "/")}
            className="h-16 px-8 text-xl bg-gray-700 hover:bg-gray-600 text-white"
          >
            <MapPin className="h-6 w-6 mr-3" />
            Back to Portal
          </Button>
        </div>
      </div>
    </div>
  )
}
