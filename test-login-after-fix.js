// Test login after the Supabase configuration fix
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

// Use the same minimal configuration as our fix
const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function testLogin() {
  console.log('🧪 Testing login with minimal Supabase configuration...')
  
  const testUsers = [
    { email: 'testuser@tntlimousine.com', name: 'testuser@tntlimousine.com' },
    { email: 'confirmed@tntlimousine.com', name: 'confirmed@tntlimousine.com' }
  ]
  
  for (const user of testUsers) {
    console.log(`\n🔐 Testing login: ${user.email}`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: 'password123'
      })
      
      if (error) {
        console.log(`❌ Login failed: ${error.message}`)
      } else {
        console.log(`✅ LOGIN SUCCESS!`)
        console.log(`   User ID: ${data.user.id}`)
        console.log(`   Email: ${data.user.email}`)
        console.log(`   Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`)
        
        // Test if we can access the drivers table
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', data.user.id)
          .single()
          
        if (driverError) {
          console.log(`⚠️ Driver record not found: ${driverError.message}`)
        } else {
          console.log(`✅ Driver record found: ${driver.name}`)
        }
        
        // Sign out
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.log(`💥 Error: ${err.message}`)
    }
  }
}

testLogin()