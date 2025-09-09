"use client"

import { useState, useEffect } from "react"
import { 
  ToggleLeft,
  ToggleRight,
  Circle,
  CheckCircle,
  Clock,
  Coffee,
  AlertCircle,
  Zap
} from "lucide-react"
import type { Driver } from "@/lib/supabase"

interface AvailabilityToggleProps {
  driver: Driver
  compact?: boolean
  showStatus?: boolean
  onStatusChange?: (status: string) => void
  className?: string
}

type AvailabilityStatus = 'available' | 'unavailable' | 'on-break' | 'off-duty'

const AvailabilityToggle = ({ 
  driver, 
  compact = false, 
  showStatus = true,
  onStatusChange,
  className = ""
}: AvailabilityToggleProps) => {
  const [currentStatus, setCurrentStatus] = useState<AvailabilityStatus>('available')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const statusOptions = [
    {
      id: 'available' as AvailabilityStatus,
      label: 'Available',
      color: 'bg-green-600',
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Ready for new trips'
    },
    {
      id: 'unavailable' as AvailabilityStatus,
      label: 'Unavailable',
      color: 'bg-red-600',
      icon: <AlertCircle className="w-4 h-4" />,
      description: 'Not accepting trips'
    },
    {
      id: 'on-break' as AvailabilityStatus,
      label: 'On Break',
      color: 'bg-yellow-600',
      icon: <Coffee className="w-4 h-4" />,
      description: 'Taking a break'
    },
    {
      id: 'off-duty' as AvailabilityStatus,
      label: 'Off Duty',
      color: 'bg-gray-600',
      icon: <Circle className="w-4 h-4" />,
      description: 'End of shift'
    }
  ]

  const currentStatusOption = statusOptions.find(option => option.id === currentStatus)

  useEffect(() => {
    // Initialize with driver's current status
    if (driver.available_status) {
      setCurrentStatus(driver.available_status as AvailabilityStatus)
    }
  }, [driver.available_status])

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    if (newStatus === currentStatus) return

    setIsChanging(true)
    try {
      // Update local state immediately for responsive UI
      setCurrentStatus(newStatus)
      setShowStatusMenu(false)

      // Call parent callback if provided
      if (onStatusChange) {
        await onStatusChange(newStatus)
      }

      // Here you would normally update the database
      console.log(`Updating driver ${driver.id} status to: ${newStatus}`)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Failed to update availability status:', error)
      // Revert on error
      setCurrentStatus(currentStatus)
    } finally {
      setIsChanging(false)
    }
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          disabled={isChanging}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            currentStatusOption?.color || 'bg-gray-600'
          } ${
            isChanging ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          {isChanging ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            currentStatusOption?.icon
          )}
          {showStatus && (
            <span className="text-white text-sm font-medium">
              {currentStatusOption?.label}
            </span>
          )}
        </button>

        {showStatusMenu && (
          <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-48">
            <div className="p-2">
              <div className="text-gray-300 text-xs mb-2 px-2">Change Status:</div>
              {statusOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleStatusChange(option.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    currentStatus === option.id
                      ? `${option.color} text-white`
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {option.icon}
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </div>
                  {currentStatus === option.id && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full version with toggle
  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-3">
        {/* Main availability toggle */}
        <button
          onClick={() => handleStatusChange(currentStatus === 'available' ? 'unavailable' : 'available')}
          disabled={isChanging}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            currentStatus === 'available'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } ${
            isChanging ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isChanging ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : currentStatus === 'available' ? (
            <ToggleRight className="w-5 h-5 text-white" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-medium">
            {currentStatus === 'available' ? 'Available' : 'Unavailable'}
          </span>
        </button>

        {/* Status options menu */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="More status options"
          >
            <Clock className="w-5 h-5 text-gray-400" />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-48">
              <div className="p-2">
                <div className="text-gray-300 text-xs mb-2 px-2">Quick Status:</div>
                {statusOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStatusChange(option.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      currentStatus === option.id
                        ? `${option.color} text-white`
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {option.icon}
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                    {currentStatus === option.id && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current status display */}
      {showStatus && currentStatusOption && (
        <div className="mt-2 text-sm text-gray-400 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${currentStatusOption.color}`}></div>
          <span>Status: {currentStatusOption.label}</span>
          <span>•</span>
          <span>{currentStatusOption.description}</span>
        </div>
      )}
    </div>
  )
}

export default AvailabilityToggle