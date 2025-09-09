"use client"

import { useState } from "react"

export default function SimpleTest() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">TNT Driver Portal</h1>
          <p className="text-gray-600">Environment Test</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supabase URL
            </label>
            <p className="text-xs text-gray-500 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supabase Key (first 20 chars)
            </label>
            <p className="text-xs text-gray-500">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) || "NOT SET"}...
            </p>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ready@tntlimousine.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="password123"
              />
            </div>
            
            <button
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => alert('Environment test - check console for values')}
            >
              Test Environment
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This is a simplified test to verify environment variables are working
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}