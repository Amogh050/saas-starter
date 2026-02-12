import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createTask } from "../controllers/task.controller.js";

const router = Router();

router.post("/", requireAuth, createTask);

export default router;