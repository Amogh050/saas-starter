import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceRole } from "../middleware/requireWorkspaceRole.js";
import { createTask, getProjectTasks, getTask, updateTask, getWorkspaceTasks, deleteTask } from "../controllers/task.controller.js";

const router = Router();

router.post("/", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), createTask);
router.get("/", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getWorkspaceTasks);
router.get("/project/:projectId", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getProjectTasks);
router.get("/:taskId", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), getTask);
router.patch("/:taskId", requireAuth, requireWorkspaceRole(["ADMIN", "MEMBER"]), updateTask);
router.delete("/:taskId", requireAuth, requireWorkspaceRole(["ADMIN"]), deleteTask);

export default router;