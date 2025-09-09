// Create a user that works immediately without email confirmation
const https = require('https');

const SUPABASE_URL = 'https://bkqffdiqbtcyzicsyiea.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyNTgzNiwiZXhwIjoyMDcxMjAxODM2fQ.TcgK5hKoYaFDdNX6n8xw5Gz8TINt8RjQcNuKWdksKQI'

async function createWorkingUser() {
  console.log('🔧 Creating a working user with admin API...')
  
  const userData = {
    email: 'working@tntlimousine.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'Working Test Driver'
    }
  }
  
  const postData = JSON.stringify(userData)
  
  const options = {
    hostname: 'bkqffdiqbtcyzicsyiea.supabase.co',
    port: 443,
    path: '/auth/v1/admin/users',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', async () => {
      try {
        const result = JSON.parse(data)
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ User created successfully!')
          console.log(`User ID: ${result.id}`)
          console.log(`Email: ${result.email}`)
          
          // Create driver record
          await createDriverRecord(result.id)
          
          console.log('\n🎉 SUCCESS! You can now log in with:')
          console.log('   Email: working@tntlimousine.com')
          console.log('   Password: password123')
          
        } else {
          console.log('❌ Error creating user:', result)
        }
        
      } catch (err) {
        console.error('💥 Error parsing response:', data)
      }
    })
  })
  
  req.on('error', (e) => {
    console.error(`💥 Request error: ${e.message}`)
  })
  
  req.write(postData)
  req.end()
}

async function createDriverRecord(userId) {
  const driverData = {
    id: userId,
    name: 'Working Test Driver',
    email: 'working@tntlimousine.com',
    phone: '+1234567890',
    employee_id: 'WORK001',
    license_number: 'DL999999',
    hire_date: '2025-01-01',
    status: 'active'
  }
  
  const postData = JSON.stringify(driverData)
  
  const options = {
    hostname: 'bkqffdiqbtcyzicsyiea.supabase.co',
    port: 443,
    path: '/rest/v1/drivers',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 201) {
        console.log('✅ Driver record created!')
      } else {
        console.log(`⚠️ Driver creation status: ${res.statusCode}`)
      }
      resolve()
    })
    
    req.on('error', (e) => {
      console.log(`⚠️ Driver creation error: ${e.message}`)
      resolve()
    })
    
    req.write(postData)
    req.end()
  })
}

createWorkingUser()