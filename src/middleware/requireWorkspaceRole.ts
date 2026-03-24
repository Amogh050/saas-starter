import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.js";

type AllowedRole = "ADMIN" | "MEMBER";

export const requireWorkspaceRole = (roles: AllowedRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Missing user session" });
        }

        if (!user.role || !roles.includes(user.role as AllowedRole)) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions for this action" });
        }

        next();
    };
};
