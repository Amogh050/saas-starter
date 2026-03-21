import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
    getWorkspace,
    updateWorkspace,
    addMember,
    getMembers,
    removeMember,
} from "../controllers/workspace.controller.js";

const router = Router();

router.get("/", requireAuth, getWorkspace);
router.patch("/", requireAuth, updateWorkspace);

router.post("/members", requireAuth, addMember);
router.get("/members", requireAuth, getMembers);
router.delete("/members/:memberId", requireAuth, removeMember);

export default router;
