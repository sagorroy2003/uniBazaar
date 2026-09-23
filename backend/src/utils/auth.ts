import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

export type AuthTokenPayload = {
  userId: number;
  email: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

export function isUniversityEmail(email: string): boolean {
  if (!email) return false;

  // 1. Safe, linear-time regex that prevents catastrophic backtracking
  const safeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!safeEmailRegex.test(email)) {
    return false;
  }

  // 2. Exact domain matching using standard string methods (ReDoS-proof)
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith("@student.nstu.edu.bd") || lowerEmail.endsWith("@nstu.edu.bd");
}
