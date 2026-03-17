import { prisma } from "../lib/prisma.js";

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
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

    if (assigneeId) {
        const member = await prisma.workspaceMember.findFirst({
            where: {
                userId: assigneeId,
                workspaceId,
            },
        });

        if (!member) {
            throw new Error("ASSIGNEE_NOT_IN_WORKSPACE");
        }
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

export const getTasksByProjectService = async (projectId: string, workspaceId: string) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            workspaceId,
        },
    });

    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

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
    }
) => {
    return prisma.task.findMany({
        where: {
            project: {
                workspaceId,
            },
            ...(filters.status && { status: filters.status }),
            ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getTaskService = async (
    taskId: string,
    workspaceId: string
) => {
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
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                workspaceId,
            },
        },
    });

    if (!task) {
        throw new Error("TASK_NOT_FOUND");
    }

    if (updates.assigneeId) {
        const member = await prisma.workspaceMember.findFirst({
            where: {
                userId: updates.assigneeId,
                workspaceId,
            },
        });

        if (!member) {
            throw new Error("ASSIGNEE_NOT_IN_WORKSPACE");
        }
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
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: {
                workspaceId,
            },
        },
    });

    if (!task) {
        throw new Error("TASK_NOT_FOUND");
    }

    return prisma.task.delete({
        where: {
            id: taskId,
        },
    });
};