import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AuthRequest } from "../types/auth.js";

export const requireAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.split(" ")[1];

    try {
        const payload = verifyAccessToken(token);

        if (payload.type !== "access") {
            return res.status(401).json({ message: "Invalid token type" });
        }

        req.user = payload;

        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};