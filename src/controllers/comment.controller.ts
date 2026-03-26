import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { createCommentService, getCommentsService } from "../services/comment.service.js";
import { handleControllerError } from "../lib/handleControllerError.js";

export const createComment = async (req: AuthRequest, res: Response) => {
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!content) {
        return res.status(400).json({ message: "Comment content required" });
    }

    try {
        const comment = await createCommentService(
            req.params.taskId as string,
            content,
            req.user!.workspaceId,
            req.user!.userId
        );

        res.status(201).json(comment);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const comments = await getCommentsService(
            req.params.taskId as string,
            req.user!.workspaceId,
            req.user!.userId
        );

        res.json(comments);
    } catch (error: any) {
        handleControllerError(error, res);
    }
};
