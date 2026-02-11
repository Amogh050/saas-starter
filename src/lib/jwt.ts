import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(payload: {
    userId: string;
    workspaceId: string;
}) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
};

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as {
        userId: string;
        workspaceId: string;
    };
};