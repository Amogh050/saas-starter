import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createProjectService, getprojectService, getProjectsService, updateProjectService, deleteProjectService } from "../services/project.service.js";
import { handleControllerError } from "../lib/handleControllerError.js";

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
        handleControllerError(error, res);
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await getProjectsService(req.user!.workspaceId, req.user!.userId);
        res.json(projects);
    } catch (error: any) {
        handleControllerError(error, res);
    }
}

export const getProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await getprojectService(
            req.params.projectId as string,
            req.user!.workspaceId,
            req.user!.userId
        );

        res.json(project);
    } catch (error: any) {
        handleControllerError(error, res);
    }
}

export const updateProject = async (req: AuthRequest, res: Response) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name) {
        return res.status(400).json({ message: "Project name required" });
    }

    try {
        const project = await updateProjectService(
            req.params.projectId as string,
            req.user!.workspaceId,
            req.user!.userId,
            { name }
        );

        res.json(project);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        await deleteProjectService(
            req.params.projectId as string,
            req.user!.workspaceId,
            req.user!.userId
        );

        res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};