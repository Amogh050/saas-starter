import { prisma } from "../lib/prisma.js";
import { assertWorkspaceMember, assertTaskInWorkspace } from "./authorization.service.js";

export const createCommentService = async (
    taskId: string,
    content: string,
    workspaceId: string,
    userId: string
) => {
    await assertWorkspaceMember(userId, workspaceId);
    await assertTaskInWorkspace(taskId, workspaceId);

    return prisma.comment.create({
        data: {
            content,
            taskId,
            authorId: userId,
        },
        include: {
            author: {
                select: { id: true, name: true, email: true },
            },
        },
    });
};

export const getCommentsService = async (
    taskId: string,
    workspaceId: string,
    userId: string
) => {
    await assertWorkspaceMember(userId, workspaceId);
    await assertTaskInWorkspace(taskId, workspaceId);

    return prisma.comment.findMany({
        where: { taskId },
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: { id: true, name: true, email: true },
            },
        },
    });
};
