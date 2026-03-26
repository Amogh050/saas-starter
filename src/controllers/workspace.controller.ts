import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import {
    getWorkspaceService,
    updateWorkspaceService,
    addMemberService,
    getMembersService,
    removeMemberService,
} from "../services/workspace.service.js";
import { handleControllerError } from "../lib/handleControllerError.js";

export const getWorkspace = async (req: AuthRequest, res: Response) => {
    try {
        const workspace = await getWorkspaceService(req.user!.workspaceId, req.user!.userId);
        res.json(workspace);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const updateWorkspace = async (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Workspace name required" });
    }

    try {
        const workspace = await updateWorkspaceService({
            workspaceId: req.user!.workspaceId,
            userId: req.user!.userId,
            name,
        });

        res.json(workspace);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const addMember = async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }

    try {
        const member = await addMemberService({
            workspaceId: req.user!.workspaceId,
            userId: req.user!.userId,
            memberEmail: email,
        });

        res.status(201).json(member);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
    try {
        const members = await getMembersService(req.user!.workspaceId, req.user!.userId);
        res.json(members);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
    const { memberId } = req.params as { memberId: string };

    try {
        await removeMemberService({
            workspaceId: req.user!.workspaceId,
            userId: req.user!.userId,
            memberId,
        });

        res.json({ message: "Member removed successfully" });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};
