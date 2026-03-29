import express from "express";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expenses";
import ocrRoutes from "./routes/ocr";

dotenv.config();

// ── Prisma Client (shared across routes) ────────────────────────────────────
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipts as static files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expenses", ocrRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

export default app;
