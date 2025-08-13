"use client"

import { useState, useEffect } from "react"
import supabase from "@/lib/supabase"

interface Driver {
  id: string
  license_number: string
  first_name: string
  last_name: string
  user_id?: string
}

export default function DriversList() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({
    connectionStatus: "Not tested",
    rawData: null,
    transformedData: null,
    queryError: null,
    supabaseUrl: "",
    timestamp: null,
  })
  const [showDebug, setShowDebug] = useState(true)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Starting drivers fetch...")
      console.log("📡 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("🔑 Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: "Connecting...",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
        timestamp: new Date().toISOString(),
      }))

      console.log("🔍 Executing Supabase query...")
      const { data, error: supabaseError } = await supabase
        .from("drivers")
        .select(`
          id,
          license_number,
          user_id,
          users (
            first_name,
            last_name
          )
        `)
        .order("users(last_name)", { ascending: true })

      console.log("📊 Raw Supabase response:", { data, error: supabaseError })

      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: supabaseError ? "Error" : "Connected",
        rawData: data,
        queryError: supabaseError,
      }))

      if (supabaseError) {
        console.error("❌ Supabase error:", supabaseError)
        throw supabaseError
      }

      const transformedData =
        data?.map((driver) => ({
          id: driver.id,
          license_number: driver.license_number,
          user_id: driver.user_id,
          first_name: driver.users?.first_name || "N/A",
          last_name: driver.users?.last_name || "N/A",
        })) || []

      console.log("🔄 Transformed data:", transformedData)
      console.log("✅ Found drivers:", transformedData.length)

      setDebugInfo((prev) => ({
        ...prev,
        transformedData: transformedData,
        connectionStatus: "Success",
      }))

      setDrivers(transformedData)
    } catch (err) {
      console.error("❌ Error fetching drivers:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch drivers")

      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: "Failed",
        queryError: err,
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered")
    fetchDrivers()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="text-white text-xl font-medium">Loading drivers...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {showDebug && (
          <div className="bg-yellow-900 border border-yellow-600 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-yellow-200 text-xl font-bold">🔍 Debug Information</h2>
              <button onClick={() => setShowDebug(false)} className="text-yellow-400 hover:text-yellow-200 text-sm">
                Hide Debug
              </button>
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
                  <div className="text-gray-300">Timestamp: {debugInfo.timestamp}</div>
                </div>
              </div>

              <div>
                <h3 className="text-yellow-200 font-semibold mb-2">Query Results</h3>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-white">Raw Records: {debugInfo.rawData?.length || 0}</div>
                  <div className="text-white">Transformed: {debugInfo.transformedData?.length || 0}</div>
                  <div className="text-white">Current Display: {drivers.length}</div>
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
              <h1 className="text-white text-3xl font-bold mb-2">TNT Drivers</h1>
              <p className="text-gray-300 text-lg">
                {drivers.length} driver{drivers.length !== 1 ? "s" : ""} registered
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
              <div className="text-red-400 text-xl font-medium mb-4">❌ Error Loading Drivers</div>
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

        {!error && drivers.length === 0 ? (
          <div className="bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-gray-400 text-xl font-medium mb-4">No Drivers Found</div>
              <p className="text-gray-500 text-lg">No drivers are currently registered in the system.</p>
            </div>
          </div>
        ) : (
          !error && (
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
                          {driver.first_name.charAt(0)}
                          {driver.last_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white text-2xl font-bold">
                            {driver.first_name} {driver.last_name}
                          </h3>
                          <p className="text-gray-400 text-lg">Driver ID: {driver.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-lg mb-1">License Number</div>
                      <div className="text-white text-xl font-mono font-bold bg-gray-800 px-4 py-2 rounded-lg">
                        {driver.license_number}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
