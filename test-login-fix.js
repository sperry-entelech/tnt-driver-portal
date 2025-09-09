// Test script to verify login works with new config
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
  },
  db: {
    schema: 'public'
  }
})

async function testLogin() {
  console.log('🔍 Testing login with fixed configuration...')
  
  try {
    // Test with several known driver emails
    const testEmails = [
      'kory@tntlimousine.com',
      'testdriver@tntlimousine.com', 
      'aric@tntlimousine.com',
      'brett@tntlimousine.com'
    ]
    
    for (const email of testEmails) {
      console.log(`\nTesting login: ${email}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123'
      })
      
      if (error) {
        console.log(`❌ ${email}: ${error.message}`)
      } else if (data.user) {
        console.log(`✅ ${email}: LOGIN SUCCESS!`)
        console.log(`   User ID: ${data.user.id}`)
        console.log(`   Email: ${data.user.email}`)
        
        // Test fetching driver data
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', data.user.id)
          .single()
          
        if (driver) {
          console.log(`   Driver: ${driver.name}`)
          console.log(`   Employee ID: ${driver.employee_id}`)
        } else {
          console.log(`   ⚠️ No driver profile found: ${driverError?.message}`)
        }
        
        // Sign out
        await supabase.auth.signOut()
        console.log(`   Signed out successfully`)
        return { email, success: true }
      }
    }
    
    console.log('\n❌ No successful logins found')
    return null
    
  } catch (err) {
    console.error('💥 Test failed:', err.message)
    return null
  }
}

testLogin().then(result => {
  if (result) {
    console.log(`\n🎉 SUCCESS! You can log in with:`)
    console.log(`   Email: ${result.email}`)
    console.log(`   Password: password123`)
  } else {
    console.log('\n💥 All login attempts failed')
  }
})