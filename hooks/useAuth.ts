import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'
import type { Driver } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session and driver profile
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const driverProfile = await AuthService.getCurrentDriver()
        setDriver(driverProfile)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const driverProfile = await AuthService.getCurrentDriver()
          setDriver(driverProfile)
        } else {
          setDriver(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await AuthService.signIn({ email, password })
      
      if (result.success && result.driver) {
        // Auth hook will update via onAuthStateChange
        return { data: { user: result.driver }, error: null }
      }
      
      return { data: null, error: { message: result.error || 'Login failed' } }
    } catch (error) {
      return { data: null, error: { message: 'An unexpected error occurred' } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await AuthService.signOut()
      return { error: result.success ? null : { message: result.error } }
    } catch (error) {
      return { error: { message: 'Sign out failed' } }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    const result = await AuthService.resetPassword(email)
    return { 
      data: result.success ? {} : null, 
      error: result.success ? null : { message: result.error } 
    }
  }

  const updateProfile = async (updates: Partial<Driver>) => {
    const result = await AuthService.updateDriverProfile(updates)
    if (result.success && result.driver) {
      setDriver(result.driver)
    }
    return result
  }

  return {
    user,
    driver,
    loading,
    isAuthenticated: !!user && !!driver,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }
}