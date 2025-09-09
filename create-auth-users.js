// Create auth users for existing drivers
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyNTgzNiwiZXhwIjoyMDcxMjAxODM2fQ.TcgK5hKoYaFDdNX6n8xw5Gz8TINt8RjQcNuKWdksKQI'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {}
  }
})

async function createAuthUsers() {
  console.log('🔧 Creating authentication users for drivers...')
  
  try {
    // Get all drivers
    const { data: drivers, error } = await supabaseAdmin
      .from('drivers')
      .select('id, name, email')
    
    if (error) {
      throw new Error(`Failed to fetch drivers: ${error.message}`)
    }
    
    console.log(`Found ${drivers.length} drivers`)
    
    let successCount = 0
    
    for (const driver of drivers) {
      console.log(`\nCreating auth user for: ${driver.name} (${driver.email})`)
      
      try {
        // Create auth user with service role key
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: driver.email,
          password: 'password123',
          email_confirm: true,
          user_metadata: {
            name: driver.name,
            driver_id: driver.id
          }
        })
        
        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`   ℹ️  Auth user already exists`)
            
            // Update the existing user's ID to match driver ID
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
            const existingUser = existingUsers.users.find(u => u.email === driver.email)
            
            if (existingUser && existingUser.id !== driver.id) {
              console.log(`   🔄 Updating driver ID to match auth user: ${existingUser.id}`)
              
              // Update driver record to match auth user ID
              const { error: updateError } = await supabaseAdmin
                .from('drivers')
                .update({ id: existingUser.id })
                .eq('id', driver.id)
              
              if (updateError) {
                console.log(`   ❌ Failed to update driver ID: ${updateError.message}`)
              } else {
                console.log(`   ✅ Driver ID updated successfully`)
                successCount++
              }
            } else {
              successCount++
            }
          } else {
            console.log(`   ❌ Error: ${authError.message}`)
          }
        } else if (authUser) {
          console.log(`   ✅ Auth user created: ${authUser.user.id}`)
          
          // Update driver record to match auth user ID
          if (authUser.user.id !== driver.id) {
            console.log(`   🔄 Updating driver ID to match auth user`)
            
            const { error: updateError } = await supabaseAdmin
              .from('drivers')
              .update({ id: authUser.user.id })
              .eq('id', driver.id)
            
            if (updateError) {
              console.log(`   ❌ Failed to update driver ID: ${updateError.message}`)
            } else {
              console.log(`   ✅ Driver ID synchronized`)
            }
          }
          
          successCount++
        }
        
      } catch (err) {
        console.log(`   💥 Unexpected error: ${err.message}`)
      }
    }
    
    console.log(`\n🎉 Successfully processed ${successCount}/${drivers.length} drivers`)
    console.log('\n✅ Auth users are ready! You can now log in with:')
    console.log('   Password: password123')
    console.log('   Any driver email from the list above')
    
  } catch (err) {
    console.error('💥 Failed to create auth users:', err.message)
  }
}

createAuthUsers()