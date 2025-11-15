const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...')

    // Test basic connection
    await prisma.$connect()
    console.log('✅ Successfully connected to MongoDB Atlas!')

    // Test a simple query - count users
    const userCount = await prisma.user.count()
    console.log(`📊 Database contains ${userCount} users`)

    // Test fetching a user (if any exist)
    if (userCount > 0) {
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })
      console.log('👤 Sample user:', firstUser)
    }

    // Test categories count
    const categoryCount = await prisma.category.count()
    console.log(`📂 Database contains ${categoryCount} categories`)

    // Test businesses count
    const businessCount = await prisma.business.count()
    console.log(`🏢 Database contains ${businessCount} businesses`)

    // Test products count
    const productCount = await prisma.product.count()
    console.log(`📦 Database contains ${productCount} products`)

    // Test inquiries count
    const inquiryCount = await prisma.inquiry.count()
    console.log(`💬 Database contains ${inquiryCount} inquiries`)

    console.log('🎉 All database tests passed!')

  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('🔍 Error details:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('✅ Test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })