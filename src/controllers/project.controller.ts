import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createProjectService, getprojectService, getProjectsService } from "../services/project.service.js";

export const createProject = async (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Project name required" });
    }

    try {
        const project = await createProjectService({
            name,
            workspaceId: req.user!.workspaceId,
            userId: req.user!.userId,
        });

        res.status(201).json(project);
    } catch (error: any) {
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    const projects = await getProjectsService(req.user!.workspaceId);

    res.json(projects);
}

export const getProject = async (req: AuthRequest, res: Response) => {
    const project = await getprojectService(
        req.params.projectId as string,
        req.user!.workspaceId,
    );

    if(!project) {
        return res.status(404).json({message: "Project not found"});
    }

    res.json(project);
}