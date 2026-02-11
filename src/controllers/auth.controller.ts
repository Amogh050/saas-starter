import { Request, Response } from "express";
import { signupService, loginService} from "../services/auth.service.js";

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const result = await signupService({ email, password, name });

        res.status(201).json(result);
    } catch (error: any) {
        if(error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({message: "Email already exists"});
        }
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await loginService({ email, password });

        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
