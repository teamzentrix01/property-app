const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const listings = await prisma.listing.findMany({
    select: { city: true },
    distinct: ['city']
  });
  console.log('Existing cities with listings:', listings.map(l => l.city));

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'chandansaini480@gmail.com',
          'imamoradabad931@gmail.com',
          'mtbossmtboss95@gmail.com',
          'cszentrix01tech@gmail.com',
          'adminmeva9991@gmail.com'
        ]
      }
    },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('Existing users found:', users);
}

check().catch(console.error).finally(() => prisma.$disconnect());
