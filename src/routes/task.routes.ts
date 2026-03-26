import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createTask, getProjectTasks, getTask, updateTask, getWorkspaceTasks, deleteTask } from "../controllers/task.controller.js";
import { createComment, getComments } from "../controllers/comment.controller.js";

const router = Router();

router.post("/", requireAuth, createTask);
router.get("/", requireAuth, getWorkspaceTasks);
router.get("/project/:projectId", requireAuth, getProjectTasks);
router.get("/:taskId", requireAuth, getTask);
router.patch("/:taskId", requireAuth, updateTask);
router.delete("/:taskId", requireAuth, deleteTask);
router.post("/:taskId/comments", requireAuth, createComment);
router.get("/:taskId/comments", requireAuth, getComments);

export default router;