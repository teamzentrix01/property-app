import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

export async function currentUser() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const payload = token && verifyToken(token);
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.sessionVersion !== payload.sessionVersion) return null;
  return user;
}

export async function requireUser(roles = []) {
  const user = await currentUser();
  if (!user) return { user: null, status: 401, error: "Login required" };
  if (roles.length && !roles.includes(user.role)) {
    return { user: null, status: 403, error: "You do not have permission to perform this action" };
  }
  return { user, status: null, error: null };
}

export function isScopedAreaAdmin(user) {
  return user.role === "AREA_ADMIN" && Boolean(user.adminArea?.trim());
}
