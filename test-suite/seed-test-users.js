o/**
 * Seed test users for API testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestUsers() {
  console.log('Seeding test users...');

  const testUsers = [
    {
      email: 'superadmin@test.com',
      password: 'test123',
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    },
    {
      email: 'business@test.com',
      password: 'test123',
      name: 'Business Admin',
      role: 'BUSINESS_ADMIN'
    },
    {
      email: 'professional@test.com',
      password: 'test123',
      name: 'Professional Admin',
      role: 'PROFESSIONAL_ADMIN'
    }
  ];

  for (const userData of testUsers) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        }
      });

      console.log(`Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }

  console.log('Test user seeding completed!');
  await prisma.$disconnect();
}

// Run if this file is executed directly
if (require.main === module) {
  seedTestUsers().catch(console.error);
}

module.exports = { seedTestUsers };