import { PrismaClient } from "@prisma/client";

// Reuse a single Prisma instance across hot reloads in dev
const globalForPrisma = globalThis;

function connectionUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;
  const url = new URL(raw);
  if (url.hostname.includes("-pooler.")) {
    if (!url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "5");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "20");
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "15");
  }
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: connectionUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
