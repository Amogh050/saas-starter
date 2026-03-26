import { Request } from "express";

export type AuthUser = {
    userId: string;
    workspaceId: string;
    type?: string;
};

export interface AuthRequest extends Request {
    user?: AuthUser;
}