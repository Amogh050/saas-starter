import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } from "../lib/jwt.js";

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
    //transaction – if any step fails, everything is rolled back
    return await prisma.$transaction(async (tx) => {
        // 1 - Check existing user
        const existing = await tx.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        // 2 - hash password (bcrypt, saltRounds: 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3 - create user
        const user = await tx.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        // 4 - create workspace
        const workspace = await tx.workspace.create({
            data: {
                name: `${name}'s Workspace`,
                ownerId: user.id,
            },
        });

        // 5 - create workspace member with role "ADMIN"
        await tx.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: "ADMIN",
            },
        });

        // 6 - create subscription
        await tx.subscription.create({
            data: {
                workspaceId: workspace.id,
                plan: "FREE",
                status: "ACTIVE",
                periodStart: new Date(),
                periodEnd: null,
            },
        });

        // 7 - generate access token (15m) with payload { userId, workspaceId, role: "admin" }
        const accessToken = generateAccessToken({
            userId: user.id,
            workspaceId: workspace.id,
            role: "admin",
        });

        // 8 - generate refresh token (7d) with payload { userId }
        const refreshToken = generateRefreshToken({
            userId: user.id,
        });

        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await tx.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            }
        });

        // 9 - Return both tokens (along with IDs)
        return {
            userId: user.id,
            workspaceId: workspace.id,
            accessToken,
            refreshToken,
        };
    });
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

    const tokenPayload = { userId: user.id, workspaceId };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt,
        }
    });

    return {
        userId: user.id,
        workspaceId,
        accessToken,
        refreshToken,
    };
};

export const refreshService = async (refreshToken: string, ipAddress?: string, deviceId?: string) => {
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            tokenHash: hashToken(refreshToken),
            userId: payload.userId,
            revoked: false,
            expiresAt: { gt: new Date() }
        }
    });

    if (!storedToken) {
        throw new Error("REFRESH_TOKEN_NOT_RECOGNIZED");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
            memberships: {
                include: { workspace: true },
            },
        },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const workspaceId =
        user.memberships[0]?.workspaceId ??
        (await prisma.workspace.findFirst({
            where: { ownerId: user.id },
        }))?.id;

    if (!workspaceId) throw new Error("WORKSPACE_NOT_FOUND");

    const accessToken = generateAccessToken({ userId: user.id, workspaceId });
    const newRefreshToken = generateRefreshToken({ userId: user.id });
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
        prisma.refreshToken.delete({
            where: { id: storedToken.id }
        }),
        prisma.refreshToken.create({
            data: {
                tokenHash: hashToken(newRefreshToken),
                userId: payload.userId,
                deviceId: storedToken.deviceId || deviceId,
                ipAddress: ipAddress || storedToken.ipAddress,
                expiresAt: newExpiresAt,
            }
        })
    ]);

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

export const logoutService = async (refreshToken?: string) => {
    if (refreshToken) {
        await prisma.refreshToken.deleteMany({
            where: { tokenHash: hashToken(refreshToken) }
        });
    }
    return { message: "Logged out successfully" };
};

export const logoutAllService = async (userId: string) => {
    await prisma.refreshToken.deleteMany({
        where: { userId }
    });
    return { message: "Logged out from all devices" };
};