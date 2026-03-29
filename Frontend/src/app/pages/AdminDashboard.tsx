import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  GitMerge,
  GitPullRequest,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  Ban,
  Lock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const API_BASE = "http://localhost:5000/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RuleApprover {
  id: string;
  approverId: string;
  isRequired: boolean;
  sequenceOrder: number;
}

interface ApprovalRule {
  id: string;
  userId: string;
  description: string | null;
  isManagerApprover: boolean;
  managerOverrideId: string | null;
  flowType: "SEQUENTIAL" | "PARALLEL";
  minApprovalPercentage: number;
  approvers: RuleApprover[];
  user?: AdminUser;
  createdAt: string;
}

interface NewApprover {
  approverId: string;
  isRequired: boolean;
  sequenceOrder: number;
}

interface StatsOverview {
  totalExpenses: number;
  totalAmount: number;
  totalUsers: number;
  totalRules: number;
}

interface StatusCount {
  status: string;
  count: number;
  total: number;
}

interface CategoryCount {
  category: string;
  count: number;
  total: number;
}

interface MonthlyTrend {
  name: string;
  total: number;
  count: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface Bottleneck {
  approverId: string;
  approverName: string;
  pendingCount: number;
}

interface AdminStats {
  overview: StatsOverview;
  statusCounts: StatusCount[];
  categoryCounts: CategoryCount[];
  monthlyTrends: MonthlyTrend[];
  bottlenecks: Bottleneck[];
}

// ─── Mock data fallback (when API isn't available yet) ──────────────────────
const fallbackStats: AdminStats = {
  overview: { totalExpenses: 47, totalAmount: 32450, totalUsers: 12, totalRules: 5 },
  statusCounts: [
    { status: "APPROVED", count: 28, total: 18200 },
    { status: "PENDING_APPROVAL", count: 11, total: 9800 },
    { status: "REJECTED", count: 5, total: 2950 },
    { status: "DRAFT", count: 3, total: 1500 },
  ],
  categoryCounts: [
    { category: "Travel", count: 18, total: 14500 },
    { category: "Equipment", count: 10, total: 9200 },
    { category: "Food", count: 12, total: 5400 },
    { category: "Others", count: 7, total: 3350 },
  ],
  monthlyTrends: [
    { name: "Oct 2025", total: 4200, count: 8, approved: 5, rejected: 1, pending: 2 },
    { name: "Nov 2025", total: 5800, count: 10, approved: 7, rejected: 2, pending: 1 },
    { name: "Dec 2025", total: 3600, count: 7, approved: 4, rejected: 1, pending: 2 },
    { name: "Jan 2026", total: 6200, count: 9, approved: 6, rejected: 1, pending: 2 },
    { name: "Feb 2026", total: 7100, count: 8, approved: 5, rejected: 0, pending: 3 },
    { name: "Mar 2026", total: 5550, count: 5, approved: 3, rejected: 0, pending: 2 },
  ],
  bottlenecks: [
    { approverId: "1", approverName: "John Manager", pendingCount: 5 },
    { approverId: "2", approverName: "Sarah VP", pendingCount: 3 },
    { approverId: "3", approverName: "Mike Director", pendingCount: 2 },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981",
  PENDING_APPROVAL: "#f59e0b",
  REJECTED: "#ef4444",
  DRAFT: "#64748b",
};

const CATEGORY_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981"];

// ─── Utility ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("token");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {subtext && (
          <span className="text-xs font-medium text-slate-400">{subtext}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="capitalize">{item.dataKey}:</span>
          <span className="font-semibold text-slate-800">
            {item.dataKey === "total" ? formatCurrency(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "rules" | "guide">("analytics");
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>(fallbackStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // New rule form state
  const [newRule, setNewRule] = useState({
    userId: "",
    description: "",
    isManagerApprover: true,
    managerOverrideId: "",
    flowType: "SEQUENTIAL" as "SEQUENTIAL" | "PARALLEL",
    minApprovalPercentage: 100,
    approvers: [] as NewApprover[],
  });

  const token = getToken();

  // ─── Fetch data ──────────────────────────────────────────────────────────

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.warn("Failed to fetch rules, using empty list:", e);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.warn("Failed to fetch users:", e);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn("Failed to fetch stats, using fallback:", e);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRules(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchRules, fetchUsers, fetchStats]);

  // ─── Auto-dismiss messages ───────────────────────────────────────────────

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // ─── Rule form handlers ──────────────────────────────────────────────────

  const handleAddApprover = () => {
    setNewRule({
      ...newRule,
      approvers: [
        ...newRule.approvers,
        {
          approverId: "",
          isRequired: false,
          sequenceOrder: newRule.approvers.length + 1,
        },
      ],
    });
  };

  const updateApprover = (index: number, field: string, value: any) => {
    const updated = [...newRule.approvers];
    updated[index] = { ...updated[index]!, [field]: value };
    setNewRule({ ...newRule, approvers: updated });
  };

  const removeApprover = (index: number) => {
    const updated = newRule.approvers.filter((_, i) => i !== index);
    setNewRule({ ...newRule, approvers: updated });
  };

  const resetForm = () => {
    setNewRule({
      userId: "",
      description: "",
      isManagerApprover: true,
      managerOverrideId: "",
      flowType: "SEQUENTIAL",
      minApprovalPercentage: 100,
      approvers: [],
    });
  };

  const handleSaveRule = async () => {
    if (!newRule.userId) {
      setError("Please select a target user for this rule.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: newRule.userId,
          description: newRule.description || null,
          isManagerApprover: newRule.isManagerApprover,
          managerOverrideId: newRule.managerOverrideId || null,
          flowType: newRule.flowType,
          minApprovalPercentage: newRule.minApprovalPercentage,
          approvers: newRule.approvers.filter((a) => a.approverId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save rule.");
        return;
      }

      setSuccess(data.message || "Rule saved successfully!");
      resetForm();
      fetchRules();
    } catch (e) {
      setError("Network error. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this approval rule?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/rules/${ruleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess("Rule deleted successfully.");
        fetchRules();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete rule.");
      }
    } catch (e) {
      setError("Network error.");
    }
  };

  // ─── Resolve user name from ID ───────────────────────────────────────────

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId.substring(0, 8) + "...";
  };

  // ─── Pie chart data ──────────────────────────────────────────────────────

  const statusPieData = stats.statusCounts.map((s) => ({
    name: s.status.replace("_", " "),
    value: s.count,
    color: STATUS_COLORS[s.status] || "#94a3b8",
  }));

  const categoryPieData = stats.categoryCounts.map((c, i) => ({
    name: c.category,
    value: c.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Analytics overview and approval rule configuration
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            Promise.all([fetchRules(), fetchUsers(), fetchStats()]).then(() => setLoading(false));
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Toast Messages */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "analytics", label: "Analytics", icon: BarChart3 },
          { key: "rules", label: "Routing Rules", icon: GitPullRequest },
          { key: "guide", label: "How It Works", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`pb-3 px-5 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === tab.key
                ? "text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════ ANALYTICS TAB ═══════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              label="Total Expenses"
              value={stats.overview.totalExpenses}
              color="#6366f1"
              subtext="all time"
            />
            <StatCard
              icon={DollarSign}
              label="Total Amount"
              value={formatCurrency(stats.overview.totalAmount)}
              color="#10b981"
              subtext="cumulative"
            />
            <StatCard
              icon={Users}
              label="Active Users"
              value={stats.overview.totalUsers}
              color="#06b6d4"
            />
            <StatCard
              icon={ShieldCheck}
              label="Active Rules"
              value={stats.overview.totalRules}
              color="#8b5cf6"
            />
          </div>

          {/* Charts Row 1: Spending Trends & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Spending Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Spending Trends
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monthly expense volume over the last 6 months
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.monthlyTrends}>
                  <defs>
                    <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradientTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown Donut */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 capitalize text-xs">{item.name.toLowerCase()}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Category Spend & Bottlenecks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryPieData} layout="vertical" barCategoryGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                    {categoryPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Approval Bottlenecks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Approval Bottlenecks
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Approvers with the most pending requests
              </p>
              {stats.bottlenecks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                  No bottlenecks detected. All clear!
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.bottlenecks.map((bn, idx) => {
                    const maxCount = stats.bottlenecks[0]?.pendingCount || 1;
                    const percentage = (bn.pendingCount / maxCount) * 100;
                    return (
                      <div key={bn.approverId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{bn.approverName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold text-slate-900">{bn.pendingCount}</span>
                            <span className="text-slate-500">pending</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Approval Flow Counts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-purple-500" />
              Expense Approval Pipeline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.statusCounts.map((sc) => {
                const color = STATUS_COLORS[sc.status] || "#94a3b8";
                const icons: Record<string, any> = {
                  DRAFT: FileText,
                  PENDING_APPROVAL: Clock,
                  APPROVED: CheckCircle2,
                  REJECTED: XCircle,
                };
                const Icon = icons[sc.status] || FileText;
                return (
                  <div
                    key={sc.status}
                    className="rounded-xl border p-4 hover:shadow-sm transition-all"
                    style={{ borderColor: `${color}30` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                        {sc.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{sc.count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(sc.total)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ RULES TAB ═══════════════ */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* ─── Create/Edit Rule Form ─── */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Plus className="w-5 h-5 mr-2" /> Create Approval Rule
              </h2>
              <p className="text-indigo-100 text-xs mt-1">
                Define how expenses route through approvers
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Target User */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Target User *
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer"
                  value={newRule.userId}
                  onChange={(e) => setNewRule({ ...newRule, userId: e.target.value })}
                >
                  <option value="">Select a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — {u.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Rule Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Employee Expenses"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                />
              </div>

              {/* Manager First Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block">Manager First</label>
                  <span className="text-xs text-slate-500">
                    Route to manager before custom approvers
                  </span>
                </div>
                <div
                  className={`w-12 h-6 rounded-full cursor-pointer flex items-center px-1 transition-colors duration-300 ${
                    newRule.isManagerApprover ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                  onClick={() => setNewRule({ ...newRule, isManagerApprover: !newRule.isManagerApprover })}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                      newRule.isManagerApprover ? "translate-x-5" : "translate-x-0"
                    }`}
                    style={{ width: 18, height: 18 }}
                  />
                </div>
              </div>

              {/* Manager Override ID */}
              {newRule.isManagerApprover && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Manager Override (Optional)
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={newRule.managerOverrideId}
                    onChange={(e) => setNewRule({ ...newRule, managerOverrideId: e.target.value })}
                  >
                    <option value="">Use direct manager (default)</option>
                    {users
                      .filter((u) => u.role === "MANAGER" || u.role === "ADMIN")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Flow Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                  Flow Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* SEQUENTIAL Card */}
                  <button
                    type="button"
                    className={`text-left rounded-xl border-2 p-3 transition-all duration-200 ${
                      newRule.flowType === "SEQUENTIAL"
                        ? "border-blue-500 bg-blue-50/60 shadow-sm shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setNewRule({ ...newRule, flowType: "SEQUENTIAL" })}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        newRule.flowType === "SEQUENTIAL" ? "bg-blue-600" : "bg-slate-300"
                      }`}>
                        <GitPullRequest className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-xs font-bold ${
                        newRule.flowType === "SEQUENTIAL" ? "text-blue-800" : "text-slate-700"
                      }`}>Sequential</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      One-by-one in strict order. Next approver only acts after previous approves.
                    </p>
                    {/* Mini flow visual */}
                    <div className="flex items-center gap-0.5 mt-2">
                      {["M", "F", "VP"].map((label, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <ArrowRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            newRule.flowType === "SEQUENTIAL"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>{label}</span>
                        </React.Fragment>
                      ))}
                      <ArrowRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                      <span className="text-[8px]">✅</span>
                    </div>
                  </button>

                  {/* PARALLEL Card */}
                  <button
                    type="button"
                    className={`text-left rounded-xl border-2 p-3 transition-all duration-200 ${
                      newRule.flowType === "PARALLEL"
                        ? "border-amber-500 bg-amber-50/60 shadow-sm shadow-amber-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setNewRule({ ...newRule, flowType: "PARALLEL" })}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        newRule.flowType === "PARALLEL" ? "bg-amber-500" : "bg-slate-300"
                      }`}>
                        <GitMerge className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-xs font-bold ${
                        newRule.flowType === "PARALLEL" ? "text-amber-800" : "text-slate-700"
                      }`}>Parallel</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      All at once. Approvers act simultaneously &amp; threshold decides outcome.
                    </p>
                    {/* Mini flow visual */}
                    <div className="flex items-center gap-0.5 mt-2">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        newRule.flowType === "PARALLEL"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>M</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                      <div className="flex gap-0.5">
                        {["F", "IT", "HR"].map((label, i) => (
                          <span key={i} className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            newRule.flowType === "PARALLEL"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>{label}</span>
                        ))}
                      </div>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                      <span className="text-[8px]">✅</span>
                    </div>
                  </button>
                </div>

                {/* Contextual explanation based on selection */}
                <div className={`mt-2.5 rounded-lg px-3 py-2 text-[11px] leading-relaxed flex items-start gap-2 transition-colors duration-200 ${
                  newRule.flowType === "SEQUENTIAL"
                    ? "bg-blue-50 border border-blue-100 text-blue-700"
                    : "bg-amber-50 border border-amber-100 text-amber-700"
                }`}>
                  <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
                  {newRule.flowType === "SEQUENTIAL" ? (
                    <span>
                      <strong>Sequential:</strong> Approvers are notified one at a time based on their sequence order.
                      Approver #2 only sees the request <em>after</em> #1 approves.
                      Best for strict hierarchies (Manager → Finance → VP).
                    </span>
                  ) : (
                    <span>
                      <strong>Parallel:</strong> All approvers are notified at the same time and act independently.
                      The expense is approved once the <em>Min Approval %</em> threshold is reached.
                      Best for committee reviews and cross-department approvals.
                    </span>
                  )}
                </div>
              </div>

              {/* Min Approval Percentage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Min Approval %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    max={100}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRule.minApprovalPercentage}
                    onChange={(e) =>
                      setNewRule({ ...newRule, minApprovalPercentage: Number(e.target.value) })
                    }
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-medium">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  {newRule.minApprovalPercentage >= 100
                    ? "100% → All approvers must approve for the expense to pass."
                    : newRule.minApprovalPercentage >= 50
                    ? `${newRule.minApprovalPercentage}% → A majority of approvers must approve.`
                    : `${newRule.minApprovalPercentage}% → Only a fraction of approvers need to approve.`}
                </p>
              </div>

              {/* Custom Approvers */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Custom Approvers
                  </label>
                  <button
                    onClick={handleAddApprover}
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </button>
                </div>

                {newRule.approvers.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No custom approvers added yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {newRule.approvers.map((approver, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm relative group hover:border-indigo-200 transition-colors"
                      >
                        <button
                          onClick={() => removeApprover(index)}
                          className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <select
                          className="w-full text-sm border border-slate-200 rounded-lg mb-2.5 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={approver.approverId}
                          onChange={(e) => updateApprover(index, "approverId", e.target.value)}
                        >
                          <option value="">Select approver...</option>
                          {users
                            .filter((u) => u.role === "MANAGER" || u.role === "ADMIN")
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.role})
                              </option>
                            ))}
                        </select>

                        <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center text-slate-600 cursor-pointer hover:text-indigo-700 transition-colors">
                            <input
                              type="checkbox"
                              className="mr-1.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={approver.isRequired}
                              onChange={(e) =>
                                updateApprover(index, "isRequired", e.target.checked)
                              }
                            />
                            <span className="font-medium">Required</span>
                          </label>
                          {newRule.flowType === "SEQUENTIAL" && (
                            <div className="flex items-center text-slate-500">
                              <span className="font-medium mr-1">Order:</span>
                              <input
                                type="number"
                                className="w-12 border border-slate-200 rounded-lg px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={approver.sequenceOrder}
                                onChange={(e) =>
                                  updateApprover(index, "sequenceOrder", Number(e.target.value))
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider + Save Button */}
              <div className="pt-4 border-t border-slate-100 mt-2">
                <button
                  onClick={handleSaveRule}
                  disabled={!newRule.userId || saving}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? "Saving..." : "Save Rule"}
                </button>
              </div>
            </div>
          </div>

          {/* ─── List of existing rules ─── */}
          <div className="lg:col-span-2 space-y-4">
            {rules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Rules Configured</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Create your first approval routing rule using the form on the left. Rules
                  determine how expense approvals are routed in your organization.
                </p>
              </div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all duration-200 overflow-hidden"
                >
                  {/* Rule Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {rule.description || "Untitled Rule"}
                          {expandedRuleId === rule.id ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </h3>
                        <div className="flex items-center flex-wrap text-sm text-slate-500 mt-1.5 gap-2">
                          {rule.user && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                              {rule.user.name}
                            </span>
                          )}
                          <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            {rule.flowType === "SEQUENTIAL" ? (
                              <GitPullRequest className="w-3 h-3 mr-1" />
                            ) : (
                              <GitMerge className="w-3 h-3 mr-1" />
                            )}
                            {rule.flowType}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Min {rule.minApprovalPercentage}%
                          </span>
                          <span className="text-xs text-slate-400">
                            · {rule.approvers.length} approver(s)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRule(rule.id);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-3"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Flow Visualization */}
                  {expandedRuleId === rule.id && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
                          Flow:
                        </span>

                        {rule.isManagerApprover && (
                          <>
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-100 flex items-center shadow-sm">
                              <ShieldCheck className="w-4 h-4 mr-1.5" />
                              {rule.managerOverrideId
                                ? `Override: ${getUserName(rule.managerOverrideId)}`
                                : "Direct Manager"}
                            </div>
                            {rule.approvers.length > 0 && (
                              <ArrowRight className="w-4 h-4 text-slate-300" />
                            )}
                          </>
                        )}

                        {rule.approvers.map((app, idx) => (
                          <React.Fragment key={app.id}>
                            {idx > 0 && rule.flowType === "SEQUENTIAL" && (
                              <ArrowRight className="w-4 h-4 text-slate-300" />
                            )}
                            {idx > 0 && rule.flowType === "PARALLEL" && (
                              <Plus className="w-4 h-4 text-slate-300" />
                            )}
                            <div
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium border shadow-sm flex items-center ${
                                app.isRequired
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {getUserName(app.approverId)}
                              {app.isRequired && (
                                <span
                                  className="ml-1.5 w-2 h-2 bg-rose-500 rounded-full"
                                  title="Required Approver"
                                />
                              )}
                              {rule.flowType === "SEQUENTIAL" && (
                                <span className="ml-2 text-[10px] text-slate-400 font-mono">
                                  #{app.sequenceOrder}
                                </span>
                              )}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-4 mt-2">
                        <span>
                          Rule ID: <code className="font-mono">{rule.id.substring(0, 8)}...</code>
                        </span>
                        <span>
                          Created: {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-rose-500 rounded-full" /> = Required
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ HOW IT WORKS TAB ═══════════════ */}
      {activeTab === "guide" && (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">

          {/* Intro */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-2xl border border-indigo-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Understanding Approval Flow Types
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you create an approval rule, you choose a <strong>Flow Type</strong> that
              determines how approvers process expense requests. This guide explains the
              two types and additional controls available.
            </p>
          </div>

          {/* ─── SEQUENTIAL ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GitPullRequest className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sequential Flow</h3>
                <p className="text-blue-100 text-xs">Approvers act one after another, in strict order</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                In sequential flow, each approver <strong>only receives</strong> the expense request
                after the previous approver has approved. If any approver in the chain rejects,
                the process stops.
              </p>

              {/* Visual Flow Diagram */}
              <div className="flex items-center justify-center gap-0 flex-wrap py-4 px-2">
                {/* Employee */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2">EMPLOYEE</span>
                  <span className="text-[10px] text-slate-400">Submits</span>
                </div>

                <ArrowRight className="w-6 h-6 text-slate-300 mx-1 shrink-0" />

                {/* Manager */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100 ring-2 ring-emerald-200">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 mt-2">MANAGER</span>
                  <span className="text-[10px] text-slate-400">Order #1</span>
                </div>

                <div className="flex flex-col items-center mx-1">
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                  <span className="text-[9px] text-emerald-600 font-semibold">approves</span>
                </div>

                {/* Approver 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 mt-2">FINANCE</span>
                  <span className="text-[10px] text-slate-400">Order #2</span>
                </div>

                <div className="flex flex-col items-center mx-1">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                  <span className="text-[9px] text-blue-600 font-semibold">approves</span>
                </div>

                {/* Approver 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-100">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 mt-2">VP</span>
                  <span className="text-[10px] text-slate-400">Order #3</span>
                </div>

                <ArrowRight className="w-6 h-6 text-slate-300 mx-1 shrink-0" />

                {/* Result */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-100">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 mt-2">APPROVED</span>
                </div>
              </div>

              {/* Key Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">⏱ Step-by-Step</p>
                  <p className="text-xs text-blue-600">Next approver only sees the request after the previous one approves</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">🔢 Order Matters</p>
                  <p className="text-xs text-blue-600">The sequence order field controls who goes first, second, third...</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">🏢 Best For</p>
                  <p className="text-xs text-blue-600">Strict hierarchical chains like Manager → Finance → VP</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── PARALLEL ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GitMerge className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Parallel Flow</h3>
                <p className="text-amber-100 text-xs">All approvers receive the request simultaneously</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                In parallel flow, <strong>all approvers</strong> receive the expense request at the same time
                and can act independently. The system checks the <strong>minApprovalPercentage</strong> threshold
                to decide when enough approvals have been collected.
              </p>

              {/* Visual Flow Diagram */}
              <div className="flex flex-col items-center py-4">
                {/* Top row: Employee → Manager */}
                <div className="flex items-center gap-0 mb-2">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">EMPLOYEE</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 mx-2" />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-1">MANAGER</span>
                    <span className="text-[9px] text-slate-400">(if Manager First ON)</span>
                  </div>
                </div>

                <ArrowDown className="w-5 h-5 text-amber-400 my-1" />
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">Manager approves → All fire at once</span>

                {/* Parallel approvers */}
                <div className="flex items-center gap-4 py-2">
                  {["Finance Dir", "IT Manager", "HR Lead"].map((name, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        i === 0 ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-100" :
                        i === 1 ? "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-100" :
                        "bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-100"
                      }`}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1">{name}</span>
                      <span className="text-[9px] text-slate-400">Same priority</span>
                    </div>
                  ))}
                </div>

                <ArrowDown className="w-5 h-5 text-amber-400 my-1" />
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Threshold check: Did enough approvers say YES?</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1">⚡ Simultaneous</p>
                  <p className="text-xs text-amber-700">All custom approvers receive the request at the same time</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1">📊 Threshold-based</p>
                  <p className="text-xs text-amber-700">Uses minApprovalPercentage to decide when enough approvals are in</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1">🤝 Best For</p>
                  <p className="text-xs text-amber-700">Committee decisions, peer reviews, or cross-department approvals</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── MIN APPROVAL PERCENTAGE ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Min Approval Percentage</h3>
                <p className="text-cyan-100 text-xs">How many approvals are needed to pass</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                The <strong>minApprovalPercentage</strong> determines what percentage of total approvers
                need to approve before the expense is marked as <strong>APPROVED</strong>. This is especially
                powerful with Parallel flow.
              </p>

              {/* Percentage examples table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Setting</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Approvers</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Needed to Pass</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { pct: "100%", total: 3, needed: "3 of 3", meaning: "All must approve", color: "indigo" },
                      { pct: "60%", total: 5, needed: "3 of 5", meaning: "Majority needed", color: "blue" },
                      { pct: "50%", total: 4, needed: "2 of 4", meaning: "Half needed", color: "cyan" },
                      { pct: "34%", total: 3, needed: "1 of 3", meaning: "Any one is enough", color: "emerald" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-${row.color}-50 text-${row.color}-700 border border-${row.color}-200`}>
                            {row.pct}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{row.total} approvers</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900">{row.needed}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-cyan-50 rounded-xl p-4 border border-cyan-100 flex items-start gap-3">
                <Zap className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-cyan-800 mb-1">Pro Tip</p>
                  <p className="text-xs text-cyan-700">
                    With <strong>Parallel + 50%</strong>, an expense with 4 approvers gets approved as soon as
                    <strong> 2 of 4 approve</strong> — even if the other 2 haven't responded yet! The remaining
                    pending requests are auto-resolved.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── REQUIRED APPROVER ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Ban className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Required Approver: Instant Rejection</h3>
                <p className="text-rose-100 text-xs">The nuclear option — stops everything immediately</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                When an approver is marked as <strong>"Required"</strong> (the checkbox in the approver row),
                they have special power: if they <strong>reject</strong> an expense, the
                <strong> entire expense is instantly rejected</strong> — no matter how many other approvers have approved.
                All remaining pending requests are cancelled.
              </p>

              {/* Visual rejection flow */}
              <div className="flex flex-col items-center py-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center shadow-lg shadow-rose-200 ring-2 ring-rose-300">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 mt-1">REQUIRED</span>
                    <span className="text-[10px] text-rose-500">Approver</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-lg">❌</span>
                    <span className="text-[10px] font-bold text-rose-600">REJECTS</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-rose-300" />

                  <div className="bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3 text-center">
                    <XCircle className="w-8 h-8 text-rose-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-rose-800">ENTIRE EXPENSE</p>
                    <p className="text-xs font-bold text-rose-800">REJECTED</p>
                    <p className="text-[10px] text-rose-500 mt-1">All pending requests cancelled</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                  <p className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Applies to BOTH flow types
                  </p>
                  <p className="text-xs text-rose-700">
                    Whether Sequential or Parallel, a required approver's rejection <strong>always</strong> triggers
                    instant rejection. No exceptions.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Non-required approver rejects?
                  </p>
                  <p className="text-xs text-slate-600">
                    The expense can <strong>still be approved</strong> if the minApprovalPercentage
                    threshold is met by other approvers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── MANAGER FIRST ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manager First Toggle</h3>
                <p className="text-emerald-100 text-xs">Route to the direct manager before any custom approvers</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Manager First = ON
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">1</span>
                      Employee's direct manager receives the request first
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
                      After manager approves → custom approvers are activated
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">!</span>
                      Manager is always treated as a <strong>required</strong> approver
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">✗</span>
                    Manager First = OFF
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
                      Custom approvers receive the request directly
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">—</span>
                      Manager is not involved in the approval process
                    </div>
                  </div>
                  <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-700">
                      <strong>Manager Override:</strong> You can optionally specify a different manager
                      (e.g., VP or department head) to act as the "manager" instead of the employee's
                      direct manager.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── QUICK COMPARISON ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Quick Comparison</h3>
              <p className="text-slate-400 text-xs">Side-by-side view of both flow types</p>
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Feature</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-blue-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><GitPullRequest className="w-3.5 h-3.5" /> Sequential</span>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-amber-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><GitMerge className="w-3.5 h-3.5" /> Parallel</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Approver Activation", "One at a time, in order", "All at once"],
                    ["Speed", "Slower (chain)", "Faster (simultaneous)"],
                    ["Sequence Order", "Shown — determines order", "Hidden — irrelevant"],
                    ["Best For", "Strict hierarchy", "Committee decisions"],
                    ["Typical Min %", "Usually 100%", "Often < 100%"],
                    ["Required Rejects", "Instant reject ❌", "Instant reject ❌"],
                  ].map(([feature, seq, par], i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-800">{feature}</td>
                      <td className="px-5 py-3 text-slate-600">{seq}</td>
                      <td className="px-5 py-3 text-slate-600">{par}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
