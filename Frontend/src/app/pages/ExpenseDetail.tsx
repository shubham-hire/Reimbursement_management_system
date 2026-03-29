import * as React from "react"
import { motion } from "motion/react"
import { useParams, useNavigate } from "react-router"
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  AlertCircle,
  XCircle,
  Building,
  Calendar,
  Tag
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Textarea } from "../components/ui/textarea"
import { mockExpenses } from "../mockData"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

export function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Use mock data or fallback
  const expense = mockExpenses.find(e => e.id === id) || mockExpenses[0]

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 hidden sm:flex">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 sm:hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Expense Details</h1>
              <Badge 
                className={`
                  ${expense.status === "Approved" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                  ${expense.status === "Rejected" ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : ""}
                  ${expense.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : ""}
                  text-sm px-3 py-1 font-semibold shadow-sm border-0
                `}
              >
                {expense.status}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1.5 flex items-center font-medium sm:pl-0 pl-11">
              <FileText className="w-4 h-4 mr-1.5 text-slate-400" /> {expense.id} • Submitted on {expense.date}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:pl-0 pl-11">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm rounded-full">
              <Download className="w-4 h-4 mr-2" /> Download Receipt
            </Button>
          </div>
        </div>
      </motion.div>

      {expense.escalated && (
        <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <AlertCircle className="w-5 h-5 text-rose-600 mr-3 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Escalated Request</h4>
            <p className="text-sm text-rose-600 mt-1 font-medium">This request has been automatically escalated because it has been pending for over 48 hours without manager response.</p>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3 items-start">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Request Amount</p>
                <div className="text-4xl font-black tracking-tight text-slate-900">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              
              {expense.status === "Pending" && (
                <div className="flex gap-3 w-full md:w-auto">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm font-semibold px-6 rounded-full">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold transition-colors px-6 rounded-full">
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center text-slate-500 mb-1 gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center"><FileText className="w-3.5 h-3.5" /></div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Employee</p>
                  </div>
                  <p className="text-base font-bold text-slate-900 pl-8">{expense.employeeName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-slate-500 mb-1 gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center"><Tag className="w-3.5 h-3.5 text-indigo-500" /></div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Category</p>
                  </div>
                  <p className="text-base font-bold text-slate-900 pl-8">{expense.category}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-slate-500 mb-1 gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center"><Building className="w-3.5 h-3.5 text-emerald-500" /></div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Merchant</p>
                  </div>
                  <p className="text-base font-bold text-slate-900 pl-8">{expense.merchant}</p>
                </div>
                <div className="col-span-1 sm:col-span-3 mt-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Description</p>
                  <p className="text-base text-slate-800 leading-relaxed font-medium">{expense.description}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Add Comment</h3>
                <Textarea placeholder="Type your message here. Managers and employees will see this." className="min-h-[100px] mb-3 bg-slate-50 focus-visible:ring-indigo-500 font-medium" />
                <div className="flex justify-end">
                  <Button variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-full">
                    <MessageSquare className="w-4 h-4 mr-2" /> Post Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                <div className="relative">
                  <div className="absolute -left-3.5 mt-1.5 w-5 h-5 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-bold text-slate-900">Expense Submitted</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{expense.date} at 09:41 AM</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">Submitted by {expense.employeeName}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-3.5 mt-1.5 w-5 h-5 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-bold text-slate-900">Manager Review Pending</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{expense.date} at 09:45 AM</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">Assigned to David Chen</p>
                  </div>
                </div>

                {expense.escalated && (
                  <div className="relative">
                    <div className="absolute -left-3.5 mt-1.5 w-5 h-5 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                    </div>
                    <div className="pl-6">
                      <p className="text-sm font-bold text-slate-900">Automatically Escalated</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Oct 17, 2023 at 09:45 AM</p>
                      <p className="text-sm text-rose-600 mt-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">SLA breached (48h). Reassigned to Director.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
