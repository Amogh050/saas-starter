import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createTaskService } from "../services/task.service.js";
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

    if(!project) {
        return res.status(403).json({message: "Forbidden project"});
    }

    try {
        const task = await createTaskService({
            title,
            description,
            projectId,
            assigneeId,
            workspaceId: req.user!.workspaceId,
        });

        res.status(201).json(task);
    } catch (error : any) {
        if (error.message === "ASSIGNEE_NOT_IN_WORKSPACE") {
            return res.status(403).json({ message: "Assignee not in workspace" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};