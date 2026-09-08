import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and a 12+ character ADMIN_PASSWORD.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Bhoomi Super Admin", phone: "+919999999999", passwordHash, role: "SUPER_ADMIN", adminArea: null, sessionVersion: { increment: 1 }, adminSessionVersion: { increment: 1 } },
    create: { name: "Bhoomi Super Admin", email, phone: "+919999999999", passwordHash, role: "SUPER_ADMIN" },
    select: { email: true, role: true },
  });
  console.log(`Created ${user.role}: ${user.email}`);
} finally {
  await prisma.$disconnect();
}
