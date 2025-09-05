import { supabase } from './supabase'
import type { Driver } from './supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  driver?: Driver
}

export class AuthService {
  // Sign in driver with email and password
  static async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'No user data returned' }
      }

      // Get driver profile data
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (driverError || !driver) {
        return { success: false, error: 'Driver profile not found' }
      }

      return { success: true, driver }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign out current user
  static async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to sign out' }
    }
  }

  // Get current authenticated user and driver profile
  static async getCurrentDriver(): Promise<Driver | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !driver) {
        return null
      }

      return driver
    } catch (error) {
      return null
    }
  }

  // Listen for authentication state changes
  static onAuthStateChange(callback: (driver: Driver | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const driver = await this.getCurrentDriver()
        callback(driver)
      } else {
        callback(null)
      }
    })
  }

  // Check if user is currently authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch {
      return false
    }
  }

  // Update driver profile
  static async updateDriverProfile(updates: Partial<Driver>): Promise<AuthResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      const { data: driver, error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, driver }
    } catch (error) {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  // Request password reset
  static async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to send reset email' }
    }
  }
}