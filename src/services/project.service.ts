import { prisma } from "../lib/prisma.js";

export const createProjectService = async ({
    name,
    workspaceId,
    userId,
}: {
    name: string;
    workspaceId: string;
    userId: string;
}) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

    return prisma.project.create({
        data: {
            name,
            workspaceId,
        },
    });
};

export const getProjectsService = async (workspaceId: string) => {
    return prisma.project.findMany({
        where: {
            workspaceId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getprojectService = async (projectId: string, workspaceId: string) => {
    return prisma.project.findFirst({
        where: {
            id: projectId,
            workspaceId,
        },
    });
};