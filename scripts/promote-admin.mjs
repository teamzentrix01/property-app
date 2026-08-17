import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run admin:promote -- admin@example.com");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN", adminArea: null, sessionVersion: { increment: 1 } },
    select: { id: true, email: true, role: true },
  });
  console.log(`Promoted ${user.email} to ${user.role}.`);
} catch {
  console.error("No user with that email was found.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
