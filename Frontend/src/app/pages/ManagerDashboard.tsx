import * as React from "react"
import { motion } from "motion/react"
import { AlertCircle, CheckCircle2, Clock, XCircle, ChevronDown, Filter, ShieldCheck, CheckSquare, Search } from "lucide-react"
import { useNavigate } from "react-router"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Input } from "../components/ui/input"
import { mockPendingApprovals, mockExpenses } from "../mockData"
import { Badge } from "../components/ui/badge"

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

// Pre-defined random currencies for the mockup scenario
const DEMO_CURRENCIES = ["EUR", "JPY", "GBP", "CAD", "AUD"];
const COMPANY_BASE_CURRENCY = "USD";

export function ManagerDashboard() {
  const navigate = useNavigate()
  
  // Combine internal mock data to show more items and add simulated attributes
  const [allPending, setAllPending] = React.useState(() => {
    const combined = [
      ...mockPendingApprovals,
      ...mockExpenses.filter(e => e.status === 'Pending').map(e => ({
        id: e.id,
        employeeName: e.employeeName || 'Unknown',
        amount: e.amount,
        category: e.category,
        date: e.date,
        waitingTime: e.waitingTime || '1 day',
        escalated: e.escalated || false
      }))
    ];
    // Map them into local state with mockup currencies
    return combined.map((req, i) => ({
      ...req,
      spentCurrency: DEMO_CURRENCIES[i % DEMO_CURRENCIES.length],
      actionStatus: "Pending" // Actionable locally initially
    }));
  });

  const [exchangeRates, setExchangeRates] = React.useState<Record<string, number>>({});
  
  React.useEffect(() => {
    // 1. Live Currency Conversion Endpoint
    axios.get(`https://api.exchangerate-api.com/v4/latest/${COMPANY_BASE_CURRENCY}`)
      .then(res => {
        setExchangeRates(res.data.rates);
      })
      .catch(err => console.error("Could not fetch exchange rates:", err));
  }, []);

  const handleAction = (id: string, action: "Approved" | "Rejected") => {
    // 2. Strict UI Post-Action Locks
    // Updates status ensuring action buttons disappear
    setAllPending(prev => prev.map(req => 
      req.id === id ? { ...req, actionStatus: action } : req
    ));
  };

  const getConvertedAmount = (amount: number, currency: string) => {
    if (!exchangeRates[currency] || currency === COMPANY_BASE_CURRENCY) return amount;
    // API provides amount per 1 Base Currency.
    // E.g. 1 USD = 150 JPY. To get USD from 3000 JPY: 3000 / 150 = 20 USD.
    return amount / exchangeRates[currency];
  };

  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manager Approvals</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Review and action pending reimbursement requests securely. Base Currency: <strong>{COMPANY_BASE_CURRENCY}</strong>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-800">Total Pending</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Clock className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-950">{allPending.filter(p => p.actionStatus === "Pending").length}</div>
            <p className="text-xs font-semibold text-blue-600/80 mt-1">Requests waiting for action</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-800">Escalated</CardTitle>
            <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><AlertCircle className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-950">{allPending.filter(p => p.escalated && p.actionStatus === "Pending").length}</div>
            <p className="text-xs font-semibold text-rose-600/80 mt-1">SLA breached (&gt;48h)</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-800">Resolved Today</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckSquare className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-950">{allPending.filter(p => p.actionStatus !== "Pending").length}</div>
            <p className="text-xs font-semibold text-emerald-600/80 mt-1">Actions successfully applied</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-4 border-b border-slate-100/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by employee name or ID..." 
                  className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-full w-full shadow-sm" 
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Button variant="outline" size="sm" className="h-9 rounded-full border-slate-200 shadow-sm font-medium">
                  <Filter className="mr-2 h-4 w-4 text-slate-500" />
                  Priority: All
                  <ChevronDown className="ml-2 h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px] font-semibold text-slate-700">Request ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                    <TableHead className="font-semibold text-slate-700">Details</TableHead>
                    <TableHead className="font-semibold text-slate-700">Waiting</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Spent Amount</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Converted Est. (USD)</TableHead>
                    <TableHead className="text-center w-[220px] font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPending.map((req, i) => {
                    const converted = getConvertedAmount(req.amount, req.spentCurrency);
                    return (
                      <motion.tr 
                        key={`${req.id}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (i * 0.05) }}
                        className={`
                          cursor-pointer transition-colors border-b border-slate-100/50 last:border-0
                          ${req.escalated && req.actionStatus === "Pending" ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'}
                          ${req.actionStatus !== "Pending" ? 'bg-slate-50/50 opacity-60' : ''}
                        `}
                      >
                        <TableCell className="font-semibold text-indigo-600" onClick={() => navigate(`/expenses/${req.id}`)}>{req.id}</TableCell>
                        <TableCell onClick={() => navigate(`/expenses/${req.id}`)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                              {req.employeeName.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{req.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => navigate(`/expenses/${req.id}`)}>
                          <span className="block font-semibold text-slate-900">{req.category}</span>
                          <span className="text-xs font-medium text-slate-500">{req.date}</span>
                        </TableCell>
                        <TableCell onClick={() => navigate(`/expenses/${req.id}`)}>
                          {req.escalated && req.actionStatus === "Pending" ? (
                            <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
                              {req.waitingTime} (Escalated)
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-slate-600 flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              {req.actionStatus === "Pending" ? req.waitingTime : "Resolved"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-600" onClick={() => navigate(`/expenses/${req.id}`)}>
                          {req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {req.spentCurrency}
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900" onClick={() => navigate(`/expenses/${req.id}`)}>
                          ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          {req.actionStatus === "Pending" ? (
                            <div className="flex justify-center gap-2">
                              <Button 
                                size="sm" 
                                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm font-semibold rounded-full h-8 px-3"
                                onClick={() => handleAction(req.id, "Approved")}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold rounded-full h-8 px-3 transition-colors"
                                onClick={() => handleAction(req.id, "Rejected")}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              {req.actionStatus === "Approved" ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                                  <CheckSquare className="w-3.5 h-3.5" /> Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-100 px-3 py-1 rounded-full text-xs font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Rejected
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
