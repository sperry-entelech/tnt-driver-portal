"use client"

import { useState, useEffect } from "react"
import { 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  X
} from "lucide-react"
import { useVoiceCommands } from "@/hooks/useVoiceCommands"
import type { Driver, Trip } from "@/lib/supabase"

interface VoiceCommandsProps {
  driver: Driver
  todaysTrips: Trip[]
  activeTab: string
  onTabChange: (tab: string) => void
  onTripAction?: (action: string, tripId?: string) => void
  onOpenCommunication?: (trip: Trip) => void
  onAvailabilityChange?: (status: string) => void
}

const VoiceCommands = ({ 
  driver, 
  todaysTrips, 
  activeTab, 
  onTabChange, 
  onTripAction,
  onOpenCommunication,
  onAvailabilityChange
}: VoiceCommandsProps) => {
  const [enabled, setEnabled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null)

  const voiceCommands = useVoiceCommands({
    enabled,
    continuous: true,
    onCommand: handleVoiceCommand,
    onError: (error) => {
      console.error('Voice command error:', error)
      setCommandFeedback(`Error: ${error}`)
      setTimeout(() => setCommandFeedback(null), 3000)
    }
  })

  function handleVoiceCommand(command: string, confidence: number) {
    console.log('Voice command:', command, 'Confidence:', confidence)
    setLastCommand(command)
    
    let feedback = ''
    let executed = false

    switch (command) {
      // Navigation commands
      case 'navigate':
        const nextTrip = todaysTrips.find(t => t.status === 'confirmed' || t.status === 'scheduled')
        if (nextTrip) {
          const query = encodeURIComponent(nextTrip.pickup_location)
          window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
          feedback = `Opening navigation to ${nextTrip.customer_name}'s location`
          executed = true
        } else {
          feedback = 'No upcoming trips to navigate to'
        }
        break

      case 'call':
        const callTrip = todaysTrips.find(t => t.status === 'confirmed' || t.status === 'scheduled')
        if (callTrip?.customer_phone) {
          window.open(`tel:${callTrip.customer_phone}`, '_self')
          feedback = `Calling ${callTrip.customer_name}`
          executed = true
        } else {
          feedback = 'No customer phone number available'
        }
        break

      case 'communicate':
        const commTrip = todaysTrips.find(t => t.status === 'confirmed' || t.status === 'scheduled')
        if (commTrip && onOpenCommunication) {
          onOpenCommunication(commTrip)
          feedback = `Opening communication with ${commTrip.customer_name}`
          executed = true
        } else {
          feedback = 'No active trips for communication'
        }
        break

      case 'start-trip':
        const startTrip = todaysTrips.find(t => t.status === 'confirmed')
        if (startTrip && onTripAction) {
          onTripAction('start-trip', startTrip.id)
          feedback = `Starting trip for ${startTrip.customer_name}`
          executed = true
        } else {
          feedback = 'No confirmed trips to start'
        }
        break

      case 'complete-trip':
        const completeTrip = todaysTrips.find(t => t.status === 'in-progress')
        if (completeTrip && onTripAction) {
          onTripAction('complete-trip', completeTrip.id)
          feedback = `Completing trip for ${completeTrip.customer_name}`
          executed = true
        } else {
          feedback = 'No active trips to complete'
        }
        break

      // Availability commands
      case 'go-available':
        if (onAvailabilityChange) {
          onAvailabilityChange('available')
          feedback = 'Setting status to available'
          executed = true
        }
        break

      case 'go-unavailable':
        if (onAvailabilityChange) {
          onAvailabilityChange('unavailable')
          feedback = 'Setting status to unavailable'
          executed = true
        }
        break

      case 'take-break':
        if (onAvailabilityChange) {
          onAvailabilityChange('on-break')
          feedback = 'Starting break time'
          executed = true
        }
        break

      // Emergency
      case 'emergency':
        if (window.confirm('This will call emergency services. Continue?')) {
          window.open('tel:911', '_self')
          feedback = 'Calling emergency services'
          executed = true
        } else {
          feedback = 'Emergency call cancelled'
        }
        break

      // Navigation between tabs
      case 'dashboard':
        onTabChange('dashboard')
        feedback = 'Switched to dashboard'
        executed = true
        break

      case 'trips':
        onTabChange('trips')
        feedback = 'Switched to trips view'
        executed = true
        break

      case 'schedule':
        onTabChange('schedule')
        feedback = 'Switched to schedule view'
        executed = true
        break

      case 'profile':
        onTabChange('profile')
        feedback = 'Switched to profile view'
        executed = true
        break

      // Information commands
      case 'next-trip':
        const upcomingTrip = todaysTrips.find(t => t.status === 'confirmed' || t.status === 'scheduled')
        if (upcomingTrip) {
          const pickupTime = new Date(upcomingTrip.pickup_time)
          const timeString = pickupTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
          feedback = `Next trip: ${upcomingTrip.customer_name} at ${timeString}`
          
          // Also speak the information
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(feedback)
            utterance.rate = 0.8
            speechSynthesis.speak(utterance)
          }
          executed = true
        } else {
          feedback = 'No upcoming trips scheduled'
        }
        break

      case 'refresh':
        window.location.reload()
        feedback = 'Refreshing portal'
        executed = true
        break

      default:
        feedback = `Command "${command}" not recognized`
    }

    setCommandFeedback(executed ? `✓ ${feedback}` : `⚠ ${feedback}`)
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setCommandFeedback(null)
      setLastCommand(null)
    }, 3000)
  }

  const commandsList = [
    { category: "Trip Actions", commands: [
      "Navigate / Directions - Open navigation to next pickup",
      "Call Customer - Call the next trip's customer",
      "Communicate / Message - Open communication panel",
      "Start Trip - Begin the confirmed trip",
      "Complete Trip - Finish the active trip"
    ]},
    { category: "Availability", commands: [
      "Available / Go Online - Set status to available",
      "Unavailable / Go Offline - Set status to unavailable", 
      "Break / Take Break - Start break time",
      "Emergency / Help - Call emergency services"
    ]},
    { category: "Navigation", commands: [
      "Dashboard / Home - Switch to dashboard",
      "Trips / My Trips - Switch to trips view",
      "Schedule / Calendar - Switch to schedule",
      "Profile / Settings - Switch to profile"
    ]},
    { category: "Information", commands: [
      "Next Trip / Upcoming Trip - Get next trip details",
      "Refresh / Update - Refresh the portal"
    ]}
  ]

  return (
    <div className="relative">
      {/* Voice Command Toggle Button */}
      <button
        onClick={() => {
          setEnabled(!enabled)
          if (!enabled) {
            voiceCommands.startListening()
          } else {
            voiceCommands.stopListening()
          }
        }}
        className={`relative p-2 rounded-lg transition-colors ${
          enabled && voiceCommands.isListening
            ? 'bg-red-600 hover:bg-red-700'
            : enabled 
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title={enabled ? (voiceCommands.isListening ? 'Listening...' : 'Voice commands enabled') : 'Voice commands disabled'}
      >
        {enabled && voiceCommands.isListening ? (
          <Mic className="w-5 h-5 text-white animate-pulse" />
        ) : enabled ? (
          <Mic className="w-5 h-5 text-white" />
        ) : (
          <MicOff className="w-5 h-5 text-gray-300" />
        )}
        
        {/* Listening indicator */}
        {enabled && voiceCommands.isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
        )}
      </button>

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="ml-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
        title="Voice Commands Help"
      >
        <HelpCircle className="w-5 h-5 text-gray-400" />
      </button>

      {/* Command Feedback */}
      {commandFeedback && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white whitespace-nowrap z-50">
          {commandFeedback}
        </div>
      )}

      {/* Voice Recognition Status */}
      {enabled && voiceCommands.transcript && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-blue-900 border border-blue-600 rounded-lg text-sm text-white max-w-xs z-50">
          <div className="text-xs text-blue-300 mb-1">Heard:</div>
          <div className="font-medium">"{voiceCommands.transcript}"</div>
          {voiceCommands.confidence > 0 && (
            <div className="text-xs text-blue-300 mt-1">
              Confidence: {Math.round(voiceCommands.confidence * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Voice Commands Help Panel */}
      {showHelp && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-600 flex items-center justify-between">
            <h3 className="text-white font-semibold">Voice Commands</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-300">
              {voiceCommands.isSupported ? (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span>Voice commands {enabled ? 'enabled' : 'disabled'}</span>
                  </div>
                  <p>Say any of these commands clearly:</p>
                </>
              ) : (
                <p className="text-red-400">Voice commands not supported in this browser</p>
              )}
            </div>

            {voiceCommands.isSupported && commandsList.map((category) => (
              <div key={category.category}>
                <h4 className="text-white font-medium text-sm mb-2">{category.category}</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  {category.commands.map((command, index) => (
                    <li key={index} className="leading-relaxed">
                      • {command}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-600">
              💡 Tip: Speak clearly and wait for the command to complete before giving another one.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceCommands