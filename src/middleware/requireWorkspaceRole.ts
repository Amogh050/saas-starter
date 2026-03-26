import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.js";
import { assertWorkspaceRole } from "../services/authorization.service.js";
import { AppError } from "../lib/AppError.js";
import { AllowedRole } from "../types/roles.js";

export const requireWorkspaceRole = (roles: AllowedRole[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({ message: "Unauthorized: Missing user session" });
            }

            await assertWorkspaceRole(user.userId, user.workspaceId, roles);
            next();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message, code: error.code });
            }
            console.error("Role verification error:", error);
            res.status(500).json({ message: "Internal server error during role verification" });
        }
    };
};
