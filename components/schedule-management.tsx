"use client"

import { useState, useEffect } from "react"
import { 
  Calendar,
  Clock,
  Plus,
  Edit3,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Moon,
  Sun,
  CalendarDays,
  CalendarX
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Driver } from "@/lib/supabase"

interface ScheduleManagementProps {
  driver: Driver
}

interface DriverShift {
  id: string
  driver_id: string
  shift_date: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'active' | 'completed' | 'absent'
  created_at: string
  updated_at: string
}

interface TimeOffRequest {
  id: string
  driver_id: string
  start_date: string
  end_date: string
  reason: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
}

const ScheduleManagement = ({ driver }: ScheduleManagementProps) => {
  const [shifts, setShifts] = useState<DriverShift[]>([])
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [showTimeOffModal, setShowTimeOffModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState<DriverShift | null>(null)
  
  // Time off form state
  const [timeOffForm, setTimeOffForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  })

  // Edit shift form state
  const [editShiftForm, setEditShiftForm] = useState({
    startTime: '',
    endTime: '',
    date: ''
  })

  useEffect(() => {
    fetchScheduleData()
  }, [currentWeek, driver.id])

  const fetchScheduleData = async () => {
    setIsLoading(true)
    
    // Get start and end of current week
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    try {
      // Fetch shifts for current week
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('driver_shifts')
        .select('*')
        .eq('driver_id', driver.id)
        .gte('shift_date', startOfWeek.toISOString().split('T')[0])
        .lte('shift_date', endOfWeek.toISOString().split('T')[0])
        .order('shift_date', { ascending: true })

      if (shiftsError) throw shiftsError
      setShifts(shiftsData || [])

      // Fetch time off requests
      const { data: timeOffData, error: timeOffError } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!timeOffError) {
        setTimeOffRequests(timeOffData || [])
      }

    } catch (error) {
      console.error('Error fetching schedule data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getShiftForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return shifts.find(shift => shift.shift_date === dateStr)
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600'
      case 'active': return 'bg-green-600'
      case 'completed': return 'bg-gray-600'
      case 'absent': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getShiftIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'active': return <Sun className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'absent': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const submitTimeOffRequest = async () => {
    if (!timeOffForm.startDate || !timeOffForm.endDate || !timeOffForm.reason.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('time_off_requests')
        .insert({
          driver_id: driver.id,
          start_date: timeOffForm.startDate,
          end_date: timeOffForm.endDate,
          reason: timeOffForm.reason,
          status: 'pending'
        })

      if (error) throw error

      setTimeOffForm({ startDate: '', endDate: '', reason: '' })
      setShowTimeOffModal(false)
      fetchScheduleData()
    } catch (error) {
      console.error('Error submitting time off request:', error)
      alert('Failed to submit time off request')
    }
  }

  const editShift = async () => {
    if (!selectedShift || !editShiftForm.startTime || !editShiftForm.endTime) {
      return
    }

    try {
      const { error } = await supabase
        .from('driver_shifts')
        .update({
          start_time: editShiftForm.startTime,
          end_time: editShiftForm.endTime
        })
        .eq('id', selectedShift.id)

      if (error) throw error

      setShowEditModal(false)
      setSelectedShift(null)
      fetchScheduleData()
    } catch (error) {
      console.error('Error updating shift:', error)
      alert('Failed to update shift')
    }
  }

  const openEditModal = (shift: DriverShift) => {
    setSelectedShift(shift)
    setEditShiftForm({
      startTime: shift.start_time,
      endTime: shift.end_time,
      date: shift.shift_date
    })
    setShowEditModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-white">Loading schedule...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-white text-3xl font-bold mb-2">Weekly Schedule</h2>
          <p className="text-gray-300">Manage your availability and request time off</p>
        </div>
        <button
          onClick={() => setShowTimeOffModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Request Time Off</span>
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold">
              Week of {getWeekDays()[0].toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })} - {getWeekDays()[6].toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </h3>
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
        {getWeekDays().map((day, index) => {
          const shift = getShiftForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()
          const isPast = day < new Date() && !isToday

          return (
            <div
              key={index}
              className={`bg-gray-800 rounded-xl p-4 min-h-[120px] ${
                isToday ? 'ring-2 ring-red-500' : ''
              } ${isPast ? 'opacity-60' : ''}`}
            >
              <div className="text-center mb-3">
                <div className={`text-sm font-medium ${
                  isToday ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${
                  isToday ? 'text-white' : 'text-gray-200'
                }`}>
                  {day.getDate()}
                </div>
              </div>

              {shift ? (
                <div 
                  className={`${getShiftStatusColor(shift.status)} rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => openEditModal(shift)}
                >
                  <div className="flex items-center space-x-1 text-white text-xs mb-1">
                    {getShiftIcon(shift.status)}
                    <span className="capitalize">{shift.status}</span>
                  </div>
                  <div className="text-white text-sm">
                    <div>{formatTime(shift.start_time)}</div>
                    <div>{formatTime(shift.end_time)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-2">
                  Day Off
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Time Off Requests */}
      {timeOffRequests.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-white text-xl font-bold mb-4 flex items-center space-x-2">
            <CalendarX className="w-5 h-5" />
            <span>Recent Time Off Requests</span>
          </h3>
          <div className="space-y-3">
            {timeOffRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </div>
                  <div className="text-gray-300 text-sm">{request.reason}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'approved' ? 'bg-green-600 text-white' :
                  request.status === 'denied' ? 'bg-red-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Off Request Modal */}
      {showTimeOffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-bold mb-4">Request Time Off</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={timeOffForm.startDate}
                  onChange={(e) => setTimeOffForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={timeOffForm.endDate}
                  onChange={(e) => setTimeOffForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Reason
                </label>
                <textarea
                  value={timeOffForm.reason}
                  onChange={(e) => setTimeOffForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Vacation, family time, medical, etc."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTimeOffModal(false)}
                className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitTimeOffRequest}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {showEditModal && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-bold mb-4">Edit Shift</h3>
            <p className="text-gray-300 mb-4">
              {new Date(editShiftForm.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editShiftForm.startTime}
                  onChange={(e) => setEditShiftForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={editShiftForm.endTime}
                  onChange={(e) => setEditShiftForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editShift}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScheduleManagement