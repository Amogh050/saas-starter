import { Router } from "express";
import { signup, login, refresh, logout, logoutAll } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", requireAuth, logoutAll);

export default authRouter;