import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getSubscription, updateSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.get("/", requireAuth, getSubscription);
router.patch("/", requireAuth, updateSubscription);

export default router;
