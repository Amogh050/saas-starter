import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
    getWorkspace,
    updateWorkspace,
    addMember,
    getMembers,
    removeMember,
    updateMemberRole,
} from "../controllers/workspace.controller.js";

const router = Router();

router.get("/", requireAuth, getWorkspace);
router.patch("/", requireAuth, updateWorkspace);

router.post("/members", requireAuth, addMember);
router.get("/members", requireAuth, getMembers);
router.patch("/members/:memberId", requireAuth, updateMemberRole);
router.delete("/members/:memberId", requireAuth, removeMember);

export default router;
