import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";

type SignupInput = {
    email: string,
    password: string,
    name: string
};

type LoginInput = {
    email: string,
    password: string,
};

export const signupService = async ({ email, password, name }: SignupInput) => {
    //Check exsisting user
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10); //TODO: modify this to 12 before the final roll out

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

    const token = generateToken({
        userId: result.user.id,
        workspaceId: result.workspace.id,
    });

    return {
        userId: result.user.id,
        workspaceId: result.workspace.id,
        token
    };
};

export const loginService = async ({ email, password }: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            memberships: {
                include: {
                    workspace: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // Get workspace
    const workspaceId =
        user.memberships[0]?.workspaceId ??
        (await prisma.workspace.findFirst({
            where: { ownerId: user.id },
        }))?.id;

    if (!workspaceId) {
        throw new Error("WORKSPACE_NOT_FOUND");
    }

    const token = generateToken({
        userId: user.id,
        workspaceId,
    });

    return {
        userId: user.id,
        workspaceId,
        token,
    };
};