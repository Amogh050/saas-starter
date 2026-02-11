import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/requireAuth.js";

const testRouter = Router();

testRouter.get("/me", requireAuth, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default testRouter;