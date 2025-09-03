"use client"

import { useState, useEffect } from "react"
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  Bell,
  Calendar,
  Clock,
  MapPin,
  Car,
  Phone,
  User
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useTrips } from "@/hooks/useTrips"

const TNTPortalV2 = () => {
  const [currentView, setCurrentView] = useState("login")
  const [loginError, setLoginError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Authentication and data hooks
  const { driver, loading: authLoading, isAuthenticated, signIn, signOut } = useAuth()
  const { todaysTrips, isLoading: tripsLoading } = useTrips(driver?.id || null)

  // Auto-redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && currentView === "login") {
      setCurrentView("dashboard")
    }
  }, [isAuthenticated, currentView])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    if (!email || !password) {
      setLoginError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setLoginError(error.message || "Login failed")
      }
    } catch (error) {
      setLoginError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setCurrentView("login")
  }

  // Loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tnt%20logo.jpg-0nOdMYbCPVo0wVE6e5IXucJH5VJqRb.jpeg"
              alt="TNT Limousine Logo"
              className="w-32 h-auto mx-auto opacity-50"
            />
          </div>
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  // Login Page
  if (!isAuthenticated || currentView === "login") {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center px-8">
        <div className="max-w-lg mx-auto w-full">
          <div className="text-center mb-12">
            <div className="mb-8">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tnt%20logo.jpg-0nOdMYbCPVo0wVE6e5IXucJH5VJqRb.jpeg"
                alt="TNT Limousine Logo"
                className="w-48 h-auto mx-auto"
              />
            </div>
            <p className="text-2xl text-white font-medium">Driver Portal</p>
          </div>

          <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-600">
            <div className="space-y-8">
              {loginError && (
                <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="text-red-400 w-5 h-5 flex-shrink-0" />
                  <p className="text-red-200 text-lg">{loginError}</p>
                </div>
              )}

              <div>
                <label className="block text-white text-xl font-semibold mb-4">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-8 py-6 text-xl bg-gray-700 border-3 border-gray-500 rounded-2xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/30 min-h-[64px] disabled:opacity-50"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-xl font-semibold mb-4">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-8 py-6 text-xl bg-gray-700 border-3 border-gray-500 rounded-2xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/30 min-h-[64px] disabled:opacity-50"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-8 text-2xl rounded-2xl font-bold hover:bg-red-700 active:bg-red-800 transition duration-200 min-h-[72px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard
  if (!driver) return null

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="bg-gray-800 p-8 border-b-4 border-gray-600 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={driver.photo_url || "/placeholder.svg"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-3 border-gray-600 shadow-md"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <div>
              <h3 className="text-white font-bold text-2xl">{driver.name}</h3>
              <p className="text-gray-100 text-xl">ID: {driver.employee_id}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 rounded-xl transition duration-200 bg-red-600 hover:bg-red-700"
          >
            <LogOut className="text-white w-6 h-6" />
            <span className="text-white font-bold text-lg">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Today's Date */}
      <div className="bg-black p-8 border-b-2 border-gray-700">
        <h2 className="text-white text-3xl font-bold">
          Today - {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long", 
            day: "numeric",
          })}
        </h2>
      </div>

      {/* Today's Trips */}
      <div className="px-8">
        <h3 className="text-white text-3xl font-bold mb-8">Today's Schedule</h3>
        
        {tripsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white mr-3" />
            <span className="text-white text-lg">Loading trips...</span>
          </div>
        ) : todaysTrips.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h4 className="text-white text-xl font-bold mb-2">No trips scheduled for today</h4>
            <p className="text-gray-300">Enjoy your day off or check back later for new assignments!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {todaysTrips.map((trip) => (
              <div
                key={trip.id}
                className="w-full bg-gray-800 rounded-2xl p-8 border-l-6 border-red-500 shadow-lg"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-white font-bold text-2xl">
                      {new Date(trip.pickup_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </h4>
                    <p className="text-white text-xl mt-2">{trip.customer_name}</p>
                  </div>
                  <span className="px-6 py-3 rounded-xl text-lg font-bold border-2 bg-green-600 text-white border-green-400">
                    {trip.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-100 space-y-4">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 mr-4 text-red-400" />
                    <span className="text-lg font-medium">{trip.pickup_location}</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-8 h-8 mr-4 text-red-400" />
                    <span className="text-lg font-medium">TNT Vehicle</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 mr-4 text-red-400" />
                    <span className="text-lg font-medium">
                      {trip.estimated_duration ? `${Math.floor(trip.estimated_duration / 60)}h ${trip.estimated_duration % 60}m` : 'Duration TBD'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TNTPortalV2