"use client"

import { useState, useEffect } from "react"
import { 
  Bell,
  X,
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  DollarSign,
  Calendar,
  CheckCircle,
  Info,
  Car,
  Phone,
  MessageSquare,
  ChevronRight,
  Volume2,
  VolumeX
} from "lucide-react"
import type { Driver, Trip } from "@/lib/supabase"

interface SmartNotificationsProps {
  driver: Driver
  todaysTrips: Trip[]
  onNotificationAction?: (notificationId: string, action: string) => void
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'urgent' | 'achievement'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actions?: { id: string; label: string; style?: 'primary' | 'secondary' }[]
  autoRemove?: number // seconds
  sound?: boolean
}

const SmartNotifications = ({ driver, todaysTrips, onNotificationAction }: SmartNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    generateSmartNotifications()
    
    // Set up periodic checks for new notifications
    const interval = setInterval(generateSmartNotifications, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [todaysTrips, driver])

  useEffect(() => {
    // Auto-remove notifications with autoRemove
    notifications.forEach(notification => {
      if (notification.autoRemove && !notification.isRead) {
        setTimeout(() => {
          removeNotification(notification.id)
        }, notification.autoRemove * 1000)
      }
    })
  }, [notifications])

  const generateSmartNotifications = () => {
    const now = new Date()
    const newNotifications: Notification[] = []

    // Check for upcoming trips (next 30 minutes)
    todaysTrips
      .filter(trip => trip.status === 'confirmed' || trip.status === 'scheduled')
      .forEach(trip => {
        const pickupTime = new Date(trip.pickup_time)
        const timeDiff = pickupTime.getTime() - now.getTime()
        const minutesUntil = Math.floor(timeDiff / (1000 * 60))

        if (minutesUntil > 0 && minutesUntil <= 30) {
          // Check if we already have this notification
          const existingNotification = notifications.find(n => n.id === `upcoming-${trip.id}`)
          if (!existingNotification) {
            newNotifications.push({
              id: `upcoming-${trip.id}`,
              type: minutesUntil <= 10 ? 'urgent' : 'warning',
              title: `Trip in ${minutesUntil} minutes`,
              message: `${trip.customer_name} pickup at ${trip.pickup_location}`,
              timestamp: now,
              isRead: false,
              sound: minutesUntil <= 10,
              actions: [
                { id: 'navigate', label: 'Navigate', style: 'primary' },
                { id: 'call', label: 'Call Customer' }
              ]
            })
          }
        }

        // Check for overdue trips
        if (minutesUntil < -15 && trip.status !== 'in-progress' && trip.status !== 'completed') {
          const existingOverdue = notifications.find(n => n.id === `overdue-${trip.id}`)
          if (!existingOverdue) {
            newNotifications.push({
              id: `overdue-${trip.id}`,
              type: 'urgent',
              title: 'Trip is overdue',
              message: `${trip.customer_name} pickup was ${Math.abs(minutesUntil)} minutes ago`,
              timestamp: now,
              isRead: false,
              sound: true,
              actions: [
                { id: 'call-customer', label: 'Call Customer', style: 'primary' },
                { id: 'call-dispatch', label: 'Call Dispatch' }
              ]
            })
          }
        }
      })

    // Daily earnings milestone
    const todayEarnings = getTodayEarnings()
    if (todayEarnings >= 200 && !notifications.find(n => n.id === 'earnings-200')) {
      newNotifications.push({
        id: 'earnings-200',
        type: 'achievement',
        title: 'Great work today! 🎉',
        message: `You've earned $${todayEarnings} today`,
        timestamp: now,
        isRead: false,
        autoRemove: 10
      })
    }

    // Weekly performance notifications
    const weeklyStats = getWeeklyStats()
    if (weeklyStats.completionRate >= 95 && !notifications.find(n => n.id === 'high-completion')) {
      newNotifications.push({
        id: 'high-completion',
        type: 'achievement',
        title: 'Outstanding performance! ⭐',
        message: `${weeklyStats.completionRate}% completion rate this week`,
        timestamp: now,
        isRead: false,
        autoRemove: 15
      })
    }

    // Weather/traffic alerts (mock data)
    if (isRushHour() && !notifications.find(n => n.id === 'traffic-alert')) {
      newNotifications.push({
        id: 'traffic-alert',
        type: 'info',
        title: 'Rush hour traffic',
        message: 'Heavy traffic expected. Consider alternate routes.',
        timestamp: now,
        isRead: false,
        autoRemove: 30
      })
    }

    // Shift reminders
    if (shouldRemindShiftStart()) {
      newNotifications.push({
        id: 'shift-reminder',
        type: 'info',
        title: 'Shift starting soon',
        message: 'Your shift starts in 30 minutes. Time to get ready!',
        timestamp: now,
        isRead: false,
        actions: [
          { id: 'mark-available', label: 'Mark Available', style: 'primary' }
        ]
      })
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications])
      
      // Play sound for urgent notifications
      if (soundEnabled && newNotifications.some(n => n.sound)) {
        playNotificationSound()
      }
    }
  }

  const getTodayEarnings = () => {
    // Mock calculation - would integrate with actual earnings data
    return todaysTrips
      .filter(trip => trip.status === 'completed')
      .reduce((sum, trip) => sum + (trip.fare_amount || 50), 0)
  }

  const getWeeklyStats = () => {
    // Mock calculation - would fetch from database
    return {
      completionRate: 96,
      totalTrips: 23,
      earnings: 1240
    }
  }

  const isRushHour = () => {
    const hour = new Date().getHours()
    return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  }

  const shouldRemindShiftStart = () => {
    // Mock logic - would check actual shift schedule
    return false
  }

  const playNotificationSound = () => {
    // Simple notification sound
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('beep')
      utterance.volume = 0.3
      utterance.rate = 2
      speechSynthesis.speak(utterance)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    )
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleNotificationAction = (notification: Notification, actionId: string) => {
    if (onNotificationAction) {
      onNotificationAction(notification.id, actionId)
    }

    // Handle common actions
    switch (actionId) {
      case 'navigate':
        // Open navigation
        const trip = todaysTrips.find(t => notification.id.includes(t.id))
        if (trip) {
          const query = encodeURIComponent(trip.pickup_location)
          window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
        }
        break
      case 'call':
      case 'call-customer':
        const customerTrip = todaysTrips.find(t => notification.id.includes(t.id))
        if (customerTrip?.customer_phone) {
          window.open(`tel:${customerTrip.customer_phone}`, '_self')
        }
        break
      case 'call-dispatch':
        window.open('tel:+15551234567', '_self')
        break
      case 'mark-available':
        // Would update driver availability
        break
    }

    markAsRead(notification.id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning': return <Clock className="w-5 h-5 text-yellow-400" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'achievement': return <Star className="w-5 h-5 text-yellow-400" />
      default: return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-l-red-500 bg-red-900/20'
      case 'warning': return 'border-l-yellow-500 bg-yellow-900/20'
      case 'success': return 'border-l-green-500 bg-green-900/20'
      case 'achievement': return 'border-l-yellow-500 bg-yellow-900/20'
      default: return 'border-l-blue-500 bg-blue-900/20'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notifications Panel */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-600 flex items-center justify-between">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-gray-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-600">
                {notifications
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getNotificationStyle(notification.type)} ${
                        !notification.isRead ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-medium text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-gray-300 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-gray-400 text-xs mt-2">
                                {notification.timestamp.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>

                          {notification.actions && (
                            <div className="flex space-x-2 mt-3">
                              {notification.actions.map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleNotificationAction(notification, action.id)}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    action.style === 'primary'
                                      ? 'bg-red-600 text-white hover:bg-red-700'
                                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-600">
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                className="w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SmartNotifications