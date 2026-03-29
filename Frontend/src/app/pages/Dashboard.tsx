import * as React from "react"
import { motion } from "motion/react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { DollarSign, Clock, CheckCircle2, XCircle, ArrowRight, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { chartData, donutData, mockPendingApprovals } from "../mockData"

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

export function Dashboard() {
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Welcome back. Here's your real-time expense insights.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all hover:shadow-lg">
          Submit New Expense
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/30 border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">Total Expenses</CardTitle>
            <div className="bg-blue-500 text-white p-2 rounded-xl shadow-sm">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950">$10,120.50</div>
            <p className="text-xs text-blue-600/80 mt-1 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900">Pending</CardTitle>
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">12</div>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">3 require attention</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900">Approved</CardTitle>
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">45</div>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">This quarter</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100/30 border-rose-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-rose-900">Rejected</CardTitle>
            <div className="bg-rose-500 text-white p-2 rounded-xl shadow-sm">
              <XCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-950">4</div>
            <p className="text-xs text-rose-600/80 mt-1 font-medium">Need correction</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Expense Growth Trend</CardTitle>
            <CardDescription>Visualizing your spending patterns over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <CardDescription>Where your budget goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mb-6">
                <span className="text-3xl font-bold text-slate-800">$10k</span>
                <span className="text-xs text-slate-500 font-medium">Total</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-7">
        {/* Pending Approvals Panel */}
        <Card className="md:col-span-4 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Action Required</CardTitle>
              <CardDescription>Pending approvals that need your attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-3 font-medium rounded-full">
              View All <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockPendingApprovals.slice(0, 3).map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex flex-col p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {item.employeeName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.employeeName}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.id} • {item.category}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-lg">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="pl-13 mb-3 flex items-center">
                  {item.escalated ? (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md inline-flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span> Escalated • Waiting {item.waitingTime}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md inline-flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Waiting {item.waitingTime}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3 w-full pl-13">
                  <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm">Approve</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900">Review</Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Insights Panel */}
        <Card className="md:col-span-3 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-b from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Insights</CardTitle>
            <CardDescription>AI-powered spending analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Budget Utilization</span>
                <span className="font-bold text-slate-900">68%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-indigo-500 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-slate-500 font-medium">$3,200 remaining this month</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800">Top Categories</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-600 font-medium">Travel</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600 font-medium">Meals</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-slate-600 font-medium">Equipment</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">15%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-indigo-50/80 rounded-xl border border-indigo-100">
              <div className="flex gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <p className="text-sm text-indigo-900 leading-relaxed">
                  <span className="font-semibold block mb-1">Insight</span>
                  Travel expenses are up 12% compared to last month. Consider reviewing upcoming Q4 trips.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
