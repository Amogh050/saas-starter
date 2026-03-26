import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
    getMe,
    updateMe,
    changePassword,
    deleteAccount,
} from "../controllers/user.controller.js";

const router = Router();

// All routes here require authentication
router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/password", changePassword);
router.delete("/me", deleteAccount);

export default router;
