"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Bell,
  Car,
  LogOut,
  MessageSquare,
  Home,
  UserCheck,
  RotateCcw,
  Loader2,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useTrips } from "@/hooks/useTrips"
import type { Trip } from "@/lib/supabase"

const TNTDriverPortal = () => {
  const [currentView, setCurrentView] = useState("login")
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showTripModal, setShowTripModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [pendingAssignment, setPendingAssignment] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState("")
  const [loginError, setLoginError] = useState("")
  
  // Authentication and data hooks
  const { driver, loading: authLoading, isAuthenticated, signIn, signOut } = useAuth()
  const { todaysTrips, unassignedTrips, isLoading: tripsLoading, updateTripStatus, acceptTrip } = useTrips(driver?.id || null)

  // Notifications count based on unassigned trips
  const notifications = unassignedTrips.length
  
  // Check for emergency organ transport trips
  const emergencyTrips = unassignedTrips.filter(trip => 
    trip.trip_type === 'organ_transport' || 
    trip.special_instructions?.includes('EMERGENCY ORGAN TRANSPORT')
  )

  const companyInfo = {
    name: "TNT Limousine Service",
    phone: "(804) 965-0990",
    email: "sedan@tntlimousine.com",
    address: "Richmond, VA"
  }

  // Helper function to format time from ISO string
  const formatTripTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Helper function to format duration from minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hours`
  }

  // Auto-redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && currentView === "login") {
      setCurrentView("dashboard")
    }
  }, [isAuthenticated, currentView])

  // Handle new unassigned trips (notifications) - prioritize emergency trips
  useEffect(() => {
    if (unassignedTrips.length > 0 && !pendingAssignment) {
      // Prioritize emergency organ transport trips
      const nextAssignment = emergencyTrips.length > 0 ? emergencyTrips[0] : unassignedTrips[0]
      setPendingAssignment(nextAssignment)
    }
  }, [unassignedTrips, pendingAssignment, emergencyTrips])

  const handleAcceptAssignment = async () => {
    if (!pendingAssignment) return
    
    setIsLoading(true)
    setLoadingAction("accept")
    
    try {
      const result = await acceptTrip(pendingAssignment.id)
      
      if (result.success) {
        setShowAssignmentModal(false)
        setPendingAssignment(null)
      } else {
        // You could show an error message to the user here
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
      setLoadingAction("")
    }
  }

  const handleDeclineAssignment = async () => {
    setIsLoading(true)
    setLoadingAction("decline")
    
    // For now, just remove from pending (in production, you might want to mark as declined)
    setShowAssignmentModal(false)
    setPendingAssignment(null)
    
    setIsLoading(false)
    setLoadingAction("")
  }

  const handleNotificationClick = () => {
    if (notifications > 0 || pendingAssignment) {
      if (pendingAssignment && !showAssignmentModal) {
        setShowAssignmentModal(true)
      } else {
        setCurrentView("assignments")
      }
    }
  }

  const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

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
        // Success will be handled by the auth state change
      } catch (error) {
        setLoginError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

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

              <div className="flex items-center justify-between pt-6">
                <label className="flex items-center text-white">
                  <input type="checkbox" className="mr-4 w-6 h-6 text-red-500" />
                  <span className="text-lg">Remember me</span>
                </label>
                <button 
                  type="button"
                  className="text-red-400 text-lg hover:text-red-300 hover:underline min-h-[48px] px-2"
                  onClick={() => {
                    // Handle forgot password - could open a modal or navigate to reset page
                  }}
                >
                  Forgot password?
                </button>
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

  const handleSignOut = async () => {
    await signOut()
    setCurrentView("login")
  }

  const Dashboard = () => {
    if (!driver) return null

    return (
      <div className="pb-32">
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
            <div className="flex items-center space-x-6">
              <button
                onClick={handleNotificationClick}
                className="relative p-4 hover:bg-gray-700 rounded-xl transition duration-200 min-h-[56px] min-w-[56px]"
              >
                <Bell className="text-white w-10 h-10" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-lg font-bold rounded-full w-9 h-9 flex items-center justify-center border-2 border-white shadow-lg">
                    {notifications}
                  </span>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 rounded-xl transition duration-200 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="text-white w-6 h-6" />
                <span className="text-white font-bold text-lg">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

      <div className="bg-black p-8 border-b-2 border-gray-700">
        <h2 className="text-white text-3xl font-bold">
          Today -{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
      </div>

      {pendingAssignment && (
        <div className="mx-8 my-8">
          <div className={`border-4 rounded-2xl p-8 shadow-2xl animate-pulse ${
            pendingAssignment.trip_type === 'organ_transport' || pendingAssignment.special_instructions?.includes('EMERGENCY ORGAN TRANSPORT')
              ? 'bg-red-950 border-red-300 ring-4 ring-red-500/50' 
              : 'bg-red-900 border-red-400'
          }`}>
            <div className="flex items-center justify-between mb-6">
              {pendingAssignment.trip_type === 'organ_transport' || pendingAssignment.special_instructions?.includes('EMERGENCY ORGAN TRANSPORT') ? (
                <>
                  <h3 className="text-white font-bold text-4xl">🚨 EMERGENCY ORGAN TRANSPORT 🚨</h3>
                  <div className="bg-red-500 px-6 py-4 rounded-xl border-2 border-red-200 animate-bounce">
                    <span className="text-white font-mono text-3xl font-black">
                      ❤️ CRITICAL
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-white font-bold text-3xl">🚨 NEW ASSIGNMENT</h3>
                  <div className="bg-red-600 px-6 py-4 rounded-xl border-2 border-red-300">
                    <span className="text-white font-mono text-2xl font-black">
                      URGENT
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Special organ transport display */}
            {(pendingAssignment.trip_type === 'organ_transport' || pendingAssignment.special_instructions?.includes('EMERGENCY ORGAN TRANSPORT')) && (
              <div className="mb-6 text-center">
                <div className="text-8xl mb-4">❤️</div>
                <div className="text-white text-2xl font-bold">ORGAN TRANSPORT REQUIRED</div>
                <div className="text-red-200 text-lg mt-2">Every second counts - immediate response needed</div>
              </div>
            )}
            
            <div className="text-white mb-8">
              <p className="font-bold text-2xl mb-2">
                {formatTripTime(pendingAssignment.pickup_time)} - {pendingAssignment.customer_name}
              </p>
              <p className="text-red-100 text-xl">{pendingAssignment.pickup_location}</p>
              <p className="text-red-200 text-lg mt-2">
                {pendingAssignment.trip_type.charAt(0).toUpperCase() + pendingAssignment.trip_type.slice(1)} Trip
              </p>
              {pendingAssignment.special_instructions && (
                <p className="text-yellow-200 text-lg mt-3 font-semibold bg-red-800/50 p-3 rounded-lg">
                  {pendingAssignment.special_instructions}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className={`w-full text-white py-8 text-2xl rounded-2xl font-black transition duration-200 min-h-[80px] shadow-xl border-2 ${
                pendingAssignment.trip_type === 'organ_transport' || pendingAssignment.special_instructions?.includes('EMERGENCY ORGAN TRANSPORT')
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 border-red-200 animate-pulse'
                  : 'bg-red-500 hover:bg-red-600 active:bg-red-700 border-red-300'
              }`}
            >
              {pendingAssignment.trip_type === 'organ_transport' || pendingAssignment.special_instructions?.includes('EMERGENCY ORGAN TRANSPORT')
                ? '🚨 ACCEPT EMERGENCY TRANSPORT NOW 🚨'
                : 'VIEW DETAILS NOW'
              }
            </button>
          </div>
        </div>
      )}

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
              <button
                key={trip.id}
                onClick={() => {
                  setSelectedTrip(trip)
                  setShowTripModal(true)
                }}
                className="w-full bg-gray-800 rounded-2xl p-8 border-l-6 border-red-500 hover:bg-gray-700 active:bg-gray-600 transition duration-200 text-left min-h-[140px] shadow-lg hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-white font-bold text-2xl">{formatTripTime(trip.pickup_time)}</h4>
                    <p className="text-white text-xl mt-2">{trip.customer_name}</p>
                  </div>
                  <span
                    className={`px-6 py-3 rounded-xl text-lg font-bold border-2 ${
                      trip.status === "confirmed"
                        ? "bg-green-600 text-white border-green-400"
                        : trip.status === "in-progress"
                        ? "bg-blue-600 text-white border-blue-400"
                        : trip.status === "completed"
                        ? "bg-purple-600 text-white border-purple-400"
                        : "bg-yellow-600 text-white border-yellow-400"
                    }`}
                  >
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
                    <span className="text-lg font-medium">
                      {(trip as any).vehicles ? 
                        `${(trip as any).vehicles.year} ${(trip as any).vehicles.make} ${(trip as any).vehicles.model}` 
                        : 'Vehicle TBD'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 mr-4 text-red-400" />
                    <span className="text-lg font-medium">
                      {trip.estimated_duration ? formatDuration(trip.estimated_duration) : 'Duration TBD'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-8 mt-12">
        <h3 className="text-white text-3xl font-bold mb-8">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-gray-800 p-8 rounded-2xl flex items-center space-x-6 hover:bg-gray-700 active:bg-gray-600 transition duration-200 min-h-[96px] shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="text-red-500 w-10 h-10" />
            <span className="text-white text-xl font-semibold">Driver Dashboard</span>
          </button>
          <button
            onClick={() => (window.location.href = "/shifts")}
            className="bg-gray-800 p-8 rounded-2xl flex items-center space-x-6 hover:bg-gray-700 active:bg-gray-600 transition duration-200 min-h-[96px] shadow-lg hover:shadow-xl"
          >
            <Clock className="text-red-500 w-10 h-10" />
            <span className="text-white text-xl font-semibold">Shift Management</span>
          </button>
          {/* Added View All Drivers button */}
          <button
            onClick={() => (window.location.href = "/drivers")}
            className="bg-gray-800 p-8 rounded-2xl flex items-center space-x-6 hover:bg-gray-700 active:bg-gray-600 transition duration-200 min-h-[96px] shadow-lg hover:shadow-xl"
          >
            <User className="text-red-500 w-10 h-10" />
            <span className="text-white text-xl font-semibold">View All Drivers</span>
          </button>
          <button
            onClick={() => (window.location.href = "/trips")}
            className="bg-gray-800 p-8 rounded-2xl flex items-center space-x-6 hover:bg-gray-700 active:bg-gray-600 transition duration-200 min-h-[96px] shadow-lg hover:shadow-xl"
          >
            <Car className="text-red-500 w-10 h-10" />
            <span className="text-white text-xl font-semibold">View Trip Assignments</span>
          </button>
          {[
            { key: "schedule", icon: Calendar, label: "View Schedule" },
            { key: "availability", icon: UserCheck, label: "Availability" },
            { key: "swaps", icon: RotateCcw, label: "Trip Swaps" },
            { key: "messages", icon: MessageSquare, label: "Messages" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`bg-gray-800 p-8 rounded-2xl flex items-center space-x-6 hover:bg-gray-700 active:bg-gray-600 transition duration-200 min-h-[96px] shadow-lg hover:shadow-xl ${
                currentView === key ? "bg-gray-700" : ""
              }`}
            >
              <Icon className="text-red-500 w-10 h-10" />
              <span className="text-white text-xl font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const AssignmentModal = () => {
    if (!pendingAssignment) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6 z-50">
        <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-screen overflow-y-auto border-4 border-gray-600 shadow-2xl">
          <div className="p-10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-white text-3xl font-bold">Trip Assignment</h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-white hover:text-red-400 text-3xl p-2 hover:bg-gray-700 rounded-xl transition duration-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-10">
              <div>
                <h4 className="text-red-400 font-bold text-xl mb-4">Trip Details</h4>
                <p className="text-white text-2xl font-bold">{formatTripTime(pendingAssignment.pickup_time)}</p>
                <p className="text-white text-xl mt-3">{pendingAssignment.customer_name}</p>
                <p className="text-white text-xl">
                  {pendingAssignment.trip_type.charAt(0).toUpperCase() + pendingAssignment.trip_type.slice(1)} Trip
                </p>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Locations</h4>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="text-green-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Pickup</p>
                      <p className="text-white text-lg mt-2">{pendingAssignment.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-red-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Dropoff</p>
                      <p className="text-white text-lg mt-2">{pendingAssignment.dropoff_location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Assignment Info</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Vehicle:</p>
                    <p className="text-white text-lg font-bold">
                      {(pendingAssignment as any).vehicles ? 
                        `${(pendingAssignment as any).vehicles.year} ${(pendingAssignment as any).vehicles.make} ${(pendingAssignment as any).vehicles.model}` 
                        : 'Vehicle TBD'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Duration:</p>
                    <p className="text-white text-lg font-bold">
                      {pendingAssignment.estimated_duration ? formatDuration(pendingAssignment.estimated_duration) : 'TBD'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Customer Phone:</p>
                    <p className="text-white text-lg font-bold">{pendingAssignment.customer_phone || 'N/A'}</p>
                  </div>
                  {pendingAssignment.fare_amount && (
                    <div className="flex justify-between">
                      <p className="text-gray-200 text-lg font-medium">Fare:</p>
                      <p className="text-white text-lg font-bold">${pendingAssignment.fare_amount}</p>
                    </div>
                  )}
                </div>
              </div>

              {pendingAssignment.special_instructions && (
                <div>
                  <h4 className="text-red-400 font-bold text-xl mb-4">Special Instructions</h4>
                  <p className="text-white text-lg leading-relaxed">{pendingAssignment.special_instructions}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-6 mt-12">
              <button
                onClick={handleAcceptAssignment}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-8 text-2xl rounded-2xl font-black hover:bg-green-700 active:bg-green-800 transition duration-200 min-h-[80px] shadow-xl border-2 border-green-400 disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading && loadingAction === "accept" ? (
                  <>
                    <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                    ACCEPTING...
                  </>
                ) : (
                  "✓ ACCEPT TRIP"
                )}
              </button>
              <button
                onClick={handleDeclineAssignment}
                disabled={isLoading}
                className="w-full bg-gray-600 text-white py-8 text-2xl rounded-2xl font-black hover:bg-gray-500 active:bg-gray-700 transition duration-200 min-h-[80px] shadow-xl border-2 border-gray-400 disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading && loadingAction === "decline" ? (
                  <>
                    <Loader2 className="w-8 h-8 mr-4 animate-spin" />
                    DECLINING...
                  </>
                ) : (
                  "✗ DECLINE"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleStatusUpdate = async (tripId: string, newStatus: Trip['status']) => {
    setIsLoading(true)
    try {
      const result = await updateTripStatus(tripId, newStatus)
      if (result.success) {
        setShowTripModal(false)
        // The trips will be updated via the useTrips hook
      } else {
        // Could show error message to user here
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const TripModal = () => {
    if (!selectedTrip) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6 z-50">
        <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-screen overflow-y-auto border-4 border-gray-600 shadow-2xl">
          <div className="p-10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-white text-3xl font-bold">Trip Details</h3>
              <button
                onClick={() => setShowTripModal(false)}
                className="text-white hover:text-red-400 text-4xl p-4 hover:bg-gray-700 rounded-xl transition duration-200 min-h-[64px] min-w-[64px] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-10">
              <div>
                <h4 className="text-red-400 font-bold text-xl mb-4">Trip Overview</h4>
                <p className="text-white text-3xl font-bold">{formatTripTime(selectedTrip.pickup_time)}</p>
                <p className="text-white text-xl mt-3">{selectedTrip.customer_name}</p>
                <p className="text-white text-xl">
                  {selectedTrip.trip_type.charAt(0).toUpperCase() + selectedTrip.trip_type.slice(1)} Trip
                </p>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Customer Contact</h4>
                <div className="flex items-center space-x-4">
                  <Phone className="text-white w-8 h-8" />
                  <span className="text-white text-xl font-semibold">{selectedTrip.customer_phone || 'N/A'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Locations</h4>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="text-green-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Pickup</p>
                      <p className="text-white text-lg mt-2">{selectedTrip.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-red-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Dropoff</p>
                      <p className="text-white text-lg mt-2">{selectedTrip.dropoff_location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Vehicle & Duration</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <Car className="text-white w-8 h-8" />
                  <span className="text-white text-lg font-semibold">
                    {(selectedTrip as any).vehicles ? 
                      `${(selectedTrip as any).vehicles.year} ${(selectedTrip as any).vehicles.make} ${(selectedTrip as any).vehicles.model}` 
                      : 'Vehicle TBD'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="text-white w-8 h-8" />
                  <span className="text-white text-lg font-semibold">
                    {selectedTrip.estimated_duration ? formatDuration(selectedTrip.estimated_duration) : 'Duration TBD'}
                  </span>
                </div>
              </div>

              {selectedTrip.special_instructions && (
                <div>
                  <h4 className="text-red-400 font-bold text-xl mb-4">Special Instructions</h4>
                  <p className="text-white text-lg leading-relaxed">{selectedTrip.special_instructions}</p>
                </div>
              )}

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Update Status</h4>
                <div className="space-y-4">
                  <button 
                    onClick={() => handleStatusUpdate(selectedTrip.id, 'in-progress')}
                    disabled={isLoading || selectedTrip.status === 'in-progress'}
                    className="w-full bg-blue-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:bg-blue-700 active:bg-blue-800 transition duration-200 min-h-[72px] shadow-lg border-2 border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : '🚗'} En Route to Pickup
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedTrip.id, 'in-progress')}
                    disabled={isLoading || selectedTrip.status === 'completed'}
                    className="w-full bg-green-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:bg-green-700 active:bg-green-800 transition duration-200 min-h-[72px] shadow-lg border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : '👥'} Passenger Onboard
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedTrip.id, 'completed')}
                    disabled={isLoading || selectedTrip.status === 'completed'}
                    className="w-full bg-purple-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:bg-purple-700 active:bg-purple-800 transition duration-200 min-h-[72px] shadow-lg border-2 border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : '✅'} Trip Complete
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button
                onClick={() => setShowTripModal(false)}
                className="w-full bg-gray-600 text-white py-8 text-2xl rounded-2xl font-bold hover:bg-gray-500 active:bg-gray-700 transition duration-200 min-h-[80px] shadow-xl border-2 border-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t-4 border-gray-600 shadow-2xl">
      <div className="flex">
        {[
          { key: "dashboard", icon: Home, label: "Dashboard" },
          { key: "schedule", icon: Calendar, label: "Schedule" },
          { key: "assignments", icon: Bell, label: "Assignments", badge: notifications },
          { key: "swaps", icon: RotateCcw, label: "Swaps" },
          { key: "profile", icon: User, label: "Profile" },
        ].map(({ key, icon: Icon, label, badge }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`flex-1 py-6 px-4 flex flex-col items-center relative min-h-[100px] hover:bg-gray-700 active:bg-gray-600 transition duration-200 ${
              currentView === key ? "text-red-400 bg-gray-700" : "text-white"
            }`}
          >
            <Icon className="w-9 h-9 mb-3" />
            <span className="text-base font-bold">{label}</span>
            {badge > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-base font-black rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

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

  // Main render logic
  if (!isAuthenticated || currentView === "login") {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {currentView === "dashboard" && <Dashboard />}
      {currentView === "schedule" && (
        <div className="p-8 pb-32">
          <div className="bg-gray-800 p-6 rounded-2xl mb-8">
            <h2 className="text-white text-3xl font-bold mb-4">Weekly Schedule</h2>
            <p className="text-red-400 text-lg">View your upcoming trips and assignments</p>
          </div>
          
          <div className="space-y-6">
            {todaysTrips.map((trip) => (
              <div key={trip.id} className="bg-gray-800 rounded-2xl p-6 border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold text-xl">{trip.time}</h4>
                    <p className="text-white text-lg">{trip.passenger}</p>
                    <p className="text-gray-300 text-base">{trip.type}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    trip.status === "confirmed" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                  }`}>
                    {trip.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-300 space-y-2">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-red-400" />
                    <span>{trip.pickup} → {trip.dropoff}</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-5 h-5 mr-3 text-red-400" />
                    <span>{trip.vehicle}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-red-400" />
                    <span>{trip.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {currentView === "assignments" && (
        <div className="p-8 pb-32">
          <div className="bg-gray-800 p-6 rounded-2xl mb-8">
            <h2 className="text-white text-3xl font-bold mb-4">Trip Assignments</h2>
            <p className="text-red-400 text-lg">Manage your trip assignments and availability</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Available Assignments</h3>
              <p className="text-gray-300 mb-4">No new assignments available at this time.</p>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700">
                Refresh Assignments
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Your Status</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-white">Available</span>
                </div>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-500">
                  Change Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentView === "swaps" && (
        <div className="p-8 pb-32">
          <div className="bg-gray-800 p-6 rounded-2xl mb-8">
            <h2 className="text-white text-3xl font-bold mb-4">Trip Swaps</h2>
            <p className="text-red-400 text-lg">Request trip swaps with other drivers</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">My Trips Available for Swap</h3>
              <div className="space-y-4">
                {todaysTrips.slice(0, 2).map((trip) => (
                  <div key={trip.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{trip.time} - {trip.passenger}</p>
                      <p className="text-gray-300 text-sm">{trip.pickup}</p>
                    </div>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-700">
                      Request Swap
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Available Swaps</h3>
              <p className="text-gray-300">No swap requests from other drivers at this time.</p>
            </div>
          </div>
        </div>
      )}
      {currentView === "profile" && driver && (
        <div className="p-8 pb-32">
          <div className="bg-gray-800 p-6 rounded-2xl mb-8">
            <h2 className="text-white text-3xl font-bold mb-4">Profile & Settings</h2>
            <p className="text-red-400 text-lg">Manage your driver profile and preferences</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-6 mb-6">
                <img
                  src={driver.photo_url || "/placeholder.svg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-3 border-gray-600"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div>
                  <h3 className="text-white font-bold text-2xl">{driver.name}</h3>
                  <p className="text-gray-300 text-lg">Driver ID: {driver.employee_id}</p>
                  <p className="text-gray-400 text-sm">Status: {driver.status.toUpperCase()}</p>
                </div>
              </div>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700">
                Edit Profile
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3 text-gray-300">
                <p><span className="font-bold">Email:</span> {driver.email}</p>
                <p><span className="font-bold">Phone:</span> {driver.phone || 'Not provided'}</p>
                <p><span className="font-bold">License:</span> {driver.license_number || 'Not provided'}</p>
                <p><span className="font-bold">Hire Date:</span> {new Date(driver.hire_date).toLocaleDateString()}</p>
                <p><span className="font-bold">Company:</span> {companyInfo.name}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">Push Notifications</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Enabled</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Email Updates</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Enabled</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Auto-Accept Assignments</span>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Disabled</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      {showAssignmentModal && <AssignmentModal />}
      {showTripModal && <TripModal />}
    </div>
  )
}

export default TNTDriverPortal;
