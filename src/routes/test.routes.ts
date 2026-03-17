import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { AuthRequest } from "../types/auth.js";

const testRouter = Router();

testRouter.get("/me", requireAuth, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default testRouter;