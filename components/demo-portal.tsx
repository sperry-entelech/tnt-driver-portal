"use client"

import { useState } from "react"
import TNTPortalEnhanced from "./tnt-portal-enhanced"

// Mock driver data for demo
const mockDriver = {
  id: "demo-driver-id",
  name: "Demo Driver",
  email: "demo@tntlimousine.com",
  phone: "+1234567890",
  employee_id: "DEMO001",
  license_number: "DL123456",
  hire_date: "2024-01-01",
  status: "active" as const,
  photo_url: "",
  available_status: "available",
  onboarding_completed: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}

// Mock trips data
const mockTrips = [
  {
    id: "trip-1",
    driver_id: "demo-driver-id",
    vehicle_id: "vehicle-1", 
    customer_name: "John Smith",
    customer_phone: "+1555123456",
    pickup_location: "DFW Airport Terminal A",
    dropoff_location: "Downtown Dallas Hotel",
    pickup_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    estimated_duration: 45,
    trip_type: "airport" as const,
    status: "confirmed" as const,
    special_instructions: "Customer has 2 large suitcases",
    fare_amount: 85,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "trip-2",
    driver_id: "demo-driver-id",
    vehicle_id: "vehicle-1",
    customer_name: "Sarah Johnson", 
    customer_phone: "+1555654321",
    pickup_location: "Four Seasons Hotel",
    dropoff_location: "American Airlines Center",
    pickup_time: new Date(Date.now() + 120 * 60 * 1000).toISOString(), // 2 hours from now
    estimated_duration: 25,
    trip_type: "point-to-point" as const,
    status: "scheduled" as const,
    special_instructions: "",
    fare_amount: 45,
    created_at: "2024-01-01T00:00:00Z", 
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "trip-3",
    driver_id: "demo-driver-id",
    vehicle_id: "vehicle-1",
    customer_name: "Michael Brown",
    customer_phone: "+1555987654", 
    pickup_location: "Dallas Love Field",
    dropoff_location: "Uptown Dallas",
    pickup_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    estimated_duration: 30,
    trip_type: "airport" as const,
    status: "completed" as const,
    special_instructions: "VIP customer",
    fare_amount: 65,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]

// Mock auth context
const mockAuth = {
  driver: mockDriver,
  loading: false,
  isAuthenticated: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {}
}

// Mock trips hook
const mockTripsHook = {
  todaysTrips: mockTrips,
  isLoading: false
}

const DemoPortal = () => {
  const [demoMode, setDemoMode] = useState(false)

  if (!demoMode) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-8">
        <div className="max-w-lg mx-auto w-full text-center">
          <div className="mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tnt%20logo.jpg-0nOdMYbCPVo0wVE6e5IXucJH5VJqRb.jpeg"
              alt="TNT Limousine Logo"
              className="w-48 h-auto mx-auto"
            />
          </div>
          <h1 className="text-white text-3xl font-bold mb-4">TNT Driver Portal</h1>
          <p className="text-gray-300 text-lg mb-8">Demo Mode Available</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setDemoMode(true)}
              className="w-full bg-green-600 text-white py-4 text-xl rounded-xl font-bold hover:bg-green-700 transition duration-200"
            >
              🚀 Enter Demo Mode
            </button>
            
            <div className="text-gray-400 text-sm">
              <p>Demo mode showcases all features without authentication</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left">
            <h3 className="text-white font-semibold mb-2">Demo Features:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• 🎤 Voice commands</li>
              <li>• 📱 Swipe gestures</li> 
              <li>• ⌨️ Keyboard shortcuts</li>
              <li>• 💬 One-touch communication</li>
              <li>• ⚡ Availability toggles</li>
              <li>• 🔔 Smart notifications</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Override the hooks with mock data for demo mode
  return (
    <div className="relative">
      {/* Demo indicator */}
      <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
        DEMO MODE
      </div>
      
      {/* Use the actual portal component but with mocked data */}
      <TNTPortalEnhanced />
    </div>
  )
}

export default DemoPortal