import { Request, Response } from "express";
import { signupService } from "../services/auth.service.js";

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const result = await signupService({ email, password, name });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
