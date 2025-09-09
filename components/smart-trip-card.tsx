"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Car,
  User,
  Timer,
  Share2,
  Volume2,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Trip } from "@/lib/supabase"
import { useSwipe } from "@/hooks/useSwipe"

interface SmartTripCardProps {
  trip: Trip
  onStatusUpdate?: (tripId: string, newStatus: string) => void
  onSendMessage?: (tripId: string, message: string) => void
  onOpenCommunication?: (trip: Trip) => void
  driverAvailability?: string
}

const SmartTripCard = ({ trip, onStatusUpdate, onSendMessage, onOpenCommunication, driverAvailability }: SmartTripCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showMessageTemplates, setShowMessageTemplates] = useState(false)
  const [swipeAction, setSwipeAction] = useState<string | null>(null)

  // Swipe gestures for mobile interactions
  const swipeHandlers = useSwipe({
    threshold: 80,
    onSwipeRight: () => {
      // Swipe right to start trip or call customer
      if (trip.status === 'confirmed') {
        setSwipeAction('start-trip')
        setTimeout(() => updateTripStatus('in-progress'), 300)
      } else {
        setSwipeAction('call')
        setTimeout(() => callCustomer(), 300)
      }
    },
    onSwipeLeft: () => {
      // Swipe left to navigate or complete trip
      if (trip.status === 'in-progress') {
        setSwipeAction('complete-trip')
        setTimeout(() => updateTripStatus('completed'), 300)
      } else {
        setSwipeAction('navigate')
        setTimeout(() => openMaps(), 300)
      }
    },
    onSwipeUp: () => {
      // Swipe up to expand details
      setSwipeAction('expand')
      setTimeout(() => setExpanded(true), 200)
    },
    onSwipeDown: () => {
      // Swipe down to open communication
      if (onOpenCommunication) {
        setSwipeAction('communicate')
        setTimeout(() => onOpenCommunication(trip), 200)
      }
    }
  })

  // Reset swipe action after animation
  useEffect(() => {
    if (swipeAction) {
      const timer = setTimeout(() => setSwipeAction(null), 1000)
      return () => clearTimeout(timer)
    }
  }, [swipeAction])
  
  const messageTemplates = [
    { 
      id: 'enroute', 
      text: "I'm on my way to pick you up! ETA: 10 minutes.",
      icon: <Car className="w-4 h-4" />
    },
    { 
      id: 'arrived', 
      text: "I've arrived at the pickup location. Look for the black TNT limousine.",
      icon: <MapPin className="w-4 h-4" />
    },
    { 
      id: 'delay', 
      text: "Running about 5-10 minutes late due to traffic. Thank you for your patience!",
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      id: 'waiting', 
      text: "I'm here and waiting for you. Take your time!",
      icon: <Timer className="w-4 h-4" />
    }
  ]

  const getTimeUntilPickup = () => {
    const now = new Date()
    const pickupTime = new Date(trip.pickup_time)
    const diffMs = pickupTime.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 0) return "Trip time has passed"
    if (diffMins < 60) return `${diffMins} minutes`
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const getUrgencyLevel = () => {
    const now = new Date()
    const pickupTime = new Date(trip.pickup_time)
    const diffMins = Math.floor((pickupTime.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffMins <= 30 && diffMins > 0) return 'urgent'
    if (diffMins <= 60 && diffMins > 30) return 'soon'
    return 'later'
  }

  const getCardStyle = () => {
    const urgency = getUrgencyLevel()
    switch (urgency) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-900/20'
      case 'soon': return 'border-l-4 border-yellow-500 bg-yellow-900/20'
      default: return 'border-l-4 border-blue-500 bg-gray-800'
    }
  }

  const updateTripStatus = async (newStatus: string) => {
    if (!onStatusUpdate) return
    
    setIsUpdating(true)
    try {
      await onStatusUpdate(trip.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const sendMessage = async (template: { id: string; text: string }) => {
    if (!onSendMessage) return
    
    await onSendMessage(trip.id, template.text)
    setShowMessageTemplates(false)
    
    // Show success feedback
    // You could add a toast notification here
  }

  const openMaps = () => {
    const query = encodeURIComponent(trip.pickup_location)
    const mapsUrl = `https://maps.google.com/maps?q=${query}`
    window.open(mapsUrl, '_blank')
  }

  const callCustomer = () => {
    if (trip.customer_phone) {
      window.open(`tel:${trip.customer_phone}`, '_self')
    }
  }

  const shareLocation = async () => {
    if (navigator.share && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await navigator.share({
            title: 'TNT Driver Location',
            text: 'Your TNT driver is on the way!',
            url: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
          })
        } catch (error) {
          console.log('Error sharing location:', error)
        }
      })
    }
  }

  const speakAddress = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Next pickup: ${trip.customer_name} at ${trip.pickup_location}`
      )
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div 
      className={`rounded-xl p-4 mb-4 transition-all duration-300 select-none relative overflow-hidden ${
        getCardStyle()
      } ${
        swipeAction ? 'transform scale-95' : ''
      }`}
      {...swipeHandlers}
    >
      {/* Swipe Action Indicator */}
      {swipeAction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-10">
          <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">
            {swipeAction === 'start-trip' && '➡️ Starting Trip...'}
            {swipeAction === 'complete-trip' && '⬅️ Completing Trip...'}
            {swipeAction === 'call' && '➡️ Calling Customer...'}
            {swipeAction === 'navigate' && '⬅️ Opening Maps...'}
            {swipeAction === 'expand' && '⬆️ Showing Details...'}
            {swipeAction === 'communicate' && '⬇️ Opening Communication...'}
          </div>
        </div>
      )}
      {/* Main Trip Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-white font-bold text-lg">{trip.customer_name}</h4>
            {getUrgencyLevel() === 'urgent' && (
              <div className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>Soon</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-gray-300 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>
              {new Date(trip.pickup_time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
            <span className="text-sm">({getTimeUntilPickup()})</span>
          </div>

          <div className="flex items-start space-x-2 text-gray-300">
            <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm leading-tight">{trip.pickup_location}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Swipe Instructions for Mobile */}
      {!expanded && (
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2 sm:hidden">
          <div className="flex items-center space-x-1">
            <span>👆 Swipe for actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>➡️ {trip.status === 'confirmed' ? 'Start' : 'Call'}</span>
            <span>⬅️ {trip.status === 'in-progress' ? 'Complete' : 'Navigate'}</span>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <button
          onClick={openMaps}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm">Navigate</span>
        </button>

        <button
          onClick={callCustomer}
          disabled={!trip.customer_phone}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Phone className="w-4 h-4" />
          <span className="text-sm">Call</span>
        </button>

        <button
          onClick={() => {
            if (onOpenCommunication) {
              onOpenCommunication(trip)
            } else {
              setShowMessageTemplates(!showMessageTemplates)
            }
          }}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{onOpenCommunication ? 'Communicate' : 'Message'}</span>
        </button>

        <button
          onClick={speakAddress}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-sm">Speak</span>
        </button>
      </div>

      {/* Message Templates */}
      {showMessageTemplates && (
        <div className="mb-3 p-3 bg-gray-700 rounded-lg">
          <h5 className="text-white font-medium mb-2">Quick Messages:</h5>
          <div className="space-y-2">
            {messageTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => sendMessage(template)}
                className="flex items-start space-x-2 w-full p-2 text-left hover:bg-gray-600 rounded-lg transition-colors"
              >
                <div className="text-gray-400 mt-0.5">{template.icon}</div>
                <span className="text-gray-200 text-sm">{template.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Buttons */}
      {trip.status === 'confirmed' && (
        <div className="flex space-x-2">
          <button
            onClick={() => updateTripStatus('in-progress')}
            disabled={isUpdating}
            className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            <span>Start Trip</span>
          </button>
        </div>
      )}

      {trip.status === 'in-progress' && (
        <div className="flex space-x-2">
          <button
            onClick={() => updateTripStatus('completed')}
            disabled={isUpdating}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Complete Trip</span>
          </button>

          <button
            onClick={shareLocation}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Location</span>
          </button>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Customer Phone</div>
              <div className="text-white">{trip.customer_phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Trip Type</div>
              <div className="text-white capitalize">{trip.trip_type}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-gray-400 mb-1">Dropoff Location</div>
              <div className="text-white">{trip.dropoff_location || 'To be determined'}</div>
            </div>
            {trip.special_instructions && (
              <div className="sm:col-span-2">
                <div className="text-gray-400 mb-1">Special Instructions</div>
                <div className="text-white bg-gray-700 p-2 rounded">
                  {trip.special_instructions}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartTripCard