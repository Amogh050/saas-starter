import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createTaskService, getTasksByProjectService, getTaskService, updateTaskService, getWorkspaceTasksService, deleteTaskService } from "../services/task.service.js";
import { prisma } from "../lib/prisma.js";

export const createTask = async (req: AuthRequest, res: Response) => {
    const { title, description, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            workspaceId: req.user!.workspaceId,
        },
    });

    if (!project) {
        return res.status(403).json({ message: "Forbidden project" });
    }

    try {
        const task = await createTaskService({
            title,
            description,
            projectId,
            assigneeId,
            workspaceId: req.user!.workspaceId,
            userId: req.user!.userId,
        });

        res.status(201).json(task);
    } catch (error: any) {
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        if (error.message === "ASSIGNEE_NOT_IN_WORKSPACE") {
            return res.status(403).json({ message: "Assignee not in workspace" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getProjectTasks = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await getTasksByProjectService(req.params.projectId as string, req.user!.workspaceId);

        res.json(tasks);
    } catch (error: any) {
        if (error.message === "PROJECT_NOT_FOUND") {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(500).json({ message: "Internal error" });
    }
}

export const getWorkspaceTasks = async (req: AuthRequest, res: Response) => {
    try {
        const { status, assigneeId } = req.query;

        const tasks = await getWorkspaceTasksService(req.user!.workspaceId, {
            status: status as "TODO" | "IN_PROGRESS" | "DONE" | undefined,
            assigneeId: assigneeId as string | undefined,
        });
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTask = async (req: AuthRequest, res: Response) => {
    const task = await getTaskService(
        req.params.taskId as string,
        req.user!.workspaceId
    );

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const { title, status, assigneeId } = req.body;

    try {
        const task = await updateTaskService(
            taskId as string,
            req.user!.workspaceId,
            req.user!.userId,
            {
                title,
                status,
                assigneeId,
            }
        );

        res.json(task);
    } catch (error: any) {
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        if (error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({ message: "Task not found" });
        }
        if (error.message === "ASSIGNEE_NOT_IN_WORKSPACE") {
            return res.status(403).json({ message: "Assignee not in workspace" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;

    try {
        await deleteTaskService(taskId as string, req.user!.workspaceId, req.user!.userId);
        res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        if (error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};