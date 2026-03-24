import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceRole } from "../middleware/requireWorkspaceRole.js";
import {
    getWorkspace,
    updateWorkspace,
    addMember,
    getMembers,
    removeMember,
} from "../controllers/workspace.controller.js";

const router = Router();

router.get("/", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getWorkspace);
router.patch("/", requireAuth, requireWorkspaceRole(["ADMIN"]), updateWorkspace);

router.post("/members", requireAuth, requireWorkspaceRole(["ADMIN"]), addMember);
router.get("/members", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getMembers);
router.delete("/members/:memberId", requireAuth, requireWorkspaceRole(["ADMIN"]), removeMember);

export default router;
