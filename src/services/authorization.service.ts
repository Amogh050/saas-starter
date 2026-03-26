import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";
import { ErrorCodes } from "../lib/errorCodes.js";
import { AllowedRole } from "../types/roles.js";

export const assertWorkspaceExists = async (workspaceId: string) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });
    if (!workspace) {
        throw new AppError(404, ErrorCodes.WORKSPACE_NOT_FOUND, "Workspace not found");
    }
    return workspace;
};

export const assertWorkspaceMember = async (userId: string, workspaceId: string) => {
    const member = await prisma.workspaceMember.findFirst({
        where: { userId, workspaceId },
    });
    if (!member) {
        throw new AppError(403, ErrorCodes.NOT_WORKSPACE_MEMBER, "Not a member of this workspace");
    }
    return member;
};

export const assertWorkspaceRole = async (userId: string, workspaceId: string, allowedRoles: AllowedRole[]) => {
    const member = await prisma.workspaceMember.findFirst({
        where: { userId, workspaceId },
    });
    
    if (!member) {
        throw new AppError(403, ErrorCodes.NOT_WORKSPACE_MEMBER, "Not a member of this workspace");
    }

    if (!allowedRoles.includes(member.role as AllowedRole)) {
        throw new AppError(403, ErrorCodes.INSUFFICIENT_ROLE, "Insufficient role permissions");
    }

    return member;
};

export const assertProjectInWorkspace = async (projectId: string, workspaceId: string) => {
    const project = await prisma.project.findFirst({
        where: { id: projectId, workspaceId },
    });
    if (!project) {
        throw new AppError(404, ErrorCodes.PROJECT_NOT_FOUND, "Project not found");
    }
    return project;
};

export const assertTaskInWorkspace = async (taskId: string, workspaceId: string) => {
    const task = await prisma.task.findFirst({
        where: { id: taskId, project: { workspaceId } },
    });
    if (!task) {
        throw new AppError(404, ErrorCodes.TASK_NOT_FOUND, "Task not found");
    }
    return task;
};

export const assertUserInWorkspace = async (userId: string, workspaceId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError(404, ErrorCodes.USER_NOT_FOUND, "User not found");
    }

    const member = await prisma.workspaceMember.findFirst({
        where: { userId, workspaceId },
    });
    if (!member) {
        throw new AppError(403, ErrorCodes.NOT_WORKSPACE_MEMBER, "User is not a member of this workspace");
    }
    
    return member;
};
