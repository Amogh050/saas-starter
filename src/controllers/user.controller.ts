import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
} from "../services/user.service.js";
import { handleControllerError } from "../lib/handleControllerError.js";

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const profile = await getUserProfile(userId);
        res.status(200).json(profile);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
    const { name, avatar, preferences } = req.body;

    try {
        const userId = req.user!.userId;
        const updatedUser = await updateUserProfile(userId, { name, avatar, preferences });
        res.status(200).json(updatedUser);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords required" });
    }

    try {
        const userId = req.user!.userId;
        const result = await changeUserPassword(userId, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const result = await deleteUserAccount(userId);
        res.status(200).json(result);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};
