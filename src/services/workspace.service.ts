import { prisma } from "../lib/prisma.js";
import { assertWorkspaceRole, assertWorkspaceMember } from "./authorization.service.js";
import { AppError } from "../lib/AppError.js";
import { ErrorCodes } from "../lib/errorCodes.js";

export const getWorkspaceService = async (workspaceId: string, userId: string) => {
    await assertWorkspaceMember(userId, workspaceId);

    return prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            owner: {
                select: { id: true, email: true, name: true },
            },
            _count: {
                select: { members: true },
            },
        },
    });
};

export const updateWorkspaceService = async ({
    workspaceId,
    userId,
    name,
}: {
    workspaceId: string;
    userId: string;
    name: string;
}) => {
    await assertWorkspaceRole(userId, workspaceId, ["ADMIN"]);

    return prisma.workspace.update({
        where: { id: workspaceId },
        data: { name },
    });
};

export const addMemberService = async ({
    workspaceId,
    userId,
    memberEmail,
}: {
    workspaceId: string;
    userId: string;
    memberEmail: string;
}) => {
    await assertWorkspaceRole(userId, workspaceId, ["ADMIN"]);

    const memberUser = await prisma.user.findUnique({
        where: { email: memberEmail },
    });

    if (!memberUser) {
        throw new AppError(404, ErrorCodes.USER_NOT_FOUND, "User not found");
    }

    const existing = await prisma.workspaceMember.findFirst({
        where: {
            userId: memberUser.id,
            workspaceId,
        },
    });

    if (existing) {
        throw new AppError(409, ErrorCodes.ALREADY_A_MEMBER, "User is already a member");
    }

    return prisma.workspaceMember.create({
        data: {
            userId: memberUser.id,
            workspaceId,
            role: "MEMBER",
        },
        include: {
            user: {
                select: { id: true, email: true, name: true },
            },
        },
    });
};

export const getMembersService = async (workspaceId: string, userId: string) => {
    await assertWorkspaceMember(userId, workspaceId);

    return prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: { id: true, email: true, name: true },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
};

export const removeMemberService = async ({
    workspaceId,
    userId,
    memberId,
}: {
    workspaceId: string;
    userId: string;
    memberId: string;
}) => {
    await assertWorkspaceRole(userId, workspaceId, ["ADMIN"]);

    const member = await prisma.workspaceMember.findFirst({
        where: {
            id: memberId,
            workspaceId,
        },
    });

    if (!member) {
        throw new AppError(404, ErrorCodes.MEMBER_NOT_FOUND, "Member not found");
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace && member.userId === workspace.ownerId) {
        throw new AppError(400, ErrorCodes.CANNOT_REMOVE_OWNER, "Cannot remove workspace owner");
    }

    return prisma.workspaceMember.delete({
        where: { id: memberId },
    });
};
