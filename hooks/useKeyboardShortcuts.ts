import { useEffect, useRef } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean // Cmd on Mac, Windows key on Windows
  action: () => void
  description: string
  category?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef<KeyboardShortcut[]>([])
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      const activeElement = document.activeElement
      const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )

      if (isInputField) return

      // Find matching shortcut
      const matchingShortcut = shortcutsRef.current.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase()
        const ctrlMatches = !!shortcut.ctrl === event.ctrlKey
        const altMatches = !!shortcut.alt === event.altKey
        const shiftMatches = !!shortcut.shift === event.shiftKey
        const metaMatches = !!shortcut.meta === event.metaKey

        return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches
      })

      if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        matchingShortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return {
    shortcuts: shortcutsRef.current
  }
}

// Helper function to format shortcut display
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts = []
  
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.meta) parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win')
  
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join(' + ')
}