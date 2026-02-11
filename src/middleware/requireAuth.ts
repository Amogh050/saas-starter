import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        workspaceId: string;
    };
}

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
        const payload = verifyToken(token);

        req.user = payload;

        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};