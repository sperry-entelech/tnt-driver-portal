"use client"

import { useState, useEffect } from "react"
import { 
  Car,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Eye,
  Phone,
  Navigation,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Star,
  TrendingUp,
  Award,
  Target
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Driver, Trip } from "@/lib/supabase"

interface TripHistoryProps {
  driver: Driver
}

interface TripWithDetails extends Trip {
  customer_rating?: number
  earnings?: number
  tips?: number
}

interface TripStats {
  totalTrips: number
  totalEarnings: number
  averageRating: number
  completionRate: number
  thisWeekTrips: number
  thisMonthTrips: number
}

const TripHistory = ({ driver }: TripHistoryProps) => {
  const [trips, setTrips] = useState<TripWithDetails[]>([])
  const [filteredTrips, setFilteredTrips] = useState<TripWithDetails[]>([])
  const [stats, setStats] = useState<TripStats>({
    totalTrips: 0,
    totalEarnings: 0,
    averageRating: 0,
    completionRate: 0,
    thisWeekTrips: 0,
    thisMonthTrips: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<TripWithDetails | null>(null)
  const [showTripModal, setShowTripModal] = useState(false)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')

  useEffect(() => {
    fetchTripData()
  }, [driver.id])

  useEffect(() => {
    filterTrips()
  }, [trips, searchTerm, statusFilter, dateRange])

  const fetchTripData = async () => {
    setIsLoading(true)
    
    try {
      // Fetch trips for this driver
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          vehicles(make, model, license_plate)
        `)
        .eq('driver_id', driver.id)
        .order('pickup_time', { ascending: false })
        .limit(100)

      if (tripsError) throw tripsError

      // Add mock earnings and ratings for demonstration
      const tripsWithDetails: TripWithDetails[] = (tripsData || []).map(trip => ({
        ...trip,
        earnings: trip.status === 'completed' ? Math.floor(Math.random() * 100) + 50 : 0,
        tips: trip.status === 'completed' ? Math.floor(Math.random() * 30) : 0,
        customer_rating: trip.status === 'completed' ? Math.floor(Math.random() * 2) + 4 : undefined
      }))

      setTrips(tripsWithDetails)
      calculateStats(tripsWithDetails)

    } catch (error) {
      console.error('Error fetching trip data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (tripsData: TripWithDetails[]) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const completedTrips = tripsData.filter(trip => trip.status === 'completed')
    const totalEarnings = completedTrips.reduce((sum, trip) => sum + (trip.earnings || 0) + (trip.tips || 0), 0)
    const totalRatings = completedTrips.filter(trip => trip.customer_rating).length
    const averageRating = totalRatings > 0 
      ? completedTrips.reduce((sum, trip) => sum + (trip.customer_rating || 0), 0) / totalRatings
      : 0

    const thisWeekTrips = tripsData.filter(trip => 
      new Date(trip.pickup_time) >= weekAgo
    ).length

    const thisMonthTrips = tripsData.filter(trip => 
      new Date(trip.pickup_time) >= monthAgo
    ).length

    const completionRate = tripsData.length > 0 
      ? (completedTrips.length / tripsData.length) * 100 
      : 0

    setStats({
      totalTrips: tripsData.length,
      totalEarnings,
      averageRating,
      completionRate,
      thisWeekTrips,
      thisMonthTrips
    })
  }

  const filterTrips = () => {
    let filtered = trips

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()
      
      switch (dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
      }
      
      filtered = filtered.filter(trip => new Date(trip.pickup_time) >= cutoffDate)
    }

    setFilteredTrips(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600'
      case 'confirmed': return 'bg-green-600'
      case 'in-progress': return 'bg-yellow-600'
      case 'completed': return 'bg-gray-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <PlayCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const openTripModal = (trip: TripWithDetails) => {
    setSelectedTrip(trip)
    setShowTripModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-white">Loading trip history...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-3xl font-bold mb-2">Trip History & Performance</h2>
        <p className="text-gray-300">Track your earnings, ratings, and trip history</p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalTrips}</p>
              <p className="text-gray-300 text-sm">Total Trips</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {stats.thisWeekTrips} this week • {stats.thisMonthTrips} this month
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${stats.totalEarnings}</p>
              <p className="text-gray-300 text-sm">Total Earnings</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Including tips and bonuses
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'}
              </p>
              <p className="text-gray-300 text-sm">Avg Rating</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Based on customer feedback
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completionRate.toFixed(0)}%</p>
              <p className="text-gray-300 text-sm">Completion Rate</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Trips completed successfully
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers, locations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="in-progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Trip List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-white text-xl font-bold mb-2">No trips found</h4>
            <p className="text-gray-300">
              {trips.length === 0 ? "You haven't completed any trips yet." : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => openTripModal(trip)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-semibold">{trip.customer_name}</h4>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs text-white ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)}
                        <span className="capitalize">{trip.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="truncate max-w-xs">{trip.pickup_location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>
                          {new Date(trip.pickup_time).toLocaleDateString()} at{' '}
                          {new Date(trip.pickup_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      {trip.earnings && (
                        <div className="flex items-center space-x-1 text-green-400">
                          <DollarSign className="w-4 h-4" />
                          <span>${trip.earnings + (trip.tips || 0)}</span>
                        </div>
                      )}
                      {trip.customer_rating && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star className="w-4 h-4" />
                          <span>{trip.customer_rating.toFixed(1)}</span>
                        </div>
                      )}
                      <span className="text-gray-400 capitalize">{trip.trip_type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Detail Modal */}
      {showTripModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white text-2xl font-bold">{selectedTrip.customer_name}</h3>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-white mt-2 ${getStatusColor(selectedTrip.status)}`}>
                  {getStatusIcon(selectedTrip.status)}
                  <span className="capitalize">{selectedTrip.status}</span>
                </div>
              </div>
              <button
                onClick={() => setShowTripModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium">Trip Date & Time</label>
                  <p className="text-white">
                    {new Date(selectedTrip.pickup_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at{' '}
                    {new Date(selectedTrip.pickup_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium">Pickup Location</label>
                  <p className="text-white">{selectedTrip.pickup_location}</p>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium">Dropoff Location</label>
                  <p className="text-white">{selectedTrip.dropoff_location}</p>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium">Trip Type</label>
                  <p className="text-white capitalize">{selectedTrip.trip_type}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium">Customer Phone</label>
                  <p className="text-white">{selectedTrip.customer_phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-medium">Duration</label>
                  <p className="text-white">
                    {selectedTrip.estimated_duration 
                      ? `${Math.floor(selectedTrip.estimated_duration / 60)}h ${selectedTrip.estimated_duration % 60}m`
                      : 'Not specified'
                    }
                  </p>
                </div>

                {selectedTrip.earnings && (
                  <div>
                    <label className="text-gray-300 text-sm font-medium">Earnings</label>
                    <div className="text-white">
                      <div>Base: ${selectedTrip.earnings}</div>
                      {selectedTrip.tips && <div>Tips: ${selectedTrip.tips}</div>}
                      <div className="font-semibold">Total: ${selectedTrip.earnings + (selectedTrip.tips || 0)}</div>
                    </div>
                  </div>
                )}

                {selectedTrip.customer_rating && (
                  <div>
                    <label className="text-gray-300 text-sm font-medium">Customer Rating</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedTrip.customer_rating! ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white">{selectedTrip.customer_rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedTrip.special_instructions && (
              <div className="mt-6">
                <label className="text-gray-300 text-sm font-medium">Special Instructions</label>
                <div className="bg-gray-700 rounded-lg p-3 mt-1">
                  <p className="text-white">{selectedTrip.special_instructions}</p>
                </div>
              </div>
            )}

            {selectedTrip.status === 'completed' && (
              <div className="flex space-x-3 mt-6">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Navigation className="w-4 h-4" />
                  <span>View Route</span>
                </button>
                {selectedTrip.customer_phone && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Contact Customer</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TripHistory