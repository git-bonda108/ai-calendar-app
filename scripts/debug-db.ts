
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugDatabase() {
  console.log('🔍 CHECKING DATABASE STATE...')
  
  try {
    // Get all bookings
    const allBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n📋 ALL BOOKINGS IN DATABASE:')
    console.log('Total bookings:', allBookings.length)
    
    allBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking.id}`)
      console.log(`   Title: ${booking.title}`)
      console.log(`   Category: ${booking.category}`)
      console.log(`   Start Time: ${booking.startTime}`)
      console.log(`   End Time: ${booking.endTime}`)
      console.log(`   Client: ${booking.clientName}`)
      console.log(`   Created: ${booking.createdAt}`)
      console.log(`   Status: ${booking.status}`)
    })
    
    // Check for bookings on July 12, 2025 (ISSUE DATE)
    console.log('\n🔍 CHECKING FOR JULY 12, 2025 BOOKINGS (ISSUE DATE)...')
    const july12Bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: new Date('2025-07-12T00:00:00.000Z'),
          lt: new Date('2025-07-13T00:00:00.000Z')
        }
      }
    })
    
    console.log('July 12, 2025 bookings:', july12Bookings.length)
    july12Bookings.forEach((booking, index) => {
      console.log(`\n⚠️  JULY 12 BOOKING ${index + 1}:`)
      console.log(`   Title: ${booking.title}`)
      console.log(`   Raw ISO Start: ${booking.startTime.toISOString()}`)
      console.log(`   Raw ISO End: ${booking.endTime.toISOString()}`)
      console.log(`   Local Time Start: ${booking.startTime.toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric'
      })}`)
      console.log(`   UTC Time Start: ${booking.startTime.toUTCString()}`)
      console.log(`   Hours: ${booking.startTime.getHours()}:${booking.startTime.getMinutes().toString().padStart(2, '0')}`)
    })
    
    // Check for bookings on July 19, 2025
    console.log('\n🔍 CHECKING FOR JULY 19, 2025 BOOKINGS...')
    const july19Bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: new Date('2025-07-19T00:00:00.000Z'),
          lt: new Date('2025-07-20T00:00:00.000Z')
        }
      }
    })
    
    console.log('July 19, 2025 bookings:', july19Bookings.length)
    july19Bookings.forEach(booking => {
      console.log(`   - ${booking.title}: ${booking.startTime} to ${booking.endTime}`)
    })
    
    // Check for bookings on July 1, 2025
    console.log('\n🔍 CHECKING FOR JULY 1, 2025 BOOKINGS...')
    const july1Bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: new Date('2025-07-01T00:00:00.000Z'),
          lt: new Date('2025-07-02T00:00:00.000Z')
        }
      }
    })
    
    console.log('July 1, 2025 bookings:', july1Bookings.length)
    july1Bookings.forEach(booking => {
      console.log(`   - ${booking.title}: ${booking.startTime} to ${booking.endTime}`)
    })
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDatabase()
