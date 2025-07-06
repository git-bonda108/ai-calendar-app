const { PrismaClient } = require('./prisma/generated/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  // Test with current DATABASE_URL from .env
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Count bookings
    const bookingCount = await prisma.booking.count();
    console.log(`📊 Total bookings in database: ${bookingCount}`);
    
    if (bookingCount > 0) {
      // Get sample booking
      const sampleBooking = await prisma.booking.findFirst();
      console.log('📝 Sample booking:', {
        id: sampleBooking.id,
        title: sampleBooking.title,
        date: sampleBooking.date,
        time: sampleBooking.time
      });
    }
    
    // Test if this is the old or new database
    if (bookingCount === 45) {
      console.log('✅ This appears to be the NEW Supabase database with 45 bookings');
    } else if (bookingCount === 0) {
      console.log('⚠️  Database is empty - this might be a fresh Supabase instance');
    } else {
      console.log(`ℹ️  Database has ${bookingCount} bookings`);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 This suggests the DATABASE_URL in .env is incorrect or the database is not accessible');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection().catch(console.error);
