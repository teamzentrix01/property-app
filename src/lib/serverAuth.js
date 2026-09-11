import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_AUTH_COOKIE, AUTH_COOKIE, verifyAdminToken, verifyToken } from "@/lib/auth";

export async function currentUser() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const payload = token && verifyToken(token);
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return null;
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

export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) return { user: null, status: 401, error: "Admin authentication required" };
  return { user, status: null, error: null };
}

export async function currentAdmin() {
  const token = (await cookies()).get(ADMIN_AUTH_COOKIE)?.value;
  const payload = token && verifyAdminToken(token);
  if (!payload?.id || !["AREA_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || !["AREA_ADMIN", "SUPER_ADMIN"].includes(user.role) || user.adminSessionVersion !== payload.adminSessionVersion) return null;
  return user;
}

export function isScopedAreaAdmin(user) {
  return user.role === "AREA_ADMIN" && Boolean(user.adminArea?.trim());
}
