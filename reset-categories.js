const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetCategories() {
  try {
    console.log('Resetting categories...');

    // Delete all categories using Prisma
    const result = await prisma.category.deleteMany({});
    console.log(`Deleted ${result.count} categories successfully`);

  } catch (error) {
    console.error('Error resetting categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCategories();
