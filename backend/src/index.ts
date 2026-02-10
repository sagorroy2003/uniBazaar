import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { prisma } from "./lib/prisma";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Categories
app.get(
  "/categories",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });

      res.json(categories);
    } catch (err) {
      // log the real error so you can debug 500s fast
      console.error("GET /categories failed:", err);
      next(err);
    }
  }
);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

// Central error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

async function startServer() {
  try {
    await prisma.$connect();

    const server = app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });

    // graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down...");
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

void startServer();
