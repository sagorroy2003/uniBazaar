import express, { Request, Response, NextFunction } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import {
    normalizeOptionalPhoneNumber,
    normalizeOptionalUsername,
    normalizeOptionalUrl
} from "./auth";

const router = express.Router();

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                messengerUsername: true,
                whatsappUsername: true,
                avatarUrl: true
            }
        });

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

router.patch("/me", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const { phoneNumber, messengerUsername, whatsappUsername, avatarUrl } = req.body;

        let normalizedPhone, normalizedMessenger, normalizedWhatsapp, normalizedAvatar;

        try {
            normalizedPhone = normalizeOptionalPhoneNumber(phoneNumber);
            normalizedMessenger = normalizeOptionalUsername(messengerUsername);
            normalizedWhatsapp = normalizeOptionalUsername(whatsappUsername);
            normalizedAvatar = normalizeOptionalUrl(avatarUrl);
        } catch (error) {
            return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid profile fields" });
        }

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                phoneNumber: phoneNumber || null,
                messengerUsername: messengerUsername || null,
                whatsappUsername: whatsappUsername || null,
                avatarUrl: avatarUrl || null,
            },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                messengerUsername: true,
                whatsappUsername: true,
                avatarUrl: true
            }
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
});

export default router;
