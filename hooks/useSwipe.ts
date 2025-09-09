import { useState, useEffect, TouchEvent, MouseEvent } from 'react'

interface SwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: () => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
}

export const useSwipe = (options: SwipeOptions): SwipeHandlers => {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)

  const handleStart = (clientX: number, clientY: number) => {
    setStartPos({ x: clientX, y: clientY })
  }

  const handleEnd = (clientX: number, clientY: number) => {
    if (!startPos) return

    const deltaX = clientX - startPos.x
    const deltaY = clientY - startPos.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine if swipe threshold was met
    if (absDeltaX < threshold && absDeltaY < threshold) {
      setStartPos(null)
      return
    }

    // Horizontal swipe (left/right)
    if (absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } 
    // Vertical swipe (up/down)
    else {
      if (deltaY > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }

    setStartPos(null)
  }

  // Touch handlers
  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const onTouchMove = (e: TouchEvent) => {
    // Prevent scrolling during swipe
    if (startPos) {
      e.preventDefault()
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!startPos) return
    
    const touch = e.changedTouches[0]
    handleEnd(touch.clientX, touch.clientY)
  }

  // Mouse handlers for desktop testing
  const onMouseDown = (e: MouseEvent) => {
    setIsMouseDown(true)
    handleStart(e.clientX, e.clientY)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (isMouseDown && startPos) {
      e.preventDefault()
    }
  }

  const onMouseUp = (e: MouseEvent) => {
    if (!isMouseDown || !startPos) return
    
    setIsMouseDown(false)
    handleEnd(e.clientX, e.clientY)
  }

  const onMouseLeave = () => {
    if (isMouseDown) {
      setIsMouseDown(false)
      setStartPos(null)
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave
  }
}