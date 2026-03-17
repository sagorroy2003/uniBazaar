import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { ApiError } from "./errors";
import { prisma } from "./lib/prisma";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const isProduction = process.env.NODE_ENV === "production";

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const jsonBodyLimit = process.env.JSON_BODY_LIMIT || "200kb";
const globalRateLimitWindowMs = parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const globalRateLimitMax = parsePositiveInteger(process.env.RATE_LIMIT_MAX, 300);
const authRateLimitWindowMs = parsePositiveInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const authRateLimitMax = parsePositiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 20);


if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required. Set it in backend/.env before starting the server.");
}

if (isProduction && allowedOrigins.length === 0) {
  throw new Error("CORS_ALLOWED_ORIGINS is required in production.");
}

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

const globalRateLimiter = rateLimit({
  windowMs: globalRateLimitWindowMs,
  max: globalRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const authRateLimiter = rateLimit({
  windowMs: authRateLimitWindowMs,
  max: authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts. Please try again later." },
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProduction || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: jsonBodyLimit }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use(globalRateLimiter);

app.use("/auth", authRateLimiter, authRouter);
app.use("/products", productsRouter);

app.get("/auth/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as Request & { user?: { userId: number; email: string } };

    if (!authReq.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
      select: {
        id: true,
        email: true,
<<<<<<< HEAD
=======
        phoneNumber: true,
        messengerUsername: true,
>>>>>>> 00a0d9c (feat: add user contact fields and implement rate limiting for enhanced security)
      },
    });

    if (!dbUser) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    res.json({
      user: {
        userId: dbUser.id,
        email: dbUser.email,
<<<<<<< HEAD
=======
        phoneNumber: dbUser.phoneNumber,
        messengerUsername: dbUser.messengerUsername,
>>>>>>> 00a0d9c (feat: add user contact fields and implement rate limiting for enhanced security)
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/categories", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (_error) {
    next(new ApiError(500, "Unable to fetch categories. Please try again later."));
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

async function startServer() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

void startServer();
