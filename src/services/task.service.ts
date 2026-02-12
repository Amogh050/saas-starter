import { prisma } from "../lib/prisma.js";

export const createTaskService = async ({
    title,
    description,
    projectId,
    assigneeId,
}: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
}) => {
    return prisma.task.create({
        data: {
            title,
            description,
            projectId,
            assigneeId,
            status: "TODO",
        },
    });
};