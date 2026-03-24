import express from "express";
import cors from "cors";
import cron from "node-cron";

import { deleteExpiredTokens } from "./jobs/cleanupTokens.js";

import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/", testRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/workspace", workspaceRoutes);
// TODO: app.use("/api/users", userRoutes); — add once user.routes.ts is created

// Run every day at midnight
cron.schedule("0 0 * * *", deleteExpiredTokens);

export default app;
