import * as React from "react"
import { motion } from "motion/react"
import { Filter, Search, ChevronDown, Download, Eye, FileText, ArrowUpRight } from "lucide-react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
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

export function MyExpenses() {
  const navigate = useNavigate()

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Expenses</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Track and manage your submitted reimbursement requests.
          </p>
        </div>
        <Button onClick={() => navigate('/submit')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all hover:shadow-lg">
          Submit New Expense
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-4 border-b border-slate-100/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search expenses by ID, merchant..." 
                    className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-full w-full shadow-sm" 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Button variant="outline" size="sm" className="h-9 rounded-full border-slate-200 shadow-sm hover:bg-slate-50">
                  <Filter className="mr-2 h-4 w-4 text-slate-500" />
                  Status: All
                  <ChevronDown className="ml-2 h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="outline" size="sm" className="h-9 rounded-full border-slate-200 shadow-sm hover:bg-slate-50">
                  Category: All
                  <ChevronDown className="ml-2 h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="outline" size="sm" className="h-9 rounded-full border-slate-200 shadow-sm hover:bg-slate-50">
                  Date: This Month
                  <ChevronDown className="ml-2 h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto sm:ml-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-full font-medium">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px] font-semibold text-slate-700">Expense ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Description</TableHead>
                    <TableHead className="font-semibold text-slate-700">Category</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[120px]">Status</TableHead>
                    <TableHead className="w-[80px] text-right font-semibold text-slate-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExpenses.map((expense, idx) => (
                    <motion.tr 
                      key={expense.id} 
                      className="cursor-pointer group hover:bg-slate-50/80 transition-colors border-b border-slate-100/50 last:border-0" 
                      onClick={() => navigate(`/expenses/${expense.id}`)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (idx * 0.05) }}
                    >
                      <TableCell className="font-semibold text-indigo-600 group-hover:text-indigo-700">{expense.id}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-sm">{expense.date}</TableCell>
                      <TableCell>
                        <span className="truncate max-w-[250px] block font-medium text-slate-900" title={expense.description}>
                          {expense.description}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{expense.merchant}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`
                            ${expense.status === "Approved" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                            ${expense.status === "Rejected" ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : ""}
                            ${expense.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : ""}
                            font-semibold shadow-sm border-0
                          `}
                        >
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-full transition-all">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
