import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Search, Download, ArrowUpRight, FileText,
  Pencil, ChevronDown, X, Clock, CheckCircle2, XCircle, FilePenLine
} from "lucide-react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { mockExpenses, formatAmount, getExpenseStats, type ExpenseStatus } from "../mockData"

const STATUS_CONFIG: Record<ExpenseStatus, { label: string; className: string; icon: React.ReactNode }> = {
  Draft:    { label: "Draft",    className: "bg-gray-100    text-gray-600    hover:bg-gray-200",    icon: <FilePenLine  className="w-3 h-3" /> },
  Pending:  { label: "Pending",  className: "bg-yellow-100  text-yellow-700  hover:bg-yellow-200",  icon: <Clock        className="w-3 h-3" /> },
  Approved: { label: "Approved", className: "bg-green-100   text-green-700   hover:bg-green-200",   icon: <CheckCircle2 className="w-3 h-3" /> },
  Rejected: { label: "Rejected", className: "bg-red-100     text-red-700     hover:bg-red-200",     icon: <XCircle      className="w-3 h-3" /> },
}

const ALL_CATEGORIES = ["Travel", "Food", "Equipment", "Software", "Marketing", "Office Supplies", "Training", "Other"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
}

export function MyExpenses() {
  const navigate = useNavigate()

  // ── State ────────────────────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = React.useState("")
  const [statusFilter,    setStatusFilter]    = React.useState<ExpenseStatus | "All">("All")
  const [categoryFilter,  setCategoryFilter]  = React.useState("All")
  const [statusOpen,      setStatusOpen]      = React.useState(false)
  const [categoryOpen,    setCategoryOpen]    = React.useState(false)

  // Use state so re-renders pick up newly added expenses
  const [expenses, setExpenses] = React.useState(() => [...mockExpenses])

  // Refresh when navigating back to this page
  React.useEffect(() => {
    setExpenses([...mockExpenses])
  }, [])

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.merchantName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus   = statusFilter   === "All" || e.status   === statusFilter
      const matchCategory = categoryFilter === "All" || e.category === categoryFilter
      return matchSearch && matchStatus && matchCategory
    })
  }, [expenses, searchQuery, statusFilter, categoryFilter])

  const stats = getExpenseStats(expenses)

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("All")
    setCategoryFilter("All")
  }
  const hasActiveFilters = searchQuery || statusFilter !== "All" || categoryFilter !== "All"

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Expenses</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-indigo-500" />
            Track and manage your reimbursement requests.
          </p>
        </div>
        <Button
          onClick={() => navigate("/submit")}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all rounded-full px-5"
        >
          + New Expense
        </Button>
      </motion.div>

      {/* ── Stats Bar ─────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["Draft", "Pending", "Approved", "Rejected"] as ExpenseStatus[]).map((s) => {
          const count = stats[s.toLowerCase() as keyof typeof stats] as number
          const cfg = STATUS_CONFIG[s]
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left shadow-sm hover:shadow-md ${
                statusFilter === s
                  ? "border-indigo-300 bg-indigo-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${cfg.className}`}>
                {cfg.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{count}</p>
                <p className="text-xs font-semibold text-slate-500">{s}</p>
              </div>
            </button>
          )
        })}
      </motion.div>

      {/* ── Table Card ────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/70 shadow-sm">
          {/* Filters */}
          <CardHeader className="pb-4 border-b border-slate-100/60">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by ID, merchant, description…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-50/60 border-slate-200 focus-visible:ring-indigo-500 rounded-full text-sm shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status filter */}
                <div className="relative">
                  <button
                    onClick={() => { setStatusOpen((o) => !o); setCategoryOpen(false) }}
                    className={`flex items-center gap-1.5 h-9 px-4 rounded-full border text-sm font-semibold transition-all shadow-sm ${
                      statusFilter !== "All"
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Status: {statusFilter}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {statusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{   opacity: 0, y: -6,  scale: 0.97 }}
                        className="absolute top-11 left-0 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        {(["All", "Draft", "Pending", "Approved", "Rejected"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setStatusOpen(false) }}
                            className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors text-left hover:bg-indigo-50 ${
                              statusFilter === s ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"
                            }`}
                          >
                            {s !== "All" && STATUS_CONFIG[s as ExpenseStatus].icon}
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category filter */}
                <div className="relative">
                  <button
                    onClick={() => { setCategoryOpen((o) => !o); setStatusOpen(false) }}
                    className={`flex items-center gap-1.5 h-9 px-4 rounded-full border text-sm font-semibold transition-all shadow-sm ${
                      categoryFilter !== "All"
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {categoryFilter === "All" ? "Category: All" : categoryFilter}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{   opacity: 0, y: -6,  scale: 0.97 }}
                        className="absolute top-11 left-0 z-30 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        {["All", ...ALL_CATEGORIES].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setCategoryFilter(cat); setCategoryOpen(false) }}
                            className={`flex w-full px-4 py-2.5 text-sm transition-colors text-left hover:bg-indigo-50 ${
                              categoryFilter === cat ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 h-9 px-3 rounded-full text-xs font-semibold text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}

                <Button variant="ghost" size="sm" className="ml-auto text-indigo-600 hover:bg-indigo-50 rounded-full font-semibold">
                  <Download className="mr-1.5 h-4 w-4" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[130px] font-semibold text-slate-700 pl-6">ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-24">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Description</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-28">Category</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 w-36">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-28">Status</TableHead>
                    <TableHead className="w-24 text-right font-semibold text-slate-700 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-10 h-10 text-slate-200" />
                            <p className="text-slate-400 font-semibold text-sm">No expenses found</p>
                            <p className="text-slate-300 text-xs">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((expense, idx) => {
                        const cfg = STATUS_CONFIG[expense.status]
                        const isDraft = expense.status === "Draft"
                        return (
                          <motion.tr
                            key={expense.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ delay: idx * 0.03 }}
                            className="group border-b border-slate-100/60 last:border-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
                            onClick={() => {
                              if (isDraft) navigate(`/submit?edit=${expense.id}`)
                              else navigate(`/expenses/${expense.id}`)
                            }}
                          >
                            <TableCell className="font-semibold text-indigo-600 group-hover:text-indigo-700 pl-6 text-sm">
                              {expense.id}
                            </TableCell>
                            <TableCell className="text-slate-500 font-medium text-sm whitespace-nowrap">
                              {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <p className="truncate font-medium text-slate-900 text-sm" title={expense.description}>
                                {expense.description || <span className="text-slate-300 italic">No description yet</span>}
                              </p>
                              <p className="text-xs text-slate-400 font-medium truncate">{expense.merchantName || "—"}</p>
                            </TableCell>
                            <TableCell>
                              {expense.category ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                                  {expense.category}
                                </span>
                              ) : <span className="text-slate-300 text-xs">—</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              {expense.amount > 0 ? (
                                <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
                                  {formatAmount(expense.amount, expense.spentCurrency)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${cfg.className} font-semibold shadow-sm border-0 flex items-center gap-1 w-fit`}>
                                {cfg.icon} {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              {isDraft ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/submit?edit=${expense.id}`) }}
                                  className="h-7 px-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-full"
                                >
                                  <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-full transition-all"
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium bg-slate-50/40">
                <span>Showing {filtered.length} of {expenses.length} expenses</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
