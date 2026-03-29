import * as React from "react"
import { motion } from "motion/react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import {
  DollarSign, Clock, CheckCircle2, XCircle, ArrowRight,
  TrendingUp, Activity, FilePenLine, ArrowUpRight,
} from "lucide-react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  chartData, donutData, mockExpenses,
  formatAmount, getExpenseStats, type ExpenseStatus,
} from "../mockData"

// ─── Status colours — exact spec: Gray / Yellow / Green / Red ─────────────────
const STATUS_BADGE: Record<ExpenseStatus, string> = {
  Draft:    "bg-gray-100    text-gray-600",
  Pending:  "bg-yellow-100  text-yellow-700",
  Approved: "bg-green-100   text-green-700",
  Rejected: "bg-red-100     text-red-700",
}

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
}

export function EmployeeDashboard() {
  const navigate = useNavigate()
  const stats = getExpenseStats(mockExpenses)

  // Last 5 expenses for the recent list
  const recentExpenses = mockExpenses.slice(0, 5)

  const summaryCards = [
    {
      label:  "Total Approved",
      value:  `$${stats.totalApprovedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub:    "Approved amount (USD)",
      icon:   DollarSign,
      bg:     "from-blue-50 to-blue-100/30",
      border: "border-blue-200/50",
      iconBg: "bg-blue-500",
      text:   "text-blue-900",
      sub2:   "text-blue-600/80",
    },
    {
      label:  "Pending",
      value:  stats.pending,
      sub:    stats.pending === 0 ? "All clear!" : `${stats.pending} awaiting review`,
      icon:   Clock,
      bg:     "from-yellow-50 to-yellow-100/30",
      border: "border-yellow-200/50",
      iconBg: "bg-yellow-500",
      text:   "text-yellow-900",
      sub2:   "text-yellow-600/80",
    },
    {
      label:  "Approved",
      value:  stats.approved,
      sub:    "Fully reimbursed",
      icon:   CheckCircle2,
      bg:     "from-green-50 to-green-100/30",
      border: "border-green-200/50",
      iconBg: "bg-green-500",
      text:   "text-green-900",
      sub2:   "text-green-600/80",
    },
    {
      label:  "Drafts",
      value:  stats.drafts,
      sub:    "Saved, not submitted",
      icon:   FilePenLine,
      bg:     "from-gray-50 to-gray-100/30",
      border: "border-gray-200/50",
      iconBg: "bg-gray-400",
      text:   "text-gray-800",
      sub2:   "text-gray-500/80",
    },
  ]

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-indigo-500" />
            Welcome back, Sarah. Here's your expense summary.
          </p>
        </div>
        <Button
          onClick={() => navigate("/submit")}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all rounded-full px-5"
        >
          + New Expense
        </Button>
      </motion.div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            className={`bg-gradient-to-br ${card.bg} ${card.border} shadow-sm hover:shadow-md transition-all duration-300 cursor-default`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-semibold ${card.text}`}>{card.label}</CardTitle>
              <div className={`${card.iconBg} text-white p-2 rounded-xl shadow-sm`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-black ${card.text}`}>{card.value}</div>
              <p className={`text-xs ${card.sub2} mt-1 font-medium`}>{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Charts ───────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-base">Expense Trend</CardTitle>
            <CardDescription className="text-sm">Your spending over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpEmp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", fontSize: 13 }}
                    itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="expenses" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpEmp)" activeDot={{ r: 5, strokeWidth: 0, fill: "#4f46e5" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-base">By Category</CardTitle>
            <CardDescription className="text-sm">Where your budget goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mb-6">
                <span className="text-2xl font-black text-slate-800">
                  ${(stats.totalApprovedAmount / 1000).toFixed(1)}k
                </span>
                <span className="text-xs text-slate-400 font-semibold">Total</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={66} outerRadius={88} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={5}>
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 13 }} itemStyle={{ fontWeight: 600 }} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Expenses + Insights ────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-7">

        {/* Recent Expenses Table */}
        <Card className="md:col-span-4 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Expenses</CardTitle>
              <CardDescription className="text-sm">Your latest submissions</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/expenses")}
              className="text-indigo-600 hover:bg-indigo-50 rounded-full font-semibold text-sm"
            >
              View All <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentExpenses.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  onClick={() => {
                    if (expense.status === "Draft") navigate(`/submit?edit=${expense.id}`)
                    else navigate(`/expenses/${expense.id}`)
                  }}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <span className="text-indigo-600 font-black text-xs">{expense.category.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{expense.description || "Untitled Draft"}</p>
                      <p className="text-xs text-slate-400 font-medium">{expense.id} · {expense.merchantName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    {expense.amount > 0 && (
                      <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                        {formatAmount(expense.amount, expense.spentCurrency)}
                      </span>
                    )}
                    {/* ── Spec-correct status colours ── */}
                    <Badge className={`${STATUS_BADGE[expense.status]} border-0 text-xs font-semibold`}>
                      {expense.status}
                    </Badge>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <Card className="md:col-span-3 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-b from-white to-slate-50/60">
          <CardHeader>
            <CardTitle className="text-base">Monthly Insights</CardTitle>
            <CardDescription className="text-sm">Spending analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget utilisation */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Budget Utilization</span>
                <span className="font-black text-slate-900">68%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">$3,200 remaining this month</p>
            </div>

            {/* Status breakdown — spec colours */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-700">Status Breakdown</h4>
              {([
                { label: "Approved",  count: stats.approved,  color: "bg-green-400"  },
                { label: "Pending",   count: stats.pending,   color: "bg-yellow-400" },
                { label: "Drafts",    count: stats.drafts,    color: "bg-gray-400"   },
                { label: "Rejected",  count: stats.rejected,  color: "bg-red-400"    },
              ] as const).map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-sm text-slate-600 font-medium">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>

            {/* Insight tip */}
            <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100">
              <div className="flex gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <span className="font-bold block mb-0.5">Tip</span>
                  You have {stats.drafts} unsaved draft{stats.drafts !== 1 ? "s" : ""}. Submit
                  {stats.drafts !== 1 ? " them" : " it"} to start the approval process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
