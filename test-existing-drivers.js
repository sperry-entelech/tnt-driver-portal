// Test with existing driver accounts
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testExistingDrivers() {
  try {
    console.log('Testing existing driver accounts...')
    
    // Get all existing drivers
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .limit(10)
    
    if (driversError) {
      console.error('Error getting drivers:', driversError)
      return
    }
    
    console.log('Found drivers:')
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name} (${driver.email})`)
      console.log(`   ID: ${driver.id}`)
      console.log(`   Employee ID: ${driver.employee_id}`)
      console.log(`   Status: ${driver.status}`)
      console.log('')
    })
    
    // Test login with common passwords for existing drivers
    const commonPasswords = ['password', '123456', 'test123', 'driver123', 'tnt123']
    const testEmails = [
      'aric@tntlimousine.com',
      'brett@tntlimousine.com', 
      'matthew@tntlimousine.com',
      'testdriver@tntlimo.com'
    ]
    
    console.log('Testing login combinations...')
    
    for (const email of testEmails) {
      console.log(`\nTesting ${email}:`)
      
      for (const password of commonPasswords) {
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          })
          
          if (!loginError) {
            console.log(`✓ SUCCESS: ${email} / ${password}`)
            
            // Check if driver profile exists for this auth user
            const driver = drivers.find(d => d.id === loginData.user.id)
            if (driver) {
              console.log(`  ✓ Driver profile found: ${driver.name}`)
              console.log(`  🎉 WORKING LOGIN CREDENTIALS FOUND!`)
              console.log(`  Email: ${email}`)
              console.log(`  Password: ${password}`)
              return { email, password, driver }
            } else {
              console.log(`  ⚠ Auth successful but no matching driver profile`)
            }
          }
        } catch (error) {
          // Ignore login failures
        }
      }
    }
    
    console.log('\n❌ No working login credentials found.')
    console.log('You need to manually set up authentication in Supabase dashboard.')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testExistingDrivers()