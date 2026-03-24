import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceRole } from "../middleware/requireWorkspaceRole.js";
import { getSubscription, updateSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.get("/", requireAuth, requireWorkspaceRole(["ADMIN"]), getSubscription);
router.patch("/", requireAuth, requireWorkspaceRole(["ADMIN"]), updateSubscription);

export default router;
