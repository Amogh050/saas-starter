import { prisma } from "../lib/prisma.js";
import {
    assertWorkspaceMember,
    assertWorkspaceRole,
    assertProjectInWorkspace,
    assertUserInWorkspace,
    assertTaskInWorkspace
} from "./authorization.service.js";

export const createTaskService = async ({
    title,
    description,
    projectId,
    assigneeId,
    workspaceId,
    userId,
}: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    workspaceId: string;
    userId: string;
}) => {
    await assertWorkspaceMember(userId, workspaceId);
    await assertProjectInWorkspace(projectId, workspaceId);

    if (assigneeId) {
        await assertUserInWorkspace(assigneeId, workspaceId);
    }

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

export const getTasksByProjectService = async (
    projectId: string,
    workspaceId: string,
    userId: string
) => {
    await assertWorkspaceMember(userId, workspaceId);
    await assertProjectInWorkspace(projectId, workspaceId);

    return prisma.task.findMany({
        where: {
            projectId,
        },
        orderBy: {
            createdAt: "desc"
        },
    });
};

export const getWorkspaceTasksService = async (
    workspaceId: string,
    filters: {
        status?: "TODO" | "IN_PROGRESS" | "DONE";
        assigneeId?: string;
    },
    userId: string,
    pagination: { page: number; limit: number }
) => {
    await assertWorkspaceMember(userId, workspaceId);

    const where = {
        project: {
            workspaceId,
        },
        ...(filters.status && { status: filters.status }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    };

    const [data, total] = await Promise.all([
        prisma.task.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
        }),
        prisma.task.count({ where }),
    ]);

    return {
        data,
        meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
        },
    };
};

export const getTaskService = async (
    taskId: string,
    workspaceId: string,
    userId: string
) => {
    await assertWorkspaceMember(userId, workspaceId);
    await assertTaskInWorkspace(taskId, workspaceId);

    return prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                workspaceId,
            },
        },
        include: {
            project: true,
        },
    });
};

export const updateTaskService = async (
    taskId: string,
    workspaceId: string,
    userId: string,
    updates: {
        title?: string;
        status?: "TODO" | "IN_PROGRESS" | "DONE";
        assigneeId?: string | null;
    }
) => {
    await assertWorkspaceMember(userId, workspaceId);
    await assertTaskInWorkspace(taskId, workspaceId);

    if (updates.assigneeId) {
        await assertUserInWorkspace(updates.assigneeId, workspaceId);
    }

    return prisma.task.update({
        where: {
            id: taskId,
        },
        data: updates,
    });
};

export const deleteTaskService = async (
    taskId: string,
    workspaceId: string,
    userId: string
) => {
    await assertWorkspaceRole(userId, workspaceId, ["ADMIN"]);
    await assertTaskInWorkspace(taskId, workspaceId);

    return prisma.task.delete({
        where: {
            id: taskId,
        },
    });
};