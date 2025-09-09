import { useState, useEffect, useRef } from 'react'

interface VoiceCommandOptions {
  enabled?: boolean
  language?: string
  continuous?: boolean
  onCommand?: (command: string, confidence: number) => void
  onError?: (error: string) => void
}

interface VoiceCommandResult {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error: string | null
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

export const useVoiceCommands = (options: VoiceCommandOptions = {}): VoiceCommandResult => {
  const {
    enabled = true,
    language = 'en-US',
    continuous = false,
    onCommand,
    onError
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const lastCommandTime = useRef<number>(0)

  // Voice command patterns and their actions
  const commandPatterns = {
    // Navigation commands
    'navigate|directions|maps': 'navigate',
    'call customer|call client|phone': 'call',
    'message|text|communicate': 'communicate',
    'start trip|begin trip': 'start-trip',
    'complete trip|finish trip|end trip': 'complete-trip',
    'expand|expand details|show details': 'expand',
    'collapse|hide details': 'collapse',
    
    // Status commands
    'available|go online|start work': 'go-available',
    'unavailable|go offline|stop work': 'go-unavailable',
    'break|take break|lunch': 'take-break',
    'emergency|help|sos': 'emergency',
    
    // General navigation
    'dashboard|home': 'dashboard',
    'trips|my trips': 'trips',
    'schedule|calendar': 'schedule',
    'profile|settings': 'profile',
    
    // Quick actions
    'refresh|update|reload': 'refresh',
    'notifications|alerts': 'notifications',
    'next trip|upcoming trip': 'next-trip'
  }

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser')
      return
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptText = result[0].transcript.toLowerCase().trim()
        
        if (result.isFinal) {
          finalTranscript = transcriptText
          setConfidence(result[0].confidence)
          
          // Process command if confidence is high enough
          if (result[0].confidence > 0.7) {
            processVoiceCommand(transcriptText, result[0].confidence)
          }
        } else {
          interimTranscript = transcriptText
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`
      setError(errorMessage)
      setIsListening(false)
      onError?.(errorMessage)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (continuous && enabled && !error) {
        // Restart if continuous mode is enabled
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            // Recognition may already be running
          }
        }, 100)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, continuous, enabled, onError])

  const processVoiceCommand = (transcript: string, confidence: number) => {
    // Prevent processing commands too quickly
    const now = Date.now()
    if (now - lastCommandTime.current < 1000) return
    lastCommandTime.current = now

    // Find matching command pattern
    for (const [pattern, command] of Object.entries(commandPatterns)) {
      const regex = new RegExp(pattern, 'i')
      if (regex.test(transcript)) {
        onCommand?.(command, confidence)
        break
      }
    }
  }

  const startListening = () => {
    if (!isSupported || !enabled) return

    try {
      recognitionRef.current?.start()
    } catch (e) {
      // Recognition may already be running
      setError('Recognition already running')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    toggleListening
  }
}

// Type augmentation for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}