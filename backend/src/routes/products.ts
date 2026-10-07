import { NextFunction, Request, Response, Router } from "express";

import { ApiError } from "../errors";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

const LISTING_EXPIRATION_DAYS = 30;

function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + LISTING_EXPIRATION_DAYS);
  return date;
}

function isProductActuallyExpired(product: { status: string; expiresAt: Date | null }): boolean {
  if (product.status === "EXPIRED") return true;
  if (product.status === "ACTIVE" && product.expiresAt && product.expiresAt < new Date()) return true;
  return false;
}

type ProductBody = {
  userId?: number;
  categoryId?: number;
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  imageUrl?: string;
  showEmail?: boolean;
  showWhatsapp?: boolean;
  showMessenger?: boolean;
};

const router = Router();

function normalizeWhatsappUsernameForLink(username: string | null | undefined): string | null {
  if (!username) return null;
  const trimmed = username.trim().replace(/^@+/, "");
  return trimmed.length > 0 ? trimmed : null;
}

function toWhatsappUrl(profile: {
  whatsappUsername?: string | null;
  phoneNumber?: string | null;
}): string | undefined {
  // 1. Prefer WhatsApp username first so the seller's phone number stays private
  const cleanUsername = normalizeWhatsappUsernameForLink(profile.whatsappUsername);
  if (cleanUsername) {
    return `https://wa.me/${encodeURIComponent(cleanUsername)}`;
  }

  // 2. Fall back to international phone number if no username is set
  if (!profile.phoneNumber) return undefined;
  const digits = profile.phoneNumber.replace(/\D/g, "");
  return digits.length > 0 ? `https://wa.me/${digits}` : undefined;
}

function toMessengerUrl(username: string): string {
  return `https://m.me/${encodeURIComponent(username)}`;
}

function parseProductId(idParam: string): number {
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid product id");
  }

  return id;
}

async function ensureCategoryExists(categoryId: number): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    throw new ApiError(400, "categoryId does not exist");
  }
}

function normalizeProductInput(body: ProductBody): {
  categoryId: number;
  title: string;
  price: number;
  description?: string;
  location?: string;
  imageUrl?: string;
  showEmail?: boolean;
  showWhatsapp?: boolean;
  showMessenger?: boolean;
} {
  if (body.userId !== undefined) {
    throw new ApiError(400, "userId is not allowed in request body");
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    throw new ApiError(400, "title is required");
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new ApiError(400, "price must be greater than 0");
  }

  const categoryId = Number(body.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new ApiError(400, "categoryId is required and must be a positive integer");
  }

  for (const [field, value] of [
    ["description", body.description],
    ["location", body.location],
    ["imageUrl", body.imageUrl],
  ] as const) {
    if (value !== undefined && typeof value !== "string") {
      throw new ApiError(400, `${field} must be a string`);
    }
  }

  for (const [field, value] of [
    ["showEmail", body.showEmail],
    ["showWhatsapp", body.showWhatsapp],
    ["showMessenger", body.showMessenger],
  ] as const) {
    if (value !== undefined && typeof value !== "boolean") {
      throw new ApiError(400, `${field} must be a boolean`);
    }
  }

  return {
    categoryId,
    title: body.title.trim(),
    price,
    description: body.description,
    location: body.location,
    imageUrl: body.imageUrl,
    showEmail: body.showEmail,
    showWhatsapp: body.showWhatsapp,
    showMessenger: body.showMessenger,
  };
}

async function getOwnedProductOrThrow(productId: number, userId: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return product;
}

async function getRequesterProfileOrThrow(userId: number): Promise<{ phoneNumber: string | null; messengerUsername: string | null; whatsappUsername: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      phoneNumber: true,
      whatsappUsername: true,
      messengerUsername: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  return user;
}

function validateContactToggleEligibility(
  input: { showWhatsapp?: boolean; showMessenger?: boolean },
  profile: { phoneNumber: string | null; messengerUsername: string | null; whatsappUsername: string | null },
): void {
  if (input.showWhatsapp && !profile.phoneNumber && !profile.whatsappUsername) {
    throw new ApiError(400, "Show Whatsapp requires a phone number or WhatsApp username on your profile");
  }

  if (input.showMessenger && !profile.messengerUsername) {
    throw new ApiError(400, "Show Messenger requires a messenger username on your profile");
  }
}

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search } = req.query;

    const whereClause: Record<string, any> = {
      status: "ACTIVE",
      // Lazy Expiration: Only fetch items whose expiresAt is in the future (or null for legacy safety)
      OR: [
        { expiresAt: { gt: new Date() } },
        { expiresAt: null }
      ]
    };

    // 2. Add category filter if provided (using your exact old validation logic)
    if (typeof categoryId === "string") {
      const parsed = Number(categoryId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ApiError(400, "categoryId must be a positive integer");
      }
      whereClause.categoryId = parsed;
    }

    // 3. Add search filter if provided
    if (typeof search === "string" && search.trim() !== "") {
      const searchTerm = search.trim();
      whereClause.AND = [
        {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        }
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const products = await prisma.product.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseProductId(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            messengerUsername: true,
            whatsappUsername: true,
          },
        },
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // 1. Check if the listing is actually available to buyers
    const isExpired =
      product.status === "EXPIRED" ||
      (product.status === "ACTIVE" &&
        product.expiresAt &&
        new Date(product.expiresAt) < new Date());

    const isAvailable = product.status !== "SOLD" && !isExpired;

    // 2. Only build contact info if the listing is available
    const sellerContact = isAvailable
      ? {
        email: product.showEmail ? product.user.email : undefined,
        whatsapp:
          product.showWhatsapp && (product.user.whatsappUsername || product.user.phoneNumber)
            ? toWhatsappUrl(product.user)
            : undefined,
        messenger:
          product.showMessenger && product.user.messengerUsername
            ? toMessengerUrl(product.user.messengerUsername)
            : undefined,
      }
      : undefined;

    res.json({
      id: product.id,
      userId: product.userId,
      categoryId: product.categoryId,
      title: product.title,
      description: product.description,
      price: product.price,
      location: product.location,
      imageUrl: product.imageUrl,
      status: product.status,
      expiresAt: product.expiresAt,
      showEmail: product.showEmail,
      showWhatsapp: product.showWhatsapp,
      showMessenger: product.showMessenger,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      sellerContact,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const normalized = normalizeProductInput(req.body as ProductBody);
    const requesterProfile = await getRequesterProfileOrThrow(req.user.userId);
    validateContactToggleEligibility(normalized, requesterProfile);
    await ensureCategoryExists(normalized.categoryId);

    const product = await prisma.product.create({
      data: {
        userId: req.user.userId,
        categoryId: normalized.categoryId,
        title: normalized.title,
        description: normalized.description,
        price: normalized.price,
        location: normalized.location,
        imageUrl: normalized.imageUrl,
        showEmail: normalized.showEmail,
        showWhatsapp: normalized.showWhatsapp,
        showMessenger: normalized.showMessenger,
        status: "ACTIVE",
        expiresAt: getExpirationDate(),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const productId = parseProductId(req.params.id);
    await getOwnedProductOrThrow(productId, req.user.userId);

    const normalized = normalizeProductInput(req.body as ProductBody);
    const requesterProfile = await getRequesterProfileOrThrow(req.user.userId);
    validateContactToggleEligibility(normalized, requesterProfile);
    await ensureCategoryExists(normalized.categoryId);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        categoryId: normalized.categoryId,
        title: normalized.title,
        description: normalized.description,
        price: normalized.price,
        location: normalized.location,
        imageUrl: normalized.imageUrl,
        showEmail: normalized.showEmail,
        showWhatsapp: normalized.showWhatsapp,
        showMessenger: normalized.showMessenger,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    if (req.body.status !== "SOLD") throw new ApiError(400, "Only SOLD status transition is supported via this endpoint");

    const productId = parseProductId(req.params.id);
    const product = await getOwnedProductOrThrow(productId, req.user.userId);

    if (product.status === "SOLD") throw new ApiError(400, "Listing is already sold");
    if (isProductActuallyExpired(product)) throw new ApiError(400, "Cannot mark an expired listing as sold");

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "SOLD" },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/renew", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const productId = parseProductId(req.params.id);
    const product = await getOwnedProductOrThrow(productId, req.user.userId);

    if (product.status === "SOLD") throw new ApiError(400, "Cannot renew a sold listing");

    // Check if the product is actually expired before allowing renewal
    if (!isProductActuallyExpired(product)) {
      throw new ApiError(400, "Only expired listings can be renewed");
    }

    const renewalResult = await prisma.product.updateMany({
      where: {
        id: productId,
        userId: req.user.userId,
        OR: [
          { status: "EXPIRED" },
          {
            status: "ACTIVE",
            expiresAt: { lt: new Date() },
          },
        ],
      },
      data: {
        status: "ACTIVE",
        expiresAt: getExpirationDate(),
      },
    });

    if (renewalResult.count === 0) {
      throw new ApiError(400, "Listing is no longer eligible for renewal");
    }

    const updated = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!updated) {
      throw new ApiError(404, "Product not found");
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const productId = parseProductId(req.params.id);
    await getOwnedProductOrThrow(productId, req.user.userId);

    await prisma.product.delete({ where: { id: productId } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as productsRouter };
