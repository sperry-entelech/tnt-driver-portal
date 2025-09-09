// Create a new user now that email confirmation is disabled
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

// Use minimal configuration like our fix
const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function createUserNoConfirmation() {
  console.log('🔧 Creating new user (email confirmation is now disabled)...')
  
  const testEmail = 'ready@tntlimousine.com'
  
  try {
    // First, try to sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'password123'
    })
    
    if (error) {
      console.log(`⚠️ Signup error: ${error.message}`)
      
      if (error.message.includes('already registered')) {
        console.log('User already exists, trying to login...')
      }
    } else {
      console.log(`✅ User created: ${data.user.id}`)
    }
    
    // Try to login immediately
    console.log(`\n🔐 Testing immediate login...`)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'password123'
    })
    
    if (loginError) {
      console.log(`❌ Login failed: ${loginError.message}`)
    } else {
      console.log(`✅ LOGIN SUCCESS!`)
      console.log(`   User ID: ${loginData.user.id}`)
      console.log(`   Email: ${loginData.user.email}`)
      console.log(`   Email Confirmed: ${loginData.user.email_confirmed_at ? 'Yes' : 'No'}`)
      
      // Create driver record
      const driverData = {
        id: loginData.user.id,
        name: 'Ready Test Driver',
        email: testEmail,
        phone: '+1234567890',
        employee_id: 'READY001',
        license_number: 'DL999888',
        hire_date: '2025-01-01',
        status: 'active'
      }
      
      const { error: driverError } = await supabase
        .from('drivers')
        .upsert(driverData)
        
      if (!driverError) {
        console.log('✅ Driver record created!')
      } else {
        console.log(`⚠️ Driver creation error: ${driverError.message}`)
      }
      
      console.log('\n🎉 SUCCESS! No fetch headers error!')
      console.log('   Email: ready@tntlimousine.com')
      console.log('   Password: password123')
      
      // Sign out
      await supabase.auth.signOut()
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message)
  }
}

createUserNoConfirmation()