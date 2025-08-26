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
} from "lucide-react"

const TNTDriverPortal = () => {
  const [currentView, setCurrentView] = useState("login")
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showTripModal, setShowTripModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [pendingAssignment, setPendingAssignment] = useState(null)
  const [notifications, setNotifications] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState("")

  // Driver data - will be populated from Supabase login
  const driver = {
    name: "Kory Hummer Jr",
    id: "TNT_KORY",
    photo: "/api/placeholder/80/80",
  }

  const companyInfo = {
    name: "TNT Limousine Service",
    phone: "(804) 965-0990",
    email: "sedan@tntlimousine.com",
    address: "Richmond, VA"
  }

  const todaysTrips = [
    {
      id: 1,
      time: "8:00 AM",
      pickup: "Richmond International Airport",
      passenger: "Sarah Johnson",
      type: "Airport Transfer",
      vehicle: "Lincoln Navigator",
      status: "confirmed",
      phone: "(555) 123-4567",
      dropoff: "Short Pump Town Center",
      duration: "45 mins",
      notes: "Flight arrives Terminal A, customer has 2 large bags",
    },
    {
      id: 2,
      time: "2:30 PM",
      pickup: "The Jefferson Hotel",
      passenger: "Wedding Party - Miller",
      type: "Wedding",
      vehicle: "Lincoln Stretch Limo",
      status: "confirmed",
      phone: "(555) 987-6543",
      dropoff: "Hermitage Country Club",
      duration: "3 hours",
      notes: "Bride + 5 bridesmaids, red carpet requested",
    },
    {
      id: 3,
      time: "7:00 PM",
      pickup: "Corporate Office Park",
      passenger: "David Chen",
      type: "Corporate",
      vehicle: "Lincoln Town Car",
      status: "pending",
      phone: "(555) 456-7890",
      dropoff: "Dulles International Airport",
      duration: "2 hours",
      notes: "Executive client, international flight departure",
    },
  ]

  const mockAssignment = {
    id: 4,
    time: "11:30 AM",
    pickup: "University of Richmond",
    passenger: "Graduate Ceremony Group",
    type: "Special Event",
    vehicle: "Mercedes Sprinter Van",
    duration: "4 hours",
    rate: "$280",
    timeLeft: 180,
    dropoff: "Various restaurants downtown",
    passengerCount: 8,
    notes: "PhD graduation celebration, multiple stops requested",
  }

  // Timer for assignment countdown
  useEffect(() => {
    if (pendingAssignment && pendingAssignment.timeLeft > 0) {
      const timer = setInterval(() => {
        setPendingAssignment((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [pendingAssignment])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAcceptAssignment = async () => {
    setIsLoading(true)
    setLoadingAction("accept")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setShowAssignmentModal(false)
    setPendingAssignment(null)
    setNotifications((prev) => prev - 1)
    setIsLoading(false)
    setLoadingAction("")
  }

  const handleDeclineAssignment = async () => {
    setIsLoading(true)
    setLoadingAction("decline")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setShowAssignmentModal(false)
    setPendingAssignment(null)
    setNotifications((prev) => prev - 1)
    setIsLoading(false)
    setLoadingAction("")
  }

  const LoginPage = () => (
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

        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-gray-600">
          <div className="space-y-8">
            <div>
              <label className="block text-white text-xl font-semibold mb-4">Email Address</label>
              <input
                type="email"
                className="w-full px-8 py-6 text-xl bg-gray-700 border-3 border-gray-500 rounded-2xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/30 min-h-[64px]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-white text-xl font-semibold mb-4">Password</label>
              <input
                type="password"
                className="w-full px-8 py-6 text-xl bg-gray-700 border-3 border-gray-500 rounded-2xl text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/30 min-h-[64px]"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <label className="flex items-center text-white">
                <input type="checkbox" className="mr-4 w-6 h-6 text-red-500" />
                <span className="text-lg">Remember me</span>
              </label>
              <button className="text-red-400 text-lg hover:text-red-300 hover:underline min-h-[48px] px-2">
                Forgot password?
              </button>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault()
                setCurrentView("dashboard")
              }}
              className="w-full bg-red-600 text-white py-8 text-2xl rounded-2xl font-bold hover:bg-red-700 active:bg-red-800 transition duration-200 min-h-[72px] shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const Dashboard = () => (
    <div className="pb-32">
      <div className="bg-gray-800 p-8 border-b-4 border-gray-600 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={driver.photo || "/placeholder.svg"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-3 border-gray-600 shadow-md"
            />
            <div>
              <h3 className="text-white font-bold text-2xl">{driver.name}</h3>
              <p className="text-gray-100 text-xl">ID: {driver.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <div className="relative">
              <Bell className="text-white w-10 h-10" />
              {notifications > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-lg font-bold rounded-full w-9 h-9 flex items-center justify-center border-2 border-white shadow-lg">
                  {notifications}
                </span>
              )}
            </div>
            <button
              onClick={() => setCurrentView("login")}
              className="p-4 hover:bg-gray-700 rounded-xl transition duration-200 min-h-[56px] min-w-[56px]"
            >
              <LogOut className="text-white w-10 h-10" />
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
          <div className="bg-red-900 border-4 border-red-400 rounded-2xl p-8 shadow-2xl animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-3xl">🚨 NEW ASSIGNMENT</h3>
              <div className="bg-red-600 px-6 py-4 rounded-xl border-2 border-red-300">
                <span className="text-white font-mono text-4xl font-black">
                  {formatTime(pendingAssignment.timeLeft)}
                </span>
              </div>
            </div>
            <div className="text-white mb-8">
              <p className="font-bold text-2xl mb-2">
                {pendingAssignment.time} - {pendingAssignment.passenger}
              </p>
              <p className="text-red-100 text-xl">{pendingAssignment.pickup}</p>
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="w-full bg-red-500 text-white py-8 text-2xl rounded-2xl font-black hover:bg-red-600 active:bg-red-700 transition duration-200 min-h-[80px] shadow-xl border-2 border-red-300"
            >
              VIEW DETAILS NOW
            </button>
          </div>
        </div>
      )}

      <div className="px-8">
        <h3 className="text-white text-3xl font-bold mb-8">Today's Schedule</h3>
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
                  <h4 className="text-white font-bold text-2xl">{trip.time}</h4>
                  <p className="text-white text-xl mt-2">{trip.passenger}</p>
                </div>
                <span
                  className={`px-6 py-3 rounded-xl text-lg font-bold border-2 ${
                    trip.status === "confirmed"
                      ? "bg-green-600 text-white border-green-400"
                      : "bg-yellow-600 text-white border-yellow-400"
                  }`}
                >
                  {trip.status.toUpperCase()}
                </span>
              </div>
              <div className="text-gray-100 space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 mr-4 text-red-400" />
                  <span className="text-lg font-medium">{trip.pickup}</span>
                </div>
                <div className="flex items-center">
                  <Car className="w-8 h-8 mr-4 text-red-400" />
                  <span className="text-lg font-medium">{trip.vehicle}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-8 h-8 mr-4 text-red-400" />
                  <span className="text-lg font-medium">{trip.duration}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
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
              <div className="bg-red-600 px-6 py-4 rounded-xl border-2 border-red-300">
                <div className="text-white font-mono text-3xl font-black">{formatTime(pendingAssignment.timeLeft)}</div>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h4 className="text-red-400 font-bold text-xl mb-4">Trip Details</h4>
                <p className="text-white text-2xl font-bold">{pendingAssignment.time}</p>
                <p className="text-white text-xl mt-3">{pendingAssignment.passenger}</p>
                <p className="text-white text-xl">{pendingAssignment.type}</p>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Locations</h4>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="text-green-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Pickup</p>
                      <p className="text-white text-lg mt-2">{pendingAssignment.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-red-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Dropoff</p>
                      <p className="text-white text-lg mt-2">{pendingAssignment.dropoff}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Assignment Info</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Vehicle:</p>
                    <p className="text-white text-lg font-bold">{pendingAssignment.vehicle}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Duration:</p>
                    <p className="text-white text-lg font-bold">{pendingAssignment.duration}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Passengers:</p>
                    <p className="text-white text-lg font-bold">{pendingAssignment.passengerCount}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-200 text-lg font-medium">Rate:</p>
                    <p className="text-white text-lg font-bold">{pendingAssignment.rate}</p>
                  </div>
                </div>
              </div>

              {pendingAssignment.notes && (
                <div>
                  <h4 className="text-red-400 font-bold text-xl mb-4">Special Instructions</h4>
                  <p className="text-white text-lg leading-relaxed">{pendingAssignment.notes}</p>
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
                <p className="text-white text-3xl font-bold">{selectedTrip.time}</p>
                <p className="text-white text-xl mt-3">{selectedTrip.passenger}</p>
                <p className="text-white text-xl">{selectedTrip.type}</p>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Customer Contact</h4>
                <div className="flex items-center space-x-4">
                  <Phone className="text-white w-8 h-8" />
                  <span className="text-white text-xl font-semibold">{selectedTrip.phone}</span>
                </div>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Locations</h4>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="text-green-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Pickup</p>
                      <p className="text-white text-lg mt-2">{selectedTrip.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-red-400 w-8 h-8 mr-6 mt-1" />
                    <div>
                      <p className="text-white text-lg font-bold">Dropoff</p>
                      <p className="text-white text-lg mt-2">{selectedTrip.dropoff}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Vehicle & Duration</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <Car className="text-white w-8 h-8" />
                  <span className="text-white text-lg font-semibold">{selectedTrip.vehicle}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="text-white w-8 h-8" />
                  <span className="text-white text-lg font-semibold">{selectedTrip.duration}</span>
                </div>
              </div>

              {selectedTrip.notes && (
                <div>
                  <h4 className="text-red-400 font-bold text-xl mb-4">Special Instructions</h4>
                  <p className="text-white text-lg leading-relaxed">{selectedTrip.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-red-400 font-bold text-xl mb-6">Update Status</h4>
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:bg-blue-700 active:bg-blue-800 transition duration-200 min-h-[72px] shadow-lg border-2 border-blue-400">
                    🚗 En Route to Pickup
                  </button>
                  <button className="w-full bg-green-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:bg-green-700 active:bg-green-800 transition duration-200 min-h-[72px] shadow-lg border-2 border-green-400">
                    👥 Passenger Onboard
                  </button>
                  <button className="w-full bg-purple-600 text-white py-6 px-8 rounded-2xl text-lg font-bold hover:bg-purple-700 active:bg-purple-800 transition duration-200 min-h-[72px] shadow-lg border-2 border-purple-400">
                    ✅ Trip Complete
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

  // Main render logic
  if (currentView === "login") {
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
      {currentView === "profile" && (
        <div className="p-8 pb-32">
          <div className="bg-gray-800 p-6 rounded-2xl mb-8">
            <h2 className="text-white text-3xl font-bold mb-4">Profile & Settings</h2>
            <p className="text-red-400 text-lg">Manage your driver profile and preferences</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-6 mb-6">
                <img
                  src={driver.photo || "/placeholder.svg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-3 border-gray-600"
                />
                <div>
                  <h3 className="text-white font-bold text-2xl">{driver.name}</h3>
                  <p className="text-gray-300 text-lg">Driver ID: {driver.id}</p>
                </div>
              </div>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700">
                Edit Profile
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3 text-gray-300">
                <p><span className="font-bold">Email:</span> koryjr@tntlimousine.com</p>
                <p><span className="font-bold">Phone:</span> {companyInfo.phone}</p>
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

export default TNTDriverPortal
