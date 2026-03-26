import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";
import { ErrorCodes } from "../lib/errorCodes.js";

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            preferences: true,
            createdAt: true,
            updatedAt: true,
            memberships: {
                include: {
                    workspace: true
                }
            }
        }
    });

    if (!user) {
        throw new AppError(404, ErrorCodes.USER_NOT_FOUND, "User not found");
    }

    return user;
};

export const updateUserProfile = async (
    userId: string,
    data: { name?: string; avatar?: string; preferences?: any }
) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.avatar !== undefined && { avatar: data.avatar }),
            ...(data.preferences && { preferences: data.preferences }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            preferences: true,
            updatedAt: true,
        }
    });

    return user;
};

export const changeUserPassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(404, ErrorCodes.USER_NOT_FOUND, "User not found");
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        throw new AppError(401, "INVALID_CURRENT_PASSWORD", "Invalid current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: "Password updated successfully" };
};

export const deleteUserAccount = async (userId: string) => {
    await prisma.$transaction(async (tx) => {
        // Find workspaces owned by user
        const ownedWorkspaces = await tx.workspace.findMany({
            where: { ownerId: userId }
        });

        // 1. Delete memberships
        await tx.workspaceMember.deleteMany({ where: { userId } });

        // 2. Unassign tasks
        await tx.task.updateMany({
            where: { assigneeId: userId },
            data: { assigneeId: null }
        });

        // 3. Handle owned workspaces (delete them)
        for (const workspace of ownedWorkspaces) {
            // In a real app, we might want to transfer ownership or delete everything
            // For now, let's delete the workspace related data
            await tx.subscription.deleteMany({ where: { workspaceId: workspace.id } });
            await tx.task.deleteMany({ where: { project: { workspaceId: workspace.id } } });
            await tx.project.deleteMany({ where: { workspaceId: workspace.id } });
            await tx.workspaceMember.deleteMany({ where: { workspaceId: workspace.id } });
            await tx.workspace.delete({ where: { id: workspace.id } });
        }

        // 4. Finally delete the user
        await tx.user.delete({ where: { id: userId } });
    });

    return { message: "Account deleted successfully" };
};
