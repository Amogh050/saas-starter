import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createProject, getProject, getProjects, updateProject, deleteProject } from "../controllers/project.controller.js";

const router = Router();

router.post("/", requireAuth, createProject);
router.get("/", requireAuth, getProjects);
router.get("/:projectId", requireAuth, getProject);
router.patch("/:projectId", requireAuth, updateProject);
router.delete("/:projectId", requireAuth, deleteProject);

export default router;