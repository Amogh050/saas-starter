import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

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

export default app;
