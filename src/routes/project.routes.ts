import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createProject } from "../controllers/project.controller.js";

const router = Router();

router.post("/", requireAuth, createProject);

export default router;