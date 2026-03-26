import { Response } from "express";
import { AppError } from "./AppError.js";

export const handleControllerError = (error: unknown, res: Response) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message, code: error.code });
    }

    console.error("Unhandled Exception:", error);
    res.status(500).json({ message: "Internal server error" });
};
