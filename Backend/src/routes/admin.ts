import express, { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireAdmin);

// ─── GET /api/admin/rules ──────────────────────────────────────────────────
// Fetch all approval rules, optionally filtered by userId
// Query params:
//   ?userId=<id>  → returns the rule for a specific user
//   (none)        → returns all rules across the organization
router.get('/rules', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.query;

    if (userId && typeof userId === 'string') {
      // Fetch rule for a specific user
      const rule = await prisma.approvalRule.findUnique({
        where: { userId },
        include: {
          approvers: {
            orderBy: { sequenceOrder: 'asc' },
          },
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      if (!rule) {
        return res.status(404).json({ error: 'No approval rule found for this user.' });
      }

      return res.json({ rule });
    }

    // Fetch all rules
    const rules = await prisma.approvalRule.findMany({
      include: {
        approvers: {
          orderBy: { sequenceOrder: 'asc' },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ rules });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return res.status(500).json({ error: 'Failed to fetch approval rules.' });
  }
});

// ─── POST /api/admin/rules ─────────────────────────────────────────────────
// Create or update an approval rule for a specific user.
// Body:
// {
//   userId: string,
//   description?: string,
//   isManagerApprover: boolean,
//   managerOverrideId?: string | null,
//   flowType: "SEQUENTIAL" | "PARALLEL",
//   minApprovalPercentage: number,
//   approvers: [
//     { approverId: string, isRequired: boolean, sequenceOrder: number }
//   ]
// }
router.post('/rules', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      userId,
      description,
      isManagerApprover,
      managerOverrideId,
      flowType,
      minApprovalPercentage,
      approvers,
    } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    if (!flowType || !['SEQUENTIAL', 'PARALLEL'].includes(flowType)) {
      return res.status(400).json({ error: 'flowType must be SEQUENTIAL or PARALLEL.' });
    }

    const approvalPct = Number(minApprovalPercentage);
    if (isNaN(approvalPct) || approvalPct < 1 || approvalPct > 100) {
      return res.status(400).json({ error: 'minApprovalPercentage must be between 1 and 100.' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    // Verify managerOverrideId exists if provided
    if (managerOverrideId) {
      const managerExists = await prisma.user.findUnique({ where: { id: managerOverrideId } });
      if (!managerExists) {
        return res.status(404).json({ error: 'Manager override user not found.' });
      }
    }

    // Verify all approver IDs exist
    if (approvers && Array.isArray(approvers) && approvers.length > 0) {
      const approverIds = approvers.map((a: any) => a.approverId);
      const existingApprovers = await prisma.user.findMany({
        where: { id: { in: approverIds } },
        select: { id: true },
      });
      const existingIds = new Set(existingApprovers.map((u) => u.id));
      const missingIds = approverIds.filter((id: string) => !existingIds.has(id));

      if (missingIds.length > 0) {
        return res.status(404).json({
          error: `The following approver IDs were not found: ${missingIds.join(', ')}`,
        });
      }
    }

    // Check if rule already exists for this user → update
    const existingRule = await prisma.approvalRule.findUnique({
      where: { userId },
    });

    let rule;

    if (existingRule) {
      // Update existing rule — first delete old approvers, then recreate
      await prisma.ruleApprover.deleteMany({
        where: { ruleId: existingRule.id },
      });

      rule = await prisma.approvalRule.update({
        where: { id: existingRule.id },
        data: {
          description: description || existingRule.description,
          isManagerApprover: isManagerApprover !== undefined ? isManagerApprover : existingRule.isManagerApprover,
          managerOverrideId: managerOverrideId !== undefined ? managerOverrideId : existingRule.managerOverrideId,
          flowType,
          minApprovalPercentage: approvalPct,
          approvers: {
            create: (approvers || []).map((a: any, index: number) => ({
              approverId: a.approverId,
              isRequired: a.isRequired ?? false,
              sequenceOrder: a.sequenceOrder ?? index + 1,
            })),
          },
        },
        include: {
          approvers: { orderBy: { sequenceOrder: 'asc' } },
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.json({
        message: 'Approval rule updated successfully.',
        rule,
      });
    } else {
      // Create new rule
      rule = await prisma.approvalRule.create({
        data: {
          userId,
          description: description || null,
          isManagerApprover: isManagerApprover ?? true,
          managerOverrideId: managerOverrideId || null,
          flowType: flowType || 'SEQUENTIAL',
          minApprovalPercentage: approvalPct,
          approvers: {
            create: (approvers || []).map((a: any, index: number) => ({
              approverId: a.approverId,
              isRequired: a.isRequired ?? false,
              sequenceOrder: a.sequenceOrder ?? index + 1,
            })),
          },
        },
        include: {
          approvers: { orderBy: { sequenceOrder: 'asc' } },
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(201).json({
        message: 'Approval rule created successfully.',
        rule,
      });
    }
  } catch (error) {
    console.error('Error creating/updating rule:', error);
    return res.status(500).json({ error: 'Failed to create/update approval rule.' });
  }
});

// ─── DELETE /api/admin/rules/:ruleId ────────────────────────────────────────
// Delete an approval rule and all its approvers
router.delete('/rules/:ruleId', async (req: Request, res: Response): Promise<any> => {
  try {
    const ruleId = req.params['ruleId'] as string;

    const rule = await prisma.approvalRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found.' });
    }

    // Delete approvers first (cascade), then the rule
    await prisma.ruleApprover.deleteMany({ where: { ruleId: ruleId } });
    await prisma.approvalRule.delete({ where: { id: ruleId } });

    return res.json({ message: 'Approval rule deleted successfully.' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return res.status(500).json({ error: 'Failed to delete approval rule.' });
  }
});

// ─── GET /api/admin/users ──────────────────────────────────────────────────
// List all users (for approver dropdowns in the Admin UI)
router.get('/users', async (_req: Request, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─── GET /api/admin/stats ──────────────────────────────────────────────────
// Dashboard analytics: spending trends, approval bottlenecks, expense statistics
router.get('/stats', async (_req: Request, res: Response): Promise<any> => {
  try {
    // 1. Total expenses by status
    const statusCounts = await prisma.expense.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    });

    // 2. Expenses by category
    const categoryCounts = await prisma.expense.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // 3. Monthly spending trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentExpenses = await prisma.expense.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, { total: number; count: number; approved: number; rejected: number; pending: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const exp of recentExpenses) {
      const key = `${monthNames[exp.createdAt.getMonth()]} ${exp.createdAt.getFullYear()}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { total: 0, count: 0, approved: 0, rejected: 0, pending: 0 };
      }
      monthlyData[key]!.total += exp.amount;
      monthlyData[key]!.count += 1;
      if (exp.status === 'APPROVED') monthlyData[key]!.approved += 1;
      else if (exp.status === 'REJECTED') monthlyData[key]!.rejected += 1;
      else if (exp.status === 'PENDING_APPROVAL') monthlyData[key]!.pending += 1;
    }

    const monthlyTrends = Object.entries(monthlyData).map(([name, data]) => ({
      name,
      ...data,
    }));

    // 4. Approval bottlenecks — approvers with most PENDING requests
    const pendingByApprover = await prisma.approvalRequest.groupBy({
      by: ['approverId'],
      where: { status: 'PENDING' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Fetch approver names
    const approverIds = pendingByApprover.map((p) => p.approverId);
    const approverUsers = await prisma.user.findMany({
      where: { id: { in: approverIds } },
      select: { id: true, name: true },
    });
    const approverNameMap = new Map(approverUsers.map((u) => [u.id, u.name]));

    const bottlenecks = pendingByApprover.map((p) => ({
      approverId: p.approverId,
      approverName: approverNameMap.get(p.approverId) || 'Unknown',
      pendingCount: p._count.id,
    }));

    // 5. Total metrics
    const totalExpenses = await prisma.expense.count();
    const totalAmount = await prisma.expense.aggregate({ _sum: { amount: true } });
    const totalUsers = await prisma.user.count();
    const totalRules = await prisma.approvalRule.count();

    return res.json({
      overview: {
        totalExpenses,
        totalAmount: totalAmount._sum.amount || 0,
        totalUsers,
        totalRules,
      },
      statusCounts: statusCounts.map((s) => ({
        status: s.status,
        count: s._count.id,
        total: s._sum.amount || 0,
      })),
      categoryCounts: categoryCounts.map((c) => ({
        category: c.category,
        count: c._count.id,
        total: c._sum.amount || 0,
      })),
      monthlyTrends,
      bottlenecks,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
});

export default router;
