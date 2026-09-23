import { NextFunction, Request, Response, Router } from "express";

import { prisma } from "../lib/prisma";
import { hashPassword, isUniversityEmail, signToken, verifyPassword } from "../utils/auth";

type AuthBody = {
  email?: string;
  password?: string;
  phoneNumber?: string;
  messengerUsername?: string;
  whatsappUsername?: string;
  avatarUrl?: string;
};

export function normalizeOptionalPhoneNumber(phoneNumber: string | undefined): string | undefined {
  if (phoneNumber === undefined) {
    return undefined;
  }

  const trimmed = phoneNumber.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > 25) {
    throw new Error("Phone number is too long");
  }

  return trimmed;
}

export function normalizeOptionalUsername(username: string | undefined): string | undefined {
  if (username === undefined) return undefined;

  const trimmed = username.trim();
  if (!trimmed) return undefined;

  if (trimmed.length > 80) {
    throw new Error("Username is too long");
  }

  return trimmed;
}

export function normalizeOptionalUrl(url: string | undefined): string | undefined {
  if (url === undefined) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;
  // Change this from 500 to 191 to perfectly match the database limit
  if (trimmed.length > 191) {
    throw new Error("URL is too long");
  }

  return trimmed;
}

const router = Router();

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, phoneNumber, messengerUsername, whatsappUsername, avatarUrl } = req.body as AuthBody;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    if (!isUniversityEmail(email)) {
      res.status(400).json({ message: "Only valid student university email addresses are allowed" });
      return;
    }

    let normalizedPhoneNumber: string | undefined;
    let normalizedMessengerUsername: string | undefined;
    let normalizedWhatsappUsername: string | undefined;
    let normalizedAvatarUrl: string | undefined;

    try {
      normalizedPhoneNumber = normalizeOptionalPhoneNumber(phoneNumber);
      normalizedMessengerUsername = normalizeOptionalUsername(messengerUsername);
      normalizedWhatsappUsername = normalizeOptionalUsername(whatsappUsername);
      normalizedAvatarUrl = normalizeOptionalUrl(avatarUrl);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid profile fields" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        phoneNumber: normalizedPhoneNumber,
        messengerUsername: normalizedMessengerUsername,
        whatsappUsername: normalizedWhatsappUsername,
        avatarUrl: normalizedAvatarUrl,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        messengerUsername: true,
        whatsappUsername: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as AuthBody;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        messengerUsername: user.messengerUsername,
        whatsappUsername: user.whatsappUsername,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
