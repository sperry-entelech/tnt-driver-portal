"use client"

import { useState, useEffect } from "react"
import { 
  Clock,
  Coffee,
  AlertTriangle,
  Navigation,
  Phone,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Zap,
  Shield,
  HelpCircle,
  Wifi,
  WifiOff
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Driver } from "@/lib/supabase"

interface QuickActionsToolbarProps {
  driver: Driver
  onEmergency?: () => void
  onDispatchCall?: () => void
}

const QuickActionsToolbar = ({ driver, onEmergency, onDispatchCall }: QuickActionsToolbarProps) => {
  const [isAvailable, setIsAvailable] = useState(true)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('online')
  const [showQuickBreakOptions, setShowQuickBreakOptions] = useState(false)
  
  const breakOptions = [
    { id: 'lunch', label: '🍽️ Lunch Break', duration: 30 },
    { id: 'fuel', label: '⛽ Fuel Stop', duration: 15 },
    { id: 'rest', label: '☕ Rest Break', duration: 10 },
    { id: 'personal', label: '🚻 Personal', duration: 5 }
  ]

  useEffect(() => {
    // Check network status
    const updateOnlineStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline')
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const toggleAvailability = async () => {
    const newStatus = !isAvailable
    setIsAvailable(newStatus)
    
    try {
      // Update driver availability in database
      await supabase
        .from('drivers')
        .update({ 
          available_status: newStatus ? 'available' : 'unavailable',
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id)
        
      // You could add a toast notification here
    } catch (error) {
      console.error('Error updating availability:', error)
      // Revert on error
      setIsAvailable(!newStatus)
    }
  }

  const startBreak = async (breakType: { id: string; label: string; duration: number }) => {
    setIsOnBreak(true)
    setShowQuickBreakOptions(false)
    
    try {
      // Log break start in database
      await supabase
        .from('driver_breaks')
        .insert({
          driver_id: driver.id,
          break_type: breakType.id,
          start_time: new Date().toISOString(),
          estimated_duration: breakType.duration
        })
        
      // Auto-end break after duration (optional)
      setTimeout(() => {
        endBreak()
      }, breakType.duration * 60 * 1000)
        
    } catch (error) {
      console.error('Error starting break:', error)
      setIsOnBreak(false)
    }
  }

  const endBreak = async () => {
    setIsOnBreak(false)
    
    try {
      // Update most recent break record
      await supabase
        .from('driver_breaks')
        .update({ 
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('driver_id', driver.id)
        .is('end_time', null)
        .order('created_at', { ascending: false })
        .limit(1)
        
    } catch (error) {
      console.error('Error ending break:', error)
    }
  }

  const callDispatch = () => {
    if (onDispatchCall) {
      onDispatchCall()
    } else {
      // Default dispatch number
      window.open('tel:+15551234567', '_self')
    }
  }

  const triggerEmergency = () => {
    if (onEmergency) {
      onEmergency()
    } else {
      // Default emergency action
      if (window.confirm('Call 911 for emergency assistance?')) {
        window.open('tel:911', '_self')
      }
    }
  }

  const openGPS = () => {
    // Open preferred GPS app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const gpsUrl = isIOS 
      ? 'maps://app' 
      : 'https://maps.google.com'
    
    window.open(gpsUrl, '_blank')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-40 sm:relative sm:bg-gray-800 sm:rounded-xl sm:border sm:mb-6">
      {/* Connection Status Indicator */}
      <div className="flex items-center justify-between mb-3 sm:hidden">
        <div className="flex items-center space-x-2">
          {connectionStatus === 'online' ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-400">
            {isOnBreak ? 'On Break' : isAvailable ? 'Available' : 'Off Duty'}
          </span>
        </div>
      </div>

      {/* Primary Action Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {/* Availability Toggle */}
        <button
          onClick={toggleAvailability}
          disabled={isOnBreak}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
            isAvailable && !isOnBreak
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300'
          } disabled:opacity-50`}
        >
          {isAvailable && !isOnBreak ? (
            <ToggleRight className="w-5 h-5 mb-1" />
          ) : (
            <ToggleLeft className="w-5 h-5 mb-1" />
          )}
          <span className="text-xs font-medium">
            {isOnBreak ? 'Break' : isAvailable ? 'Available' : 'Off Duty'}
          </span>
        </button>

        {/* Break Toggle */}
        <button
          onClick={() => {
            if (isOnBreak) {
              endBreak()
            } else {
              setShowQuickBreakOptions(!showQuickBreakOptions)
            }
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
            isOnBreak 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Coffee className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">
            {isOnBreak ? 'End Break' : 'Break'}
          </span>
        </button>

        {/* GPS/Navigation */}
        <button
          onClick={openGPS}
          className="flex flex-col items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Navigation className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">GPS</span>
        </button>

        {/* Call Dispatch */}
        <button
          onClick={callDispatch}
          className="flex flex-col items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Dispatch</span>
        </button>

        {/* Emergency */}
        <button
          onClick={triggerEmergency}
          className="flex flex-col items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Shield className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Emergency</span>
        </button>

        {/* Help */}
        <button
          onClick={() => {/* Open help modal */}}
          className="flex flex-col items-center justify-center p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Help</span>
        </button>

        {/* Quick Stats (hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-3 bg-gray-800 rounded-lg">
          <Clock className="w-5 h-5 mb-1 text-blue-400" />
          <span className="text-xs font-medium text-gray-300">8h 23m</span>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center p-3 bg-gray-800 rounded-lg">
          <Zap className="w-5 h-5 mb-1 text-green-400" />
          <span className="text-xs font-medium text-gray-300">$247</span>
        </div>
      </div>

      {/* Break Options Dropdown */}
      {showQuickBreakOptions && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-lg border border-gray-600 shadow-xl">
          <div className="p-3">
            <h4 className="text-white font-medium mb-2">Quick Break</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {breakOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => startBreak(option)}
                  className="flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <span className="text-white text-sm">{option.label}</span>
                  <span className="text-gray-400 text-xs">{option.duration}min</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {isOnBreak && (
        <div className="mt-3 p-2 bg-yellow-900/50 border border-yellow-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-200 text-sm">
              You're currently on break. New trips are paused.
            </span>
          </div>
        </div>
      )}

      {!isAvailable && !isOnBreak && (
        <div className="mt-3 p-2 bg-gray-700 border border-gray-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">
              You're currently off duty. Toggle availability to receive trips.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickActionsToolbar