import { prisma } from "../lib/prisma.js";
import { 
    assertWorkspaceMember, 
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
    userId: string
) => {
    await assertWorkspaceMember(userId, workspaceId);

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
    await assertWorkspaceMember(userId, workspaceId);
    await assertTaskInWorkspace(taskId, workspaceId);

    return prisma.task.delete({
        where: {
            id: taskId,
        },
    });
};