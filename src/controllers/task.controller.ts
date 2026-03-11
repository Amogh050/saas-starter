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

    const task = await createTaskService({
        title,
        description,
        projectId,
        assigneeId,
    });

    res.status(201).json(task);
};