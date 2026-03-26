import { prisma } from "../lib/prisma.js";
import { assertWorkspaceRole, assertWorkspaceMember } from "./authorization.service.js";
import { AppError } from "../lib/AppError.js";
import { ErrorCodes } from "../lib/errorCodes.js";

export const createProjectService = async ({
    name,
    workspaceId,
    userId,
}: {
    name: string;
    workspaceId: string;
    userId: string;
}) => {
    await assertWorkspaceRole(userId, workspaceId, ["ADMIN"]);

    return prisma.project.create({
        data: {
            name,
            workspaceId,
        },
    });
};

export const getProjectsService = async (workspaceId: string, userId: string) => {
    await assertWorkspaceMember(userId, workspaceId);

    return prisma.project.findMany({
        where: {
            workspaceId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getprojectService = async (projectId: string, workspaceId: string, userId: string) => {
    await assertWorkspaceMember(userId, workspaceId);

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            workspaceId,
        },
    });

    if (!project) {
        throw new AppError(404, ErrorCodes.PROJECT_NOT_FOUND, "Project not found");
    }

    return project;
};