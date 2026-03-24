import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceRole } from "../middleware/requireWorkspaceRole.js";
import { createProject, getProject, getProjects } from "../controllers/project.controller.js";

const router = Router();

router.post("/", requireAuth, requireWorkspaceRole(["ADMIN"]), createProject);
router.get("/", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getProjects);
router.get("/:projectId", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getProject);

export default router;