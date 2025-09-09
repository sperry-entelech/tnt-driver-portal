"use client"

import { useState, useEffect } from "react"
import { 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Camera,
  ChevronRight,
  ChevronLeft,
  Star,
  AlertCircle,
  BookOpen,
  Car,
  Settings,
  Play
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Driver } from "@/lib/supabase"

interface OnboardingProps {
  driver: Driver
  onComplete: () => void
  onSkip: () => void
}

const OnboardingFlow = ({ driver, onComplete, onSkip }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false])
  const [isLoading, setIsLoading] = useState(false)
  
  // Profile completion state
  const [profileData, setProfileData] = useState({
    phone: driver.phone || '',
    emergencyContact: '',
    emergencyPhone: '',
    profilePhotoUrl: driver.photo_url || ''
  })
  
  // Availability state
  const [availability, setAvailability] = useState({
    monday: { available: true, start: '08:00', end: '18:00' },
    tuesday: { available: true, start: '08:00', end: '18:00' },
    wednesday: { available: true, start: '08:00', end: '18:00' },
    thursday: { available: true, start: '08:00', end: '18:00' },
    friday: { available: true, start: '08:00', end: '18:00' },
    saturday: { available: false, start: '08:00', end: '18:00' },
    sunday: { available: false, start: '08:00', end: '18:00' }
  })
  
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to TNT!',
      description: 'Let\'s get you set up for success'
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add important details and contact information'
    },
    {
      id: 'availability', 
      title: 'Set Your Availability',
      description: 'Tell us when you prefer to work'
    },
    {
      id: 'tutorial',
      title: 'Learn the Portal',
      description: 'Quick tour of key features'
    }
  ]

  const updateProfileStep = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          phone: profileData.phone,
          photo_url: profileData.profilePhotoUrl,
          // We could add emergency contact fields to the schema later
        })
        .eq('id', driver.id)

      if (error) throw error
      
      const newCompleted = [...completedSteps]
      newCompleted[1] = true
      setCompletedSteps(newCompleted)
    } catch (error) {
      console.error('Profile update failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveAvailability = async () => {
    setIsLoading(true)
    try {
      // Create driver shifts for the next 4 weeks based on availability
      const shifts = []
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of week
      
      for (let week = 0; week < 4; week++) {
        Object.entries(availability).forEach(([day, schedule], dayIndex) => {
          if (schedule.available) {
            const shiftDate = new Date(startDate)
            shiftDate.setDate(startDate.getDate() + (week * 7) + dayIndex)
            
            shifts.push({
              driver_id: driver.id,
              shift_date: shiftDate.toISOString().split('T')[0],
              start_time: schedule.start,
              end_time: schedule.end,
              status: 'scheduled'
            })
          }
        })
      }

      const { error } = await supabase
        .from('driver_shifts')
        .insert(shifts)

      if (error) throw error
      
      const newCompleted = [...completedSteps]
      newCompleted[2] = true
      setCompletedSteps(newCompleted)
    } catch (error) {
      console.error('Availability save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      // Mark onboarding as complete in driver record
      await supabase
        .from('drivers')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', driver.id)
      
      onComplete()
    } catch (error) {
      console.error('Onboarding completion failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to TNT Limousine!</h2>
              <p className="text-gray-300 text-lg">Hi {driver.name.split(' ')[0]}, let's get you set up for success</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-white text-xl font-semibold mb-4">We'll help you:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Complete your profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Set your availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Learn the portal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Car className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Start accepting trips</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400">This will take about 5 minutes</p>
          </div>
        )

      case 1: // Profile
        return (
          <div className="py-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
              <p className="text-gray-300">Help us keep your information up to date</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Emergency Contact Phone
                  </label>
                  <div className="relative max-w-md">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.emergencyPhone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Profile Photo</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    {profileData.profilePhotoUrl ? (
                      <img 
                        src={profileData.profilePhotoUrl} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload a professional photo</p>
                    <p className="text-gray-400 text-sm">This helps customers identify you</p>
                    <button className="text-red-400 text-sm hover:text-red-300 mt-1">
                      Choose Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Availability
        return (
          <div className="py-6">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Set Your Availability</h2>
              <p className="text-gray-300">When do you prefer to work? You can change this later.</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Weekly Schedule</h3>
              <div className="space-y-4">
                {Object.entries(availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={schedule.available}
                        onChange={(e) => setAvailability(prev => ({
                          ...prev,
                          [day]: { ...prev[day], available: e.target.checked }
                        }))}
                        className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                      />
                      <span className="text-white font-medium capitalize w-20">
                        {day}
                      </span>
                    </div>
                    
                    {schedule.available && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => setAvailability(prev => ({
                            ...prev,
                            [day]: { ...prev[day], start: e.target.value }
                          }))}
                          className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => setAvailability(prev => ({
                            ...prev,
                            [day]: { ...prev[day], end: e.target.value }
                          }))}
                          className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-200 text-sm">
                    This creates your default schedule. You can always adjust specific days later or request time off.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3: // Tutorial
        return (
          <div className="py-6">
            <div className="text-center mb-6">
              <BookOpen className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Quick Portal Tour</h2>
              <p className="text-gray-300">Let's show you the key features you'll use every day</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Dashboard</h3>
                </div>
                <p className="text-gray-300 mb-3">Your daily overview showing today's trips, quick stats, and important notifications.</p>
                <div className="text-sm text-gray-400">✓ View today's schedule ✓ Trip status updates ✓ Quick actions</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Schedule</h3>
                </div>
                <p className="text-gray-300 mb-3">Manage your weekly availability, view upcoming shifts, and request time off.</p>
                <div className="text-sm text-gray-400">✓ Set availability ✓ Request time off ✓ View weekly schedule</div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Trips</h3>
                </div>
                <p className="text-gray-300 mb-3">View trip history, earnings, and performance metrics to track your success.</p>
                <div className="text-sm text-gray-400">✓ Trip history ✓ Earnings tracking ✓ Performance stats</div>
              </div>
              
              <div className="bg-green-900/50 border border-green-700 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-200 font-medium">You're all set!</span>
                </div>
                <p className="text-green-200 text-sm mt-1">Ready to start your TNT Limousine journey</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Profile step
        return profileData.phone.length > 0
      case 2: // Availability step  
        return Object.values(availability).some(schedule => schedule.available)
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (currentStep === 1 && canProceed()) {
      await updateProfileStep()
    } else if (currentStep === 2 && canProceed()) {
      await saveAvailability()
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeOnboarding()
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header with Progress */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-2xl font-bold">Getting Started</h1>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white text-sm"
            >
              Skip for now
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {completedSteps[index] ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-red-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-3">
            <h2 className="text-white font-medium">{steps[currentStep].title}</h2>
            <p className="text-gray-400 text-sm">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-t border-gray-700 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onSkip()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 0 ? 'Skip' : 'Back'}</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </span>
            {!isLoading && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow