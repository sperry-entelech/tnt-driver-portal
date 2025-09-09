// Create a test user in Supabase Auth and link to driver profile
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  try {
    console.log('Creating test user...')
    
    // First, try to sign up the test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testdriver@tntlimo.com',
      password: 'testpassword123'
    })
    
    if (signUpError) {
      console.error('Sign up error:', signUpError)
      // If user already exists, try to sign in to get the user ID
      console.log('User might already exist, trying sign in...')
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'testdriver@tntlimo.com',
        password: 'testpassword123'
      })
      
      if (signInError) {
        console.error('Sign in error:', signInError)
        console.log('You need to manually create the auth user in Supabase dashboard')
        return
      }
      
      console.log('✓ Signed in successfully')
      console.log('User ID:', signInData.user.id)
      return signInData.user
    }
    
    console.log('✓ User created successfully')
    console.log('User ID:', signUpData.user.id)
    
    // Now update the driver record to match this user ID
    const { data: updateData, error: updateError } = await supabase
      .from('drivers')
      .update({ id: signUpData.user.id })
      .eq('email', 'testdriver@tntlimo.com')
      .select()
    
    if (updateError) {
      console.error('Error updating driver record:', updateError)
      return
    }
    
    console.log('✓ Driver record updated with auth user ID')
    console.log('Updated driver:', updateData[0])
    
    return signUpData.user
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Test the login flow
async function testLogin() {
  try {
    console.log('\nTesting login flow...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'testdriver@tntlimo.com',
      password: 'testpassword123'
    })
    
    if (loginError) {
      console.error('Login failed:', loginError)
      return
    }
    
    console.log('✓ Login successful')
    console.log('User ID:', loginData.user.id)
    
    // Now try to get the driver profile
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    if (driverError) {
      console.error('Driver profile lookup failed:', driverError)
      return
    }
    
    console.log('✓ Driver profile found')
    console.log('Driver:', driver)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

async function main() {
  await createTestUser()
  await testLogin()
}

main()