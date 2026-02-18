import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
