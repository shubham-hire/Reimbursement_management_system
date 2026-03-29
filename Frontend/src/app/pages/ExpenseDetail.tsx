import * as React from "react"
import { motion } from "motion/react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft, FileText, Download, AlertCircle, CheckCircle2,
  Clock, XCircle, Building, Calendar, Tag, Lock, Pencil, ArrowRight,
  Receipt, User, Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { mockExpenses, formatAmount, type Expense, type ExpenseStatus } from "../mockData"

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ExpenseStatus, {
  badge: string; banner: string; icon: React.ReactNode; label: string
}> = {
  Draft: {
    label: "Draft",
    badge:  "bg-blue-100 text-blue-700",
    banner: "",
    icon:   <Pencil className="w-3.5 h-3.5" />,
  },
  Pending: {
    label: "Pending Approval",
    badge:  "bg-amber-100 text-amber-700",
    banner: "bg-amber-50 border-amber-200 text-amber-800",
    icon:   <Clock className="w-3.5 h-3.5" />,
  },
  Approved: {
    label: "Approved",
    badge:  "bg-emerald-100 text-emerald-700",
    banner: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon:   <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Rejected: {
    label: "Rejected",
    badge:  "bg-rose-100 text-rose-700",
    banner: "bg-rose-50 border-rose-200 text-rose-800",
    icon:   <XCircle className="w-3.5 h-3.5" />,
  },
}

// ─── History icon map ─────────────────────────────────────────────────────────
function historyIcon(action: string) {
  if (action.includes("Draft"))     return { icon: <Pencil      className="w-3 h-3" />, bg: "bg-blue-100",    dot: "bg-blue-500"    }
  if (action.includes("Submitted")) return { icon: <ArrowRight  className="w-3 h-3" />, bg: "bg-indigo-100",  dot: "bg-indigo-500"  }
  if (action.includes("Assigned"))  return { icon: <User        className="w-3 h-3" />, bg: "bg-slate-100",   dot: "bg-slate-400"   }
  if (action.includes("Approved"))  return { icon: <CheckCircle2 className="w-3 h-3" />, bg: "bg-emerald-100", dot: "bg-emerald-500" }
  if (action.includes("Rejected"))  return { icon: <XCircle     className="w-3 h-3" />, bg: "bg-rose-100",    dot: "bg-rose-500"    }
  if (action.includes("Escalated")) return { icon: <AlertCircle className="w-3 h-3" />, bg: "bg-orange-100",  dot: "bg-orange-500"  }
  return                                   { icon: <Clock        className="w-3 h-3" />, bg: "bg-slate-100",   dot: "bg-slate-400"   }
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " at "
    + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
}

export function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const expense: Expense = mockExpenses.find((e) => e.id === id) ?? mockExpenses[2]! // fallback to a Pending one

  const cfg = STATUS_CONFIG[expense.status]
  const isDraft    = expense.status === "Draft"
  const isPending  = expense.status === "Pending"
  const isApproved = expense.status === "Approved"
  const isRejected = expense.status === "Rejected"
  const isReadOnly = isPending || isApproved || isRejected

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Back + Header ─────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slateate-900">Expense Details</h1>
              <Badge className={`${cfg.badge} flex items-center gap-1 font-semibold border-0 shadow-sm text-sm px-3 py-1`}>
                {cfg.icon} {cfg.label}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {expense.id} · {new Date(expense.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Actions — depend on status */}
          <div className="flex items-center gap-2 shrink-0">
            {isDraft && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/submit?edit=${expense.id}`)}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full font-semibold"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit Draft
                </Button>
                <Button
                  onClick={() => navigate(`/submit?edit=${expense.id}`)}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-full font-semibold shadow-md"
                >
                  Submit <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            )}
            {isReadOnly && expense.receiptUrl && (
              <Button
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-full"
                onClick={() => window.open(expense.receiptUrl!, "_blank")}
              >
                <Download className="w-4 h-4 mr-2" /> Receipt
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Escalation Banner ─────────────────────────────────────────────────── */}
      {expense.escalated && (
        <motion.div
          variants={itemVariants}
          className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400" />
          <AlertCircle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-orange-800">Escalated — Waiting {expense.waitingTime}</h4>
            <p className="text-sm text-orange-600 mt-0.5 font-medium">
              This request has been automatically escalated because it exceeded the 48-hour response SLA.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Read-only Lock Notice ─────────────────────────────────────────────── */}
      {isReadOnly && (
        <motion.div
          variants={itemVariants}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium ${
            isApproved ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : isRejected ? "bg-rose-50 border-rose-200 text-rose-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          {isPending  && "This expense is awaiting approval. It is now read-only."}
          {isApproved && "This expense has been approved and is now read-only."}
          {isRejected && "This expense was rejected. Review the comments below and submit a corrected expense."}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3 items-start">

        {/* ── Main Details ───────────────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-5">

          {/* Amount Hero + Receipt */}
          <Card className="overflow-hidden border-slate-200/70 shadow-sm">
            <div className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Amount Requested</p>
              <div className="text-4xl font-black tracking-tight text-slate-900">
                {expense.amount > 0
                  ? formatAmount(expense.amount, expense.spentCurrency)
                  : <span className="text-slate-300">Not set</span>
                }
              </div>
              {expense.spentCurrency !== "USD" && expense.amount > 0 && (
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Currency conversion shown in manager's view
                </p>
              )}
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <DetailItem icon={<Building className="w-3.5 h-3.5 text-indigo-400" />} label="Merchant"  value={expense.merchantName || "—"} />
                <DetailItem icon={<Tag      className="w-3.5 h-3.5 text-violet-400" />} label="Category"  value={expense.category     || "—"} />
                <DetailItem icon={<Calendar className="w-3.5 h-3.5 text-blue-400"   />} label="Date"      value={expense.date ? new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
                <DetailItem icon={<FileText className="w-3.5 h-3.5 text-slate-400"  />} label="Employee"  value={expense.employeeName} />
                <DetailItem icon={<Receipt  className="w-3.5 h-3.5 text-slate-400"  />} label="Expense ID" value={expense.id} />
              </div>

              {expense.description && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">{expense.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Preview */}
          {expense.receiptUrl && (
            <Card className="border-slate-200/70 shadow-sm overflow-hidden">
              <CardHeader className="py-3 px-5 border-b border-slate-100 bg-slate-50/60">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500" /> Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <img
                  src={expense.receiptUrl}
                  alt="Receipt"
                  className="w-full max-h-72 object-contain bg-slate-50 p-4"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar: History Timeline ──────────────────────────────────────── */}
        <div className="space-y-5">
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-5">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-5 pb-5">
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-7">
                {expense.history.map((entry, idx) => {
                  const h = historyIcon(entry.action)
                  const isLast = idx === expense.history.length - 1
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[1.1rem] top-[2px] w-5 h-5 rounded-full ${h.bg} border-2 border-white flex items-center justify-center shadow-sm`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${h.dot} flex items-center justify-center`}>
                          <span className="text-white" style={{ fontSize: 7 }}>{h.icon}</span>
                        </div>
                      </div>

                      <div className="pl-6">
                        <p className={`text-sm font-bold text-slate-900 flex items-center gap-1.5 ${isLast && isPending ? "text-amber-700" : ""}`}>
                          {entry.action}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{formatTimestamp(entry.timestamp)}</p>
                        {entry.actionBy !== "System" && (
                          <p className="text-xs text-slate-500 mt-0.5">by <span className="font-semibold">{entry.actionBy}</span></p>
                        )}
                        {entry.comments && (
                          <div className={`mt-2 p-2.5 rounded-lg text-xs font-medium border leading-relaxed ${
                            entry.action.includes("Rejected")
                              ? "bg-rose-50 border-rose-100 text-rose-700"
                              : entry.action.includes("Escalated")
                              ? "bg-orange-50 border-orange-100 text-orange-700"
                              : "bg-slate-50 border-slate-100 text-slate-600"
                          }`}>
                            "{entry.comments}"
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Pending future step indicator */}
                {isPending && (
                  <div className="relative">
                    <div className="absolute -left-[1.1rem] top-[2px] w-5 h-5 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                    <div className="pl-6">
                      <p className="text-sm font-bold text-amber-700">Awaiting Decision</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Pending manager review</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rejection CTA */}
          {isRejected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50"
            >
              <p className="text-sm font-bold text-rose-800 mb-1">Expense Rejected</p>
              <p className="text-xs text-rose-600 mb-3 leading-relaxed">
                Address the manager's comments and resubmit a corrected expense.
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/submit")}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold shadow-sm"
              >
                Submit New Expense
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Detail Item helper ───────────────────────────────────────────────────────
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-bold text-slate-900 pl-5">{value}</p>
    </div>
  )
}
