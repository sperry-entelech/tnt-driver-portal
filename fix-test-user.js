// Fix test user authentication issue
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTestUser() {
  try {
    console.log('Checking test user status...')
    
    // Get current driver record
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', 'testdriver@tntlimo.com')
      .single()
    
    if (driverError) {
      console.error('Driver not found:', driverError)
      return
    }
    
    console.log('Current driver record:')
    console.log('- ID:', driver.id)
    console.log('- Email:', driver.email)
    console.log('- Name:', driver.name)
    console.log('- Employee ID:', driver.employee_id)
    
    // Try different passwords that might work
    const passwords = ['testpassword123', 'password', '123456', 'test123']
    
    for (const password of passwords) {
      console.log(`\nTrying password: ${password}`)
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'testdriver@tntlimo.com',
        password: password
      })
      
      if (!loginError) {
        console.log('✓ Login successful with password:', password)
        console.log('User ID matches driver ID:', loginData.user.id === driver.id)
        
        // Test the driver profile lookup
        const { data: driverProfile, error: profileError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', loginData.user.id)
          .single()
        
        if (!profileError) {
          console.log('✓ Driver profile lookup successful!')
          console.log('You can now log in with:')
          console.log('Email: testdriver@tntlimo.com')
          console.log('Password:', password)
          return
        } else {
          console.log('⚠ Profile lookup failed:', profileError)
        }
      } else {
        console.log('✗ Failed:', loginError.message)
      }
    }
    
    console.log('\n❌ Could not find working credentials.')
    console.log('\nTo fix this manually in Supabase dashboard:')
    console.log('1. Go to Authentication > Users')
    console.log('2. Find user: testdriver@tntlimo.com')
    console.log('3. Reset password or confirm email')
    console.log('4. Make sure the user ID matches the driver record ID:', driver.id)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkTestUser()