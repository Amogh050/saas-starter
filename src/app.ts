import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/", testRoutes);

export default app;
