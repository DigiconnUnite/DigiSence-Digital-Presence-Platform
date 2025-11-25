const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetCategories() {
  try {
    console.log('Resetting categories...');

    // Delete all categories
    await prisma.category.deleteMany({});

    console.log('All categories deleted successfully');

    // Reset the database with seed data
    await prisma.$executeRaw`db.categories.dropIndexes()`;

    console.log('Category indexes dropped');

  } catch (error) {
    console.error('Error resetting categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCategories();