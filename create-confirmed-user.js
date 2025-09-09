// Create confirmed user that can login immediately
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {}
  }
})

async function createConfirmedUser() {
  console.log('🔧 Creating confirmed user...')
  
  const testEmail = 'confirmed@tntlimousine.com'
  
  try {
    // Sign up with email confirmation disabled (if possible)
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'password123',
      options: {
        emailRedirectTo: undefined
      }
    })
    
    if (error) {
      console.log(`⚠️ Signup error: ${error.message}`)
    } else {
      console.log(`✅ User created: ${data.user.id}`)
    }
    
    // Now try to sign in immediately  
    console.log('Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'password123'
    })
    
    if (loginError) {
      console.log(`❌ Login failed: ${loginError.message}`)
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('')
        console.log('📧 EMAIL CONFIRMATION REQUIRED')
        console.log('The user was created but needs email confirmation.')
        console.log('Check your email for a confirmation link, or:')
        console.log('')
        console.log('🔧 QUICK FIX - Go to Supabase Dashboard:')
        console.log('1. Authentication → Users')
        console.log(`2. Find user: ${testEmail}`)
        console.log('3. Click "..." → Confirm User')
        console.log('4. Then try logging in')
        console.log('')
      }
    } else {
      console.log('✅ LOGIN SUCCESS!')
      console.log(`User ID: ${loginData.user.id}`)
      
      // Create driver record
      const driverData = {
        id: loginData.user.id,
        name: 'Confirmed Test Driver',
        email: testEmail,
        phone: '+1234567890',
        employee_id: 'CONF001',
        license_number: 'DL654321',  
        hire_date: '2025-01-01',
        status: 'active'
      }
      
      const { error: driverError } = await supabase
        .from('drivers')
        .upsert(driverData)
        
      if (!driverError) {
        console.log('✅ Driver record created!')
      }
      
      console.log('')
      console.log('🎉 YOU CAN NOW LOG IN WITH:')
      console.log(`   Email: ${testEmail}`)
      console.log('   Password: password123')
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message)
  }
}

createConfirmedUser()