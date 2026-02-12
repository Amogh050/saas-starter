import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createProjectService } from "../services/project.service.js";

export const createProject = async (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Project name required" });
    }

    const project = await createProjectService({
        name,
        workspaceId: req.user!.workspaceId,
    });

    res.status(201).json(project);
};