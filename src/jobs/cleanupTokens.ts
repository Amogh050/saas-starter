import { prisma } from "../lib/prisma.js";

export const deleteExpiredTokens = async () => {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
        console.log(`Cleaned up ${result.count} expired refresh tokens`);
    } catch (error) {
        console.error("Failed to clean up expired tokens:", error);
    }
};
