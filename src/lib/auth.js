import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "bhoomi_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET || SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a secure value of at least 32 characters");
  }
  return SECRET;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = COOKIE_NAME;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
