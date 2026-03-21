import express from "express";
import cors from "cors";

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
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/workspace", workspaceRoutes);

export default app;
