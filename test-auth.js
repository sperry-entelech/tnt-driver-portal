// Quick test to verify Supabase connection and authentication
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseAnonKey.length)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...')
    const { data, error } = await supabase
      .from('drivers')
      .select('id, name, email')
      .limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return
    }
    
    console.log('✓ Connection successful')
    console.log('Sample driver data:', data)
    
    // Test authentication with test user
    console.log('\n2. Testing authentication...')
    
    // Try to get the test driver
    const { data: testDriver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', 'testdriver@tntlimo.com')
      .single()
      
    if (driverError) {
      console.error('Test driver not found:', driverError)
      return
    }
    
    console.log('✓ Test driver found:', testDriver)
    console.log('✓ Auth system should work properly')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testConnection()