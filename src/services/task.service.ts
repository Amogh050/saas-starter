import { prisma } from "../lib/prisma.js";

export const createTaskService = async ({
    title,
    description,
    projectId,
    assigneeId,
    workspaceId,
}: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    workspaceId: string;
}) => {

    if(assigneeId){
        const member = await prisma.workspaceMember.findFirst({
            where: {
                userId: assigneeId,
                workspaceId,
            },
        });

        if(!member) {
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