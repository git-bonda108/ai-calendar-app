
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

async function testDeleteFunctionality() {
  console.log('🧪 =============== DELETE FUNCTIONALITY TEST ===============')
  
  try {
    // STEP 1: Check current database state
    console.log('\n📊 STEP 1: Current Database State')
    const allBookings = await prisma.booking.findMany({
      orderBy: { startTime: 'asc' }
    })
    
    console.log(`Total bookings in database: ${allBookings.length}`)
    allBookings.forEach((booking, index) => {
      const startDate = new Date(booking.startTime)
      const endDate = new Date(booking.endTime)
      console.log(`${index + 1}. ${booking.title}`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Date: ${startDate.toDateString()}`)
      console.log(`   Time: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`)
      console.log('')
    })

    // STEP 2: Test DELETE via Chat API
    console.log('\n🗑️ STEP 2: Testing DELETE via Chat API')
    console.log('Sending message: "clear off 12-Jul meetings"')
    
    const chatResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'clear off 12-Jul meetings'
      })
    })

    if (!chatResponse.ok) {
      throw new Error(`Chat API failed: ${chatResponse.status}`)
    }

    const chatResult = await chatResponse.json()
    console.log('\n📥 Chat API Response:')
    console.log('Response:', chatResult.response)
    console.log('Action Taken:', chatResult.actionTaken)
    console.log('Deletion Completed:', chatResult.deletionCompleted)
    console.log('Delete Result:', JSON.stringify(chatResult.deleteResult, null, 2))

    // STEP 3: Verify database state after deletion
    console.log('\n🔍 STEP 3: Database State After Deletion')
    const bookingsAfterDelete = await prisma.booking.findMany({
      orderBy: { startTime: 'asc' }
    })
    
    console.log(`Total bookings after deletion: ${bookingsAfterDelete.length}`)
    bookingsAfterDelete.forEach((booking, index) => {
      const startDate = new Date(booking.startTime)
      const endDate = new Date(booking.endTime)
      console.log(`${index + 1}. ${booking.title}`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Date: ${startDate.toDateString()}`)
      console.log(`   Time: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`)
      console.log('')
    })

    // STEP 4: Analyze results
    console.log('\n📊 STEP 4: Results Analysis')
    const deletedCount = allBookings.length - bookingsAfterDelete.length
    console.log(`Bookings deleted: ${deletedCount}`)
    
    // Check specifically for July 12th bookings
    const july12Bookings = bookingsAfterDelete.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate.getMonth() === 6 && bookingDate.getDate() === 12 // July is month 6 (0-indexed)
    })
    
    console.log(`July 12th bookings remaining: ${july12Bookings.length}`)
    
    if (july12Bookings.length === 0) {
      console.log('✅ SUCCESS: All July 12th bookings were deleted!')
    } else {
      console.log('❌ FAILURE: Some July 12th bookings still remain:')
      july12Bookings.forEach(booking => {
        console.log(`   - ${booking.title} at ${new Date(booking.startTime).toLocaleString()}`)
      })
    }

    // STEP 5: Test another DELETE scenario
    console.log('\n🗑️ STEP 5: Testing DELETE for specific date range')
    console.log('Sending message: "clear calendar from July 15 to July 16"')
    
    const chatResponse2 = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'clear calendar from July 15 to July 16'
      })
    })

    if (chatResponse2.ok) {
      const chatResult2 = await chatResponse2.json()
      console.log('\n📥 Second DELETE Test Response:')
      console.log('Response:', chatResult2.response)
      console.log('Action Taken:', chatResult2.actionTaken)
      console.log('Deletion Completed:', chatResult2.deletionCompleted)
    }

    console.log('\n🏁 =============== TEST COMPLETED ===============')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeleteFunctionality()
