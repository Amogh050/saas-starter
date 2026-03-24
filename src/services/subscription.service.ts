import { prisma } from "../lib/prisma.js";

export const getSubscriptionService = async (workspaceId: string) => {
    return prisma.subscription.findUnique({
        where: { workspaceId },
    });
};

export const updateSubscriptionService = async ({
    workspaceId,
    userId,
    plan,
}: {
    workspaceId: string;
    userId: string;
    plan: "FREE" | "PRO";
}) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) throw new Error("WORKSPACE_NOT_FOUND");

    return prisma.subscription.update({
        where: { workspaceId },
        data: {
            plan,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
};
