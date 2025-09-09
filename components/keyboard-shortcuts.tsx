"use client"

import { useState, useMemo } from "react"
import { 
  Keyboard,
  HelpCircle,
  X,
  Navigation,
  Phone,
  MessageSquare,
  PlayCircle,
  CheckCircle,
  Home,
  Car,
  CalendarDays,
  User,
  RotateCcw,
  Bell
} from "lucide-react"
import { useKeyboardShortcuts, formatShortcut } from "@/hooks/useKeyboardShortcuts"
import type { Driver, Trip } from "@/lib/supabase"

interface KeyboardShortcutsProps {
  driver: Driver
  todaysTrips: Trip[]
  activeTab: string
  onTabChange: (tab: string) => void
  onTripAction?: (action: string, tripId?: string) => void
  onOpenCommunication?: (trip: Trip) => void
}

const KeyboardShortcuts = ({ 
  driver, 
  todaysTrips, 
  activeTab, 
  onTabChange, 
  onTripAction,
  onOpenCommunication
}: KeyboardShortcutsProps) => {
  const [showHelp, setShowHelp] = useState(false)
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null)

  const shortcuts = useMemo(() => {
    const nextTrip = todaysTrips.find(t => t.status === 'confirmed' || t.status === 'scheduled')
    const activeTrip = todaysTrips.find(t => t.status === 'in-progress')

    return [
      // Navigation shortcuts
      {
        key: 'h',
        ctrl: false,
        action: () => {
          onTabChange('dashboard')
          showFeedback('Switched to Dashboard')
        },
        description: 'Go to Dashboard (Home)',
        category: 'Navigation',
        icon: <Home className="w-4 h-4" />
      },
      {
        key: 't',
        ctrl: false,
        action: () => {
          onTabChange('trips')
          showFeedback('Switched to My Trips')
        },
        description: 'Go to My Trips',
        category: 'Navigation',
        icon: <Car className="w-4 h-4" />
      },
      {
        key: 's',
        ctrl: false,
        action: () => {
          onTabChange('schedule')
          showFeedback('Switched to Schedule')
        },
        description: 'Go to Schedule',
        category: 'Navigation',
        icon: <CalendarDays className="w-4 h-4" />
      },
      {
        key: 'p',
        ctrl: false,
        action: () => {
          onTabChange('profile')
          showFeedback('Switched to Profile')
        },
        description: 'Go to Profile',
        category: 'Navigation',
        icon: <User className="w-4 h-4" />
      },

      // Trip actions
      {
        key: 'n',
        ctrl: false,
        action: () => {
          if (nextTrip) {
            const query = encodeURIComponent(nextTrip.pickup_location)
            window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
            showFeedback(`Opening navigation to ${nextTrip.customer_name}`)
          } else {
            showFeedback('No upcoming trips to navigate to')
          }
        },
        description: 'Navigate to next trip',
        category: 'Trip Actions',
        icon: <Navigation className="w-4 h-4" />
      },
      {
        key: 'c',
        ctrl: false,
        action: () => {
          if (nextTrip?.customer_phone) {
            window.open(`tel:${nextTrip.customer_phone}`, '_self')
            showFeedback(`Calling ${nextTrip.customer_name}`)
          } else {
            showFeedback('No customer phone number available')
          }
        },
        description: 'Call next trip customer',
        category: 'Trip Actions',
        icon: <Phone className="w-4 h-4" />
      },
      {
        key: 'm',
        ctrl: false,
        action: () => {
          if (nextTrip && onOpenCommunication) {
            onOpenCommunication(nextTrip)
            showFeedback(`Opening communication with ${nextTrip.customer_name}`)
          } else {
            showFeedback('No active trips for communication')
          }
        },
        description: 'Message next trip customer',
        category: 'Trip Actions',
        icon: <MessageSquare className="w-4 h-4" />
      },
      {
        key: 'Enter',
        ctrl: false,
        action: () => {
          if (nextTrip?.status === 'confirmed' && onTripAction) {
            onTripAction('start-trip', nextTrip.id)
            showFeedback(`Starting trip for ${nextTrip.customer_name}`)
          } else if (activeTrip && onTripAction) {
            onTripAction('complete-trip', activeTrip.id)
            showFeedback(`Completing trip for ${activeTrip.customer_name}`)
          } else {
            showFeedback('No trips available to start or complete')
          }
        },
        description: 'Start confirmed trip / Complete active trip',
        category: 'Trip Actions',
        icon: nextTrip?.status === 'confirmed' ? <PlayCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />
      },

      // Quick actions
      {
        key: 'r',
        ctrl: true,
        action: () => {
          window.location.reload()
          showFeedback('Refreshing portal')
        },
        description: 'Refresh portal',
        category: 'Quick Actions',
        icon: <RotateCcw className="w-4 h-4" />
      },
      {
        key: '/',
        ctrl: false,
        action: () => {
          setShowHelp(!showHelp)
          showFeedback(showHelp ? 'Hiding keyboard shortcuts' : 'Showing keyboard shortcuts')
        },
        description: 'Toggle this help panel',
        category: 'Quick Actions',
        icon: <HelpCircle className="w-4 h-4" />
      },
      {
        key: 'Escape',
        ctrl: false,
        action: () => {
          setShowHelp(false)
          showFeedback('Closed help panel')
        },
        description: 'Close help panel',
        category: 'Quick Actions',
        icon: <X className="w-4 h-4" />
      }
    ]
  }, [todaysTrips, activeTab, onTabChange, onTripAction, onOpenCommunication, showHelp])

  useKeyboardShortcuts({
    shortcuts,
    enabled: true
  })

  const showFeedback = (message: string) => {
    setShortcutFeedback(message)
    setTimeout(() => setShortcutFeedback(null), 2000)
  }

  // Group shortcuts by category
  const shortcutsByCategory = useMemo(() => {
    const categories: Record<string, typeof shortcuts> = {}
    shortcuts.forEach(shortcut => {
      const category = shortcut.category || 'Other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(shortcut)
    })
    return categories
  }, [shortcuts])

  return (
    <div className="relative">
      {/* Keyboard Shortcuts Toggle Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        title="Keyboard Shortcuts (Press / to toggle)"
      >
        <Keyboard className="w-5 h-5 text-gray-300" />
      </button>

      {/* Shortcut Feedback */}
      {shortcutFeedback && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-blue-900 border border-blue-600 rounded-lg text-sm text-white whitespace-nowrap z-50">
          ✓ {shortcutFeedback}
        </div>
      )}

      {/* Keyboard Shortcuts Help Panel */}
      {showHelp && (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Keyboard className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Keyboard Shortcuts</h3>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-300">
              Use these keyboard shortcuts for faster navigation:
            </div>

            {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h4 className="text-white font-medium text-sm mb-3 flex items-center space-x-2">
                  <span>{category}</span>
                </h4>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-gray-400">
                          {shortcut.icon}
                        </div>
                        <span className="text-gray-300 text-sm">
                          {shortcut.description}
                        </span>
                      </div>
                      <div className="bg-gray-700 px-2 py-1 rounded text-xs text-white font-mono">
                        {formatShortcut(shortcut)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-600">
              💡 Tip: Shortcuts don't work when typing in text fields. Press Escape to close this panel.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeyboardShortcuts