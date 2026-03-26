import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createTaskService, getTasksByProjectService, getTaskService, updateTaskService, getWorkspaceTasksService, deleteTaskService } from "../services/task.service.js";
import { handleControllerError } from "../lib/handleControllerError.js";

export const createTask = async (req: AuthRequest, res: Response) => {
    const { title, description, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
        return res.status(400).json({ message: "Missing fields" });
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
        handleControllerError(error, res);
    }
};

export const getProjectTasks = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await getTasksByProjectService(
            req.params.projectId as string, 
            req.user!.workspaceId,
            req.user!.userId
        );

        res.json(tasks);
    } catch (error: any) {
        handleControllerError(error, res);
    }
}

export const getWorkspaceTasks = async (req: AuthRequest, res: Response) => {
    try {
        const { status, assigneeId } = req.query;

        const tasks = await getWorkspaceTasksService(
            req.user!.workspaceId, 
            {
                status: status as "TODO" | "IN_PROGRESS" | "DONE" | undefined,
                assigneeId: assigneeId as string | undefined,
            },
            req.user!.userId
        );
        res.json(tasks);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const getTask = async (req: AuthRequest, res: Response) => {
    try {
        const task = await getTaskService(
            req.params.taskId as string,
            req.user!.workspaceId,
            req.user!.userId
        );

        res.json(task);
    } catch (error: any) {
        handleControllerError(error, res);
    }
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
        handleControllerError(error, res);
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;

    try {
        await deleteTaskService(
            taskId as string, 
            req.user!.workspaceId, 
            req.user!.userId
        );
        res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};