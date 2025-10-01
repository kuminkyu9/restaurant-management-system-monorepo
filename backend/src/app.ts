// 미들웨어, 라우트, 에러 핸들러를 포함한 Express 앱 구성만 담당

// src/app.ts
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
import { requireRole } from "./middleware/roles";
import { errorHandler } from "./middleware/error";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);

// 예: 보호 라우트
app.get("/owner/protected", authMiddleware, requireRole("OWNER"), (_req, res) => {
    res.json({ status: "ok", data: "owner only" });
});

app.use(errorHandler);
export default app;
