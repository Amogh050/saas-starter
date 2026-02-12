import { prisma } from "../lib/prisma.js";

export const createProjectService = async ({
    name,
    workspaceId,
}: {
    name: string;
    workspaceId: string;
}) => {
    return prisma.project.create({
        data: {
            name,
            workspaceId,
        },
    });
};