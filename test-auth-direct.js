const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testDirectAuth() {
  console.log('🔐 Testing Authentication Functions Directly...\n')

  try {
    // Test password hashing and verification
    console.log('Testing password hashing...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    console.log('✅ Password hashed successfully')

    const isValid = await bcrypt.compare('admin123', hashedPassword)
    console.log(`✅ Password verification: ${isValid ? 'PASS' : 'FAIL'}`)

    const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword)
    console.log(`✅ Wrong password verification: ${!isInvalid ? 'PASS' : 'FAIL'}`)

    // Test user lookup from database
    console.log('\nTesting database user lookup...')
    const dbUser = await prisma.user.findUnique({
      where: { email: 'admin@bdpp.com' },
      include: { business: true }
    })

    if (dbUser) {
      console.log('✅ User found in database')
      console.log(`   Email: ${dbUser.email}`)
      console.log(`   Name: ${dbUser.name}`)
      console.log(`   Role: ${dbUser.role}`)
      console.log(`   Has password hash: ${!!dbUser.password}`)

      // Test password verification against stored hash
      const passwordValid = await bcrypt.compare('admin123', dbUser.password)
      console.log(`✅ Stored password verification: ${passwordValid ? 'PASS' : 'FAIL'}`)

      // Test wrong password
      const wrongPasswordValid = await bcrypt.compare('wrongpassword', dbUser.password)
      console.log(`✅ Wrong password rejection: ${!wrongPasswordValid ? 'PASS' : 'FAIL'}`)

    } else {
      console.log('❌ User not found in database')
    }

    // Test business admin user
    console.log('\nTesting business admin user...')
    const businessUser = await prisma.user.findUnique({
      where: { email: 'john@restaurant.com' },
      include: { business: true }
    })

    if (businessUser) {
      console.log('✅ Business admin found')
      console.log(`   Email: ${businessUser.email}`)
      console.log(`   Role: ${businessUser.role}`)
      console.log(`   Has business: ${!!businessUser.business}`)

      const businessPasswordValid = await bcrypt.compare('business123', businessUser.password)
      console.log(`✅ Business password verification: ${businessPasswordValid ? 'PASS' : 'FAIL'}`)
    } else {
      console.log('❌ Business admin not found')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectAuth()
  .then(() => {
    console.log('\n🎉 Direct authentication testing completed!')
  })
  .catch((error) => {
    console.error('❌ Test error:', error)
    process.exit(1)
  })