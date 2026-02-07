import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

type SignupInput = {
    email: string,
    password: string,
    name: string
};

export const signupService = async ({ email, password, name, }: SignupInput) => {
    //Check exsisting user
    const exsisting = await prisma.user.findUnique({
        where: { email },
    });

    if (exsisting) {
        throw new Error("User already exsist");
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //transaction
    const result = await prisma.$transaction(async (tx) => {
        // 1 - create user
        const user = await tx.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        // 2 - create workspace
        const workspace = await tx.workspace.create({
            data: {
                ownerId: user.id,
            },
        });

        // 3 - create subscription
        const subscription = await tx.subscription.create({
            data: {
                workspaceId: workspace.id,
                plan: "FREE",
                status: "ACTIVE",
            }
        });

        return { user, workspace, subscription };
    });

    return {
        userId: result.user.id,
        workspaceId: result.workspace.id,
    };
};