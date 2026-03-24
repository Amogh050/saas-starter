import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY!;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY!;

export const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

type AccessTokenPayload = {
    userId: string;
    workspaceId: string;
    role?: string;
    type?: string;
};

type RefreshTokenPayload = {
    userId: string;
    type?: string;
};

export function generateAccessToken(payload: Omit<AccessTokenPayload, "type">) {
    return jwt.sign({ ...payload, type: "access" }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
    });
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, "type">) {
    return jwt.sign({ ...payload, type: "refresh" }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}