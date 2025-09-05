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
  User,
  Home,
  CalendarDays,
  Settings,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Navigation,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Plus
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useTrips } from "@/hooks/useTrips"

const TNTPortalEnhanced = () => {
  const [currentView, setCurrentView] = useState("login")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loginError, setLoginError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  
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
    setActiveTab("dashboard")
  }

  const updateTripStatus = (tripId: string, newStatus: string) => {
    // This would normally call a database update function
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600 border-blue-400'
      case 'confirmed': return 'bg-green-600 border-green-400'
      case 'in-progress': return 'bg-yellow-600 border-yellow-400'
      case 'completed': return 'bg-gray-600 border-gray-400'
      case 'cancelled': return 'bg-red-600 border-red-400'
      default: return 'bg-blue-600 border-blue-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-5 h-5" />
      case 'confirmed': return <CheckCircle className="w-5 h-5" />
      case 'in-progress': return <PlayCircle className="w-5 h-5" />
      case 'completed': return <CheckCircle className="w-5 h-5" />
      case 'cancelled': return <XCircle className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
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

  // Dashboard with Navigation
  if (!driver) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b-4 border-gray-600 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={driver.photo_url || "/placeholder.svg"}
              alt="Profile"
              className="w-16 h-16 rounded-full border-3 border-gray-600 shadow-md"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <div>
              <h3 className="text-white font-bold text-xl">{driver.name}</h3>
              <p className="text-gray-100 text-lg">ID: {driver.employee_id}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 rounded-xl transition duration-200 bg-red-600 hover:bg-red-700"
          >
            <LogOut className="text-white w-5 h-5" />
            <span className="text-white font-bold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 px-6 py-4 border-b-2 border-gray-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "dashboard" 
                ? "bg-red-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "schedule" 
                ? "bg-red-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab("trips")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "trips" 
                ? "bg-red-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Car className="w-5 h-5" />
            <span className="font-medium">My Trips</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === "profile" 
                ? "bg-red-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-6">
              <h2 className="text-white text-3xl font-bold mb-2">
                Today - {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long", 
                  day: "numeric",
                })}
              </h2>
              <p className="text-gray-300">Welcome back, {driver.name.split(' ')[0]}!</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{todaysTrips.length}</h3>
                    <p className="text-gray-300">Today's Trips</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {todaysTrips.filter(trip => trip.status === 'completed').length}
                    </h3>
                    <p className="text-gray-300">Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-600 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {todaysTrips.filter(trip => ['scheduled', 'confirmed', 'in-progress'].includes(trip.status)).length}
                    </h3>
                    <p className="text-gray-300">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white text-2xl font-bold mb-6">Today's Schedule</h3>
              
              {tripsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-white mr-3" />
                  <span className="text-white">Loading trips...</span>
                </div>
              ) : todaysTrips.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-white text-xl font-bold mb-2">No trips scheduled for today</h4>
                  <p className="text-gray-300">Enjoy your day off or check back later for new assignments!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="bg-gray-700 rounded-xl p-4 border-l-4 border-red-500 hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-bold text-lg">
                            {new Date(trip.pickup_time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </h4>
                          <p className="text-white">{trip.customer_name}</p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)}
                          <span>{trip.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-red-400" />
                        <span className="text-sm">{trip.pickup_location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-red-400" />
                          <span className="text-sm">
                            {trip.estimated_duration ? `${Math.floor(trip.estimated_duration / 60)}h ${trip.estimated_duration % 60}m` : 'Duration TBD'}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-3xl font-bold">Weekly Schedule</h2>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Request Time Off</span>
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="text-white text-xl font-bold mb-2">Schedule Management Coming Soon</h4>
                <p className="text-gray-300">View and manage your weekly schedule, request time off, and set availability.</p>
              </div>
            </div>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <div>
            <h2 className="text-white text-3xl font-bold mb-6">All My Trips</h2>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-center py-8">
                <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="text-white text-xl font-bold mb-2">Trip History Coming Soon</h4>
                <p className="text-gray-300">View your complete trip history, earnings, and performance metrics.</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-white text-3xl font-bold mb-6">Driver Profile</h2>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white text-xl font-bold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-300 text-sm">Full Name</label>
                      <p className="text-white font-medium">{driver.name}</p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Email</label>
                      <p className="text-white font-medium">{driver.email}</p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Phone</label>
                      <p className="text-white font-medium">{driver.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Employee ID</label>
                      <p className="text-white font-medium">{driver.employee_id}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white text-xl font-bold mb-4">Driver Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-300 text-sm">License Number</label>
                      <p className="text-white font-medium">{driver.license_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Hire Date</label>
                      <p className="text-white font-medium">
                        {driver.hire_date ? new Date(driver.hire_date).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        driver.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {driver.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-600">
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-2xl font-bold">Trip Details</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white text-xl font-semibold">{selectedTrip.customer_name}</h4>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(selectedTrip.status)}`}>
                  {getStatusIcon(selectedTrip.status)}
                  <span>{selectedTrip.status.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-300 text-sm">Pickup Time</label>
                    <p className="text-white font-medium">
                      {new Date(selectedTrip.pickup_time).toLocaleDateString()} at {' '}
                      {new Date(selectedTrip.pickup_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Pickup Location</label>
                    <p className="text-white font-medium">{selectedTrip.pickup_location}</p>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Drop-off Location</label>
                    <p className="text-white font-medium">{selectedTrip.dropoff_location || 'TBD'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-300 text-sm">Customer Phone</label>
                    <p className="text-white font-medium">{selectedTrip.customer_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Trip Type</label>
                    <p className="text-white font-medium capitalize">{selectedTrip.trip_type}</p>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Duration</label>
                    <p className="text-white font-medium">
                      {selectedTrip.estimated_duration ? `${Math.floor(selectedTrip.estimated_duration / 60)}h ${selectedTrip.estimated_duration % 60}m` : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedTrip.special_instructions && (
                <div>
                  <label className="text-gray-300 text-sm">Special Instructions</label>
                  <p className="text-white font-medium bg-gray-700 p-3 rounded-lg">
                    {selectedTrip.special_instructions}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                {selectedTrip.status === 'confirmed' && (
                  <button
                    onClick={() => updateTripStatus(selectedTrip.id, 'in-progress')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Start Trip</span>
                  </button>
                )}
                {selectedTrip.status === 'in-progress' && (
                  <button
                    onClick={() => updateTripStatus(selectedTrip.id, 'completed')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Trip</span>
                  </button>
                )}
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <Navigation className="w-5 h-5" />
                  <span>Get Directions</span>
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Call Customer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TNTPortalEnhanced