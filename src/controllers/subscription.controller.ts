import { Response } from "express";
import { AuthRequest } from "../types/auth.js";
import { getSubscriptionService, updateSubscriptionService } from "../services/subscription.service.js";

export const getSubscription = async (req: AuthRequest, res: Response) => {
    try {
        const subscription = await getSubscriptionService(req.user!.workspaceId);

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.json(subscription);
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
    const { plan } = req.body;

    if (!plan || !["FREE", "PRO"].includes(plan)) {
        return res.status(400).json({ message: "Valid plan required (FREE or PRO)" });
    }

    try {
        const subscription = await updateSubscriptionService({
            workspaceId: req.user!.workspaceId,
            userId: req.user!.userId,
            plan,
        });

        res.json(subscription);
    } catch (error: any) {
        if (error.message === "NOT_WORKSPACE_OWNER") {
            return res.status(403).json({ message: "Not workspace owner" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
