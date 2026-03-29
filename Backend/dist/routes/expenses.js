"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// ─── POST /api/expenses — Create a new expense ──────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { userId, amount, spentCurrency, category, description, date, receiptUrl, ocrData, status, // "DRAFT" or "PENDING_APPROVAL"
         } = req.body;
        // Validate required fields
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        if (!category) {
            res.status(400).json({ error: "category is required" });
            return;
        }
        if (status && !["DRAFT", "PENDING_APPROVAL"].includes(status)) {
            res.status(400).json({ error: "status must be DRAFT or PENDING_APPROVAL" });
            return;
        }
        const expenseStatus = status || "DRAFT";
        // Create the expense
        const expense = await index_1.prisma.expense.create({
            data: {
                userId,
                amount: parseFloat(amount) || 0,
                spentCurrency: spentCurrency || "USD",
                category,
                description: description || "",
                date: date ? new Date(date) : new Date(),
                receiptUrl: receiptUrl || null,
                ocrData: ocrData || null,
                status: expenseStatus,
            },
        });
        // Add ExpenseHistory entry
        const actionText = expenseStatus === "DRAFT" ? "Draft Created" : "Submitted for Approval";
        await index_1.prisma.expenseHistory.create({
            data: {
                expenseId: expense.id,
                actionBy: userId,
                action: actionText,
                comments: expenseStatus === "PENDING_APPROVAL"
                    ? "Expense submitted and awaiting manager review."
                    : null,
            },
        });
        // If submitted for approval, also add "Assigned to Approver" history
        if (expenseStatus === "PENDING_APPROVAL") {
            // Look up the user's manager
            const user = await index_1.prisma.user.findUnique({
                where: { id: userId },
                select: { managerId: true, manager: { select: { name: true } } },
            });
            if (user?.managerId) {
                await index_1.prisma.expenseHistory.create({
                    data: {
                        expenseId: expense.id,
                        actionBy: "System",
                        action: "Assigned to Approver",
                        comments: `Routed to ${user.manager?.name || "Manager"} (Manager)`,
                    },
                });
            }
        }
        // Fetch the full expense with history
        const fullExpense = await index_1.prisma.expense.findUnique({
            where: { id: expense.id },
            include: {
                history: { orderBy: { timestamp: "asc" } },
                user: { select: { name: true, email: true } },
            },
        });
        res.status(201).json(fullExpense);
    }
    catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Failed to create expense" });
    }
});
// ─── GET /api/expenses — Fetch user's expense history ────────────────────────
router.get("/", async (req, res) => {
    try {
        const userId = String(req.query.userId || "");
        if (!userId) {
            res.status(400).json({ error: "userId query parameter is required" });
            return;
        }
        const expenses = await index_1.prisma.expense.findMany({
            where: { userId },
            include: {
                history: { orderBy: { timestamp: "asc" } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(expenses);
    }
    catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});
// ─── GET /api/expenses/:id — Fetch single expense detail ─────────────────────
router.get("/:id", async (req, res) => {
    try {
        const id = String(req.params.id || "");
        const expense = await index_1.prisma.expense.findUnique({
            where: { id },
            include: {
                history: { orderBy: { timestamp: "asc" } },
                user: { select: { name: true, email: true } },
            },
        });
        if (!expense) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        res.json(expense);
    }
    catch (error) {
        console.error("Error fetching expense:", error);
        res.status(500).json({ error: "Failed to fetch expense" });
    }
});
// ─── PATCH /api/expenses/:id — Update a DRAFT expense ───────────────────────
router.patch("/:id", async (req, res) => {
    try {
        const id = String(req.params.id || "");
        // Only allow updating DRAFT expenses
        const existing = await index_1.prisma.expense.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        if (existing.status !== "DRAFT") {
            res.status(403).json({ error: "Only DRAFT expenses can be edited" });
            return;
        }
        const { amount, spentCurrency, category, description, date, receiptUrl, ocrData, status, // allow promoting from DRAFT → PENDING_APPROVAL
         } = req.body;
        if (status && !["DRAFT", "PENDING_APPROVAL"].includes(status)) {
            res.status(400).json({ error: "status must be DRAFT or PENDING_APPROVAL" });
            return;
        }
        const updated = await index_1.prisma.expense.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount: parseFloat(amount) }),
                ...(spentCurrency && { spentCurrency }),
                ...(category && { category }),
                ...(description !== undefined && { description }),
                ...(date && { date: new Date(date) }),
                ...(receiptUrl !== undefined && { receiptUrl }),
                ...(ocrData !== undefined && { ocrData }),
                ...(status && { status }),
            },
            include: {
                history: { orderBy: { timestamp: "asc" } },
                user: { select: { name: true, email: true } },
            },
        });
        // Log status promotion
        if (status === "PENDING_APPROVAL") {
            await index_1.prisma.expenseHistory.create({
                data: {
                    expenseId: id,
                    actionBy: existing.userId,
                    action: "Submitted for Approval",
                    comments: "Expense submitted and awaiting manager review.",
                },
            });
            // Route to manager
            const user = await index_1.prisma.user.findUnique({
                where: { id: existing.userId },
                select: { managerId: true, manager: { select: { name: true } } },
            });
            if (user?.managerId) {
                await index_1.prisma.expenseHistory.create({
                    data: {
                        expenseId: id,
                        actionBy: "System",
                        action: "Assigned to Approver",
                        comments: `Routed to ${user.manager?.name || "Manager"} (Manager)`,
                    },
                });
            }
        }
        res.json(updated);
    }
    catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ error: "Failed to update expense" });
    }
});
// ─── DELETE /api/expenses/:id — Delete a DRAFT expense ───────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const id = String(req.params.id || "");
        const existing = await index_1.prisma.expense.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        if (existing.status !== "DRAFT") {
            res.status(403).json({ error: "Only DRAFT expenses can be deleted" });
            return;
        }
        // Delete history entries first (FK constraint)
        await index_1.prisma.expenseHistory.deleteMany({ where: { expenseId: id } });
        await index_1.prisma.expense.delete({ where: { id } });
        res.json({ message: "Draft deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Failed to delete expense" });
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map