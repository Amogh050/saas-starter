import { prisma } from "../lib/prisma.js";

export const getWorkspaceService = async (workspaceId: string) => {
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
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

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
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

    const memberUser = await prisma.user.findUnique({
        where: { email: memberEmail },
    });

    if (!memberUser) {
        throw new Error("USER_NOT_FOUND");
    }

    const existing = await prisma.workspaceMember.findFirst({
        where: {
            userId: memberUser.id,
            workspaceId,
        },
    });

    if (existing) {
        throw new Error("ALREADY_A_MEMBER");
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

export const getMembersService = async (workspaceId: string) => {
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
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (workspace?.ownerId !== userId) {
        throw new Error("NOT_WORKSPACE_OWNER");
    }

    const member = await prisma.workspaceMember.findFirst({
        where: {
            id: memberId,
            workspaceId,
        },
    });

    if (!member) {
        throw new Error("MEMBER_NOT_FOUND");
    }

    if (member.userId === workspace.ownerId) {
        throw new Error("CANNOT_REMOVE_OWNER");
    }

    return prisma.workspaceMember.delete({
        where: { id: memberId },
    });
};
