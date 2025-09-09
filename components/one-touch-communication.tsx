"use client"

import { useState, useEffect } from "react"
import { 
  Phone,
  MessageSquare,
  Navigation,
  MapPin,
  Clock,
  User,
  Volume2,
  Share2,
  Send,
  CheckCircle,
  AlertTriangle,
  Timer,
  Car,
  X
} from "lucide-react"
import type { Trip } from "@/lib/supabase"

interface OneTouchCommunicationProps {
  trip: Trip
  isVisible: boolean
  onClose: () => void
  onSendMessage?: (message: string) => Promise<void>
  onCall?: () => void
  onNavigate?: () => void
}

const OneTouchCommunication = ({ 
  trip, 
  isVisible, 
  onClose, 
  onSendMessage, 
  onCall, 
  onNavigate 
}: OneTouchCommunicationProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [lastSent, setLastSent] = useState<string | null>(null)

  const communicationTemplates = [
    {
      id: 'on_way',
      title: "I'm On My Way",
      message: `Hi ${trip.customer_name.split(' ')[0]}, this is your TNT driver. I'm on my way to pick you up! ETA: 10 minutes. Look for the black TNT limousine.`,
      icon: <Car className="w-5 h-5" />,
      urgency: 'normal',
      auto_eta: true
    },
    {
      id: 'arrived',
      title: "I've Arrived",
      message: `I've arrived at ${trip.pickup_location}. I'm in the black TNT limousine, license plate [PLATE]. Please come out when you're ready!`,
      icon: <MapPin className="w-5 h-5" />,
      urgency: 'normal'
    },
    {
      id: 'delay_light',
      title: "Light Traffic Delay",
      message: `Hi ${trip.customer_name.split(' ')[0]}, I'm running about 5-7 minutes late due to unexpected traffic. Thank you for your patience!`,
      icon: <Clock className="w-5 h-5" />,
      urgency: 'warning'
    },
    {
      id: 'delay_heavy',
      title: "Significant Delay", 
      message: `I'm experiencing heavier than expected traffic and will be approximately 15-20 minutes late. Would you like to reschedule or wait? Very sorry for the inconvenience.`,
      icon: <AlertTriangle className="w-5 h-5" />,
      urgency: 'urgent'
    },
    {
      id: 'waiting',
      title: "Patient Waiting",
      message: `I'm here and waiting for you at the pickup location. No rush - take your time! I'll be in the TNT limousine.`,
      icon: <Timer className="w-5 h-5" />,
      urgency: 'normal'
    },
    {
      id: 'location_clarify',
      title: "Location Clarification",
      message: `I'm having trouble locating the exact pickup spot at ${trip.pickup_location}. Could you help me with more specific directions or meet me at the main entrance?`,
      icon: <Navigation className="w-5 h-5" />,
      urgency: 'warning'
    }
  ]

  const quickActions = [
    {
      id: 'call',
      title: 'Call Customer',
      icon: <Phone className="w-6 h-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => onCall && onCall()
    },
    {
      id: 'navigate',
      title: 'Get Directions', 
      icon: <Navigation className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => onNavigate && onNavigate()
    },
    {
      id: 'share_location',
      title: 'Share My Location',
      icon: <Share2 className="w-6 h-6" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: shareDriverLocation
    },
    {
      id: 'voice_announce',
      title: 'Voice Announce',
      icon: <Volume2 className="w-6 h-6" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: announceTrip
    }
  ]

  function shareDriverLocation() {
    if (navigator.geolocation && navigator.share) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`
        
        try {
          await navigator.share({
            title: 'TNT Driver Location',
            text: `I'm your TNT driver and I'm nearby! Here's my current location:`,
            url: locationUrl
          })
        } catch (error) {
          // Fallback to copying to clipboard
          navigator.clipboard.writeText(locationUrl)
          alert('Location copied to clipboard!')
        }
      })
    }
  }

  function announceTrip() {
    if ('speechSynthesis' in window) {
      const announcement = `Next pickup: ${trip.customer_name} at ${trip.pickup_location} in ${getTimeUntilPickup()}`
      const utterance = new SpeechSynthesisUtterance(announcement)
      utterance.rate = 0.8
      utterance.volume = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  function getTimeUntilPickup() {
    const now = new Date()
    const pickupTime = new Date(trip.pickup_time)
    const diffMs = pickupTime.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins <= 0) return "now"
    if (diffMins < 60) return `${diffMins} minutes`
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minutes`
  }

  async function sendMessage(template: any) {
    if (!onSendMessage) return
    
    setIsSending(true)
    let message = template.message
    
    // Auto-replace dynamic content
    if (template.auto_eta) {
      const eta = calculateETA()
      message = message.replace('ETA: 10 minutes', `ETA: ${eta}`)
    }
    
    try {
      await onSendMessage(message)
      setLastSent(template.title)
      setSelectedTemplate(null)
      
      // Auto-close after successful send
      setTimeout(() => {
        setLastSent(null)
      }, 3000)
      
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  async function sendCustomMessage() {
    if (!customMessage.trim() || !onSendMessage) return
    
    setIsSending(true)
    try {
      await onSendMessage(customMessage)
      setCustomMessage("")
      setLastSent("Custom message")
      setTimeout(() => setLastSent(null), 3000)
    } catch (error) {
      console.error('Failed to send custom message:', error)
    } finally {
      setIsSending(false)
    }
  }

  function calculateETA() {
    // Mock ETA calculation - would integrate with actual GPS/traffic data
    const baseTime = Math.floor(Math.random() * 15) + 5 // 5-20 minutes
    return `${baseTime} minutes`
  }

  function getUrgencyColor(urgency: string) {
    switch (urgency) {
      case 'urgent': return 'border-l-red-500 bg-red-900/20'
      case 'warning': return 'border-l-yellow-500 bg-yellow-900/20'  
      default: return 'border-l-blue-500 bg-blue-900/20'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">Quick Communication</h2>
              <div className="flex items-center space-x-2 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{trip.customer_name}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{trip.customer_phone}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {lastSent && (
          <div className="p-4 m-4 bg-green-900/50 border border-green-600 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-200">"{lastSent}" sent successfully!</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-6 border-b border-gray-600">
          <h3 className="text-white font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`flex flex-col items-center p-4 rounded-lg text-white transition-colors ${action.color}`}
              >
                {action.icon}
                <span className="text-sm mt-2">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Templates */}
        <div className="p-6">
          <h3 className="text-white font-medium mb-4">Message Templates</h3>
          <div className="space-y-3 mb-6">
            {communicationTemplates.map((template) => (
              <div
                key={template.id}
                className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                  selectedTemplate === template.id ? 'bg-gray-700' : 'bg-gray-800'
                } ${getUrgencyColor(template.urgency)}`}
                onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-400">{template.icon}</div>
                    <h4 className="text-white font-medium">{template.title}</h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      sendMessage(template)
                    }}
                    disabled={isSending}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {template.message}
                </p>
              </div>
            ))}
          </div>

          {/* Custom Message */}
          <div className="border border-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Custom Message</h4>
            <div className="flex space-x-2">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type a custom message..."
                rows={3}
                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <button
                onClick={sendCustomMessage}
                disabled={!customMessage.trim() || isSending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-700 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Pickup: {new Date(trip.pickup_time).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })}</span>
            <span>Trip ID: {trip.id.slice(-8)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OneTouchCommunication