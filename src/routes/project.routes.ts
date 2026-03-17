import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createProject, getProject, getProjects } from "../controllers/project.controller.js";

const router = Router();

router.post("/", requireAuth, createProject);
router.get("/", requireAuth, getProjects);
router.get("/:projectId", requireAuth, getProject);

export default router;