import { Request, Response } from "express";
import { signupService, loginService, refreshService, logoutService, logoutAllService } from "../services/auth.service.js";
import { AuthRequest } from "../types/auth.js";

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const result = await signupService({ email, password, name });

        res.status(201).json(result);
    } catch (error: any) {
        if(error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({message: "Email already exists"});
        }
        // Any other failure (transaction rollback, DB error, etc.) → 500
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await loginService({ email, password });

        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (error.message === "WORKSPACE_NOT_FOUND") {
            return res.status(404).json({ message: "Workspace not found" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token required" });
        }

        const deviceId = req.body.deviceId;
        const result = await refreshService(refreshToken, req.ip, deviceId);

        res.status(200).json(result);
    } catch (error: any) {
        if (["INVALID_REFRESH_TOKEN", "REFRESH_TOKEN_NOT_RECOGNIZED"].includes(error.message)) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const result = await logoutService(refreshToken);
        res.status(200).json(result);
    } catch (error: any) {
        if (["INVALID_REFRESH_TOKEN", "INVALID_TOKEN_TYPE"].includes(error.message)) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutAll = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await logoutAllService(userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
    }
};
