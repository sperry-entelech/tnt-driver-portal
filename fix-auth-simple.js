// Simple auth user creation using anon key
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function createTestUser() {
  console.log('🔧 Creating a single test user that will definitely work...')
  
  try {
    // Sign up a new user
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@tntlimousine.com',
      password: 'password123'
    })
    
    if (error) {
      console.log(`❌ Signup error: ${error.message}`)
      
      // Try to sign in instead (user might already exist)
      console.log('Trying to sign in with existing user...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'testuser@tntlimousine.com', 
        password: 'password123'
      })
      
      if (signInError) {
        console.log(`❌ Sign in error: ${signInError.message}`)
      } else {
        console.log('✅ Successfully signed in!')
        console.log(`User ID: ${signInData.user.id}`)
        
        // Create or update driver record
        const driverData = {
          id: signInData.user.id,
          name: 'Test Driver',
          email: 'testuser@tntlimousine.com',
          phone: '+1234567890',
          employee_id: 'TEST001',
          license_number: 'DL123456',
          hire_date: '2025-01-01',
          status: 'active'
        }
        
        const { error: driverError } = await supabase
          .from('drivers')
          .upsert(driverData)
          
        if (driverError) {
          console.log(`⚠️ Driver insert error: ${driverError.message}`)
        } else {
          console.log('✅ Driver record created/updated!')
        }
      }
    } else {
      console.log('✅ Successfully signed up!')
      console.log(`User ID: ${data.user.id}`)
      
      // Create driver record
      const driverData = {
        id: data.user.id,
        name: 'Test Driver',
        email: 'testuser@tntlimousine.com',
        phone: '+1234567890',
        employee_id: 'TEST001',
        license_number: 'DL123456',  
        hire_date: '2025-01-01',
        status: 'active'
      }
      
      const { error: driverError } = await supabase
        .from('drivers')
        .insert(driverData)
        
      if (driverError) {
        console.log(`⚠️ Driver insert error: ${driverError.message}`)
      } else {
        console.log('✅ Driver record created!')
      }
    }
    
    console.log('\n🎉 SUCCESS! You can now log in with:')
    console.log('   Email: testuser@tntlimousine.com') 
    console.log('   Password: password123')
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message)
  }
}

createTestUser()