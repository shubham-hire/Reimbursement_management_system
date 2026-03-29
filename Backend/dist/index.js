"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ── Prisma Client (shared across routes) ────────────────────────────────────
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ── Middleware ───────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded receipts as static files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
// ── Routes ──────────────────────────────────────────────────────────────────
const expenses_1 = __importDefault(require("./routes/expenses"));
const ocr_1 = __importDefault(require("./routes/ocr"));
app.use("/api/expenses", expenses_1.default);
app.use("/api/expenses", ocr_1.default);
// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map