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
  Tag,
  Image as ImageIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
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
  const baseExpense = mockExpenses.find(e => e.id === id) || mockExpenses[0];

  // Local state to simulate strict post-action locks
  const [expense, setExpense] = React.useState(baseExpense);
  const [commentText, setCommentText] = React.useState("");

  const handleAction = (actionType: "Approved" | "Rejected") => {
    // In our phase 3 integration, we would POST to /api/expenses/:id/action with { action: actionType, comments: commentText }
    // For now, simulate locally to show strictly locking UI.
    setExpense(prev => ({
      ...prev,
      status: actionType
    }));
  };

  // Mock receipt image for dev 3 instruction demo
  const MOCK_RECEIPT_URL = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80";

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-6 pb-12"
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

      {expense.escalated && expense.status === "Pending" && (
        <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <AlertCircle className="w-5 h-5 text-rose-600 mr-3 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Escalated Request</h4>
            <p className="text-sm text-rose-600 mt-1 font-medium">This request has been automatically escalated because it has been pending for over 48 hours without manager response.</p>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {/* Main Details */}
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Request Amount</p>
                <div className="text-4xl font-black tracking-tight text-slate-900">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
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

              {/* Functional Approval Comment Box */}
              {expense.status === "Pending" ? (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Manager Action</h3>
                  <Textarea 
                    placeholder="Enter approval or rejection comments here..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[100px] mb-4 bg-slate-50 focus-visible:ring-indigo-500 font-medium" 
                  />
                  <div className="flex gap-4 w-full justify-end">
                    <Button 
                      onClick={() => handleAction("Approved")}
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-sm font-semibold px-6 rounded-full"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAction("Rejected")}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold transition-colors px-6 rounded-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject Request
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className={`p-4 rounded-xl flex items-start gap-4 ${expense.status === 'Approved' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    {expense.status === 'Approved' ? 
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : 
                      <XCircle className="w-5 h-5 text-rose-600 mt-0.5" />
                    }
                    <div>
                      <h4 className={`text-sm font-bold ${expense.status === 'Approved' ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {expense.status} by Manager
                      </h4>
                      <p className={`text-sm mt-1 font-medium ${expense.status === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Action has been finalized and locked. {commentText ? `Comment: "${commentText}"` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 md:col-span-1">
          {/* Mockup Receipt View */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-500" /> Scanned Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img 
                  src={MOCK_RECEIPT_URL} 
                  alt="Receipt Scan" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                View Full Image
              </Button>
            </CardContent>
          </Card>

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
                    <p className="text-sm text-slate-600 mt-2 font-medium">Assigned to Manager Queue</p>
                  </div>
                </div>

                {expense.status !== "Pending" && (
                  <div className="relative">
                     <div className={`absolute -left-3.5 mt-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${expense.status === "Approved" ? "bg-emerald-100" : "bg-rose-100"}`}>
                       <div className={`w-2 h-2 rounded-full ${expense.status === "Approved" ? "bg-emerald-600" : "bg-rose-600"}`}></div>
                     </div>
                     <div className="pl-6">
                       <p className="text-sm font-bold text-slate-900">{expense.status}</p>
                       <p className="text-xs text-slate-500 font-medium mt-0.5">Just now</p>
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
