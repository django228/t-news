import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const postsCount = await prisma.post.count();
  console.log('Users:', usersCount);
  console.log('Posts:', postsCount);
  if (usersCount === 0 && postsCount === 0) {
    console.log('\nБД пустая');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
