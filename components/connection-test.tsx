"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing...')
  const [envVars, setEnvVars] = useState<{url?: string, keyLength?: number}>({})

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        setEnvVars({
          url: url || 'MISSING',
          keyLength: key?.length || 0
        })

        setConnectionStatus('Testing connection...')

        // Test basic connection first
        console.log('Testing Supabase connection...')
        console.log('URL:', url)
        console.log('Key length:', key?.length)
        
        // Test basic URL connectivity first
        setConnectionStatus('Testing basic connectivity...')
        
        try {
          const response = await fetch(`${url}/rest/v1/`, {
            method: 'HEAD',
            headers: {
              'apikey': key || '',
              'Content-Type': 'application/json'
            }
          })
          console.log('Basic fetch response:', response.status, response.statusText)
        } catch (fetchError) {
          console.error('Basic fetch failed:', fetchError)
          setConnectionStatus(`❌ Basic connectivity failed: ${fetchError}`)
          return
        }

        setConnectionStatus('Testing Supabase query...')

        // Try a simple query
        const { data, error } = await supabase
          .from('vehicles')
          .select('license_plate')
          .limit(1)

        console.log('Supabase response:', { data, error })

        if (error) {
          setConnectionStatus(`Supabase Error: ${error.message} (Code: ${error.code})`)
        } else {
          setConnectionStatus(`✅ Connection Success! Found ${data?.length || 0} vehicles`)
        }
      } catch (err: any) {
        console.error('Connection test error:', err)
        setConnectionStatus(`❌ Network Error: ${err.message || err.toString()}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">TNT Portal Connection Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>URL: {envVars.url}</p>
            <p>Key Length: {envVars.keyLength} characters</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Connection Status</h2>
          <p className={`text-lg ${connectionStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {connectionStatus}
          </p>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Retry Test
          </button>
        </div>
      </div>
    </div>
  )
}