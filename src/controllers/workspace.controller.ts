import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import {
    getWorkspaceService,
    updateWorkspaceService,
    addMemberService,
    getMembersService,
    removeMemberService,
} from "../services/workspace.service.js";

export const getWorkspace = async (req: AuthRequest, res: Response) => {
    try {
        const workspace = await getWorkspaceService(req.user!.workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        res.json(workspace);
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
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
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        res.status(500).json({ message: "Internal server error" });
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
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "User not found" });
        }
        if (error.message === "ALREADY_A_MEMBER") {
            return res.status(409).json({ message: "User is already a member" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
    try {
        const members = await getMembersService(req.user!.workspaceId);

        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
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
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        if (error.message === "MEMBER_NOT_FOUND") {
            return res.status(404).json({ message: "Member not found" });
        }
        if (error.message === "CANNOT_REMOVE_OWNER") {
            return res.status(400).json({ message: "Cannot remove workspace owner" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
