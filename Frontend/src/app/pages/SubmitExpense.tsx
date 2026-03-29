import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  UploadCloud, CheckCircle2, X, Receipt, FileText,
  ArrowRight, Save, Camera, Sparkles, AlertCircle, ChevronDown,
  ScanLine, DollarSign, Tag, Calendar, User, Lock,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { CURRENCIES, mockExpenses, type Expense } from "../mockData"

// ─── OCR step labels shown during scanning ────────────────────────────────────
export const OCR_STEPS = [
  { label: "Reading document structure…",  icon: ScanLine   },
  { label: "Extracting merchant name…",    icon: User       },
  { label: "Detecting amount & currency…", icon: DollarSign },
  { label: "Parsing date & category…",     icon: Calendar   },
]

// ─── Backend API base URL ─────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000"

// ─── Call backend OCR, fallback to simulation ─────────────────────────────────
const OCR_DATASET: Array<Partial<Expense>> = [
  { amount: 12450,   spentCurrency: "JPY", merchantName: "JR East",                 category: "Travel",         description: "Shinkansen Tokyo → Osaka (Green Car)" },
  { amount: 398.5,   spentCurrency: "EUR", merchantName: "La Maison Restaurant",     category: "Food",           description: "Client dinner — 4 attendees" },
  { amount: 85.2,    spentCurrency: "USD", merchantName: "Adobe Inc.",               category: "Software",       description: "Creative Cloud — monthly subscription" },
  { amount: 1450.0,  spentCurrency: "USD", merchantName: "Delta Airlines",           category: "Travel",         description: "Round-trip flight to New York" },
  { amount: 134.0,   spentCurrency: "GBP", merchantName: "Premier Inn",              category: "Travel",         description: "Hotel stay — 1 night, London" },
  { amount: 45.0,    spentCurrency: "USD", merchantName: "Uber",                     category: "Travel",         description: "Ride to airport" },
  { amount: 2340.0,  spentCurrency: "USD", merchantName: "WeWork",                   category: "Office Supplies",description: "Monthly co-working space rental" },
  { amount: 560.75,  spentCurrency: "AUD", merchantName: "Qantas Airways",           category: "Travel",         description: "Sydney → Melbourne — economy class" },
  { amount: 230.0,   spentCurrency: "INR", merchantName: "Swiggy Business",          category: "Food",           description: "Team lunch — 3 attendees" },
  { amount: 799.99,  spentCurrency: "USD", merchantName: "B&H Photo",                category: "Equipment",      description: "Mirrorless camera lens for product shoots" },
]

function simulateOCR(file: File): Partial<Expense> {
  let seed = file.size
  for (let i = 0; i < file.name.length; i++) seed += file.name.charCodeAt(i) * (i + 1)
  const index = seed % OCR_DATASET.length
  const entry  = OCR_DATASET[index]!
  return { ...entry, date: new Date().toISOString().slice(0, 10) }
}

async function scanReceiptViaBackend(file: File): Promise<Partial<Expense> | null> {
  try {
    const formData = new FormData()
    formData.append("receipt", file)
    const response = await fetch(`${API_BASE}/api/expenses/scan`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) return null
    const data = await response.json()
    return {
      amount: data.amount ?? undefined,
      merchantName: data.merchantName ?? undefined,
      category: data.category ?? undefined,
      description: data.description ?? undefined,
      date: data.date ?? new Date().toISOString().slice(0, 10),
      receiptUrl: data.receiptUrl ? `${API_BASE}${data.receiptUrl}` : undefined,
    }
  } catch {
    // Backend not running — fall back to simulation
    return null
  }
}

const CATEGORIES = [
  "Travel", "Food", "Equipment", "Software", "Marketing", "Office Supplies", "Training", "Other"
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
}

// ─── In-memory draft store (shared across navigations in same session) ────────
export const draftStore: Record<string, Partial<Expense>> = {}

export function SubmitExpense() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("edit") // e.g. ?edit=EXP-2024-011

  // Pre-fill from existing draft if editing
  const existingDraft = editId
    ? (draftStore[editId] ?? mockExpenses.find((e) => e.id === editId))
    : null

  // ── Read-only guard: only DRAFT expenses may be edited ────────────────────
  const isReadOnly = !!existingDraft && existingDraft.status !== "Draft"

  const [amount,        setAmount]       = React.useState(existingDraft?.amount?.toString() ?? "")
  const [currency,      setCurrency]     = React.useState(existingDraft?.spentCurrency ?? "USD")
  const [date,          setDate]         = React.useState(existingDraft?.date ?? new Date().toISOString().slice(0, 10))
  const [category,      setCategory]     = React.useState(existingDraft?.category ?? "")
  const [merchantName,  setMerchantName] = React.useState(existingDraft?.merchantName ?? "")
  const [description,   setDescription]  = React.useState(existingDraft?.description ?? "")
  const [file,          setFile]         = React.useState<File | null>(null)
  const [previewUrl,    setPreviewUrl]   = React.useState<string | null>(null)
  const [isScanning,    setIsScanning]   = React.useState(false)
  const [isScanned,     setIsScanned]    = React.useState(false)
  const [scanStep,      setScanStep]     = React.useState(-1)   // -1 = idle, 0-3 = active step
  const [currencyOpen,  setCurrencyOpen] = React.useState(false)
  const [errors,        setErrors]       = React.useState<Record<string, string>>({})
  const [submitted,     setSubmitted]    = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Generate a new expense id for new submissions
  const expenseId = React.useRef(
    editId ?? `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  )

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
    setIsScanning(true)
    setIsScanned(false)
    setScanStep(0)

    // Step-by-step animation — runs while backend OCR processes
    const STEP_MS = 680
    OCR_STEPS.forEach((_, i) => {
      setTimeout(() => setScanStep(i), i * STEP_MS)
    })

    // Try backend OCR first, fallback to simulation
    const backendData = await scanReceiptViaBackend(f)
    const data = backendData ?? simulateOCR(f)

    // Wait for animation to finish, then apply data
    const minWait = OCR_STEPS.length * STEP_MS + 400
    const elapsed = Date.now()
    setTimeout(() => {
      if (data.amount)         setAmount(data.amount.toString())
      if (data.spentCurrency)  setCurrency(data.spentCurrency)
      if (data.merchantName)   setMerchantName(data.merchantName)
      if (data.category)       setCategory(data.category)
      if (data.description)    setDescription(data.description)
      if (data.date)           setDate(data.date)
      if (data.receiptUrl)     setPreviewUrl(data.receiptUrl)
      setIsScanning(false)
      setIsScanned(true)
      setScanStep(-1)
    }, Math.max(0, minWait - (Date.now() - elapsed)))
  }

  const removeFile = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setIsScanned(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {}
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid amount"
    if (!date)         e.date = "Date is required"
    if (!category)     e.category = "Select a category"
    if (!merchantName.trim()) e.merchantName = "Merchant is required"
    if (!description.trim())  e.description  = "Description is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const buildExpense = (status: Expense["status"]): Expense => ({
    id:            expenseId.current,
    amount:        Number(amount),
    spentCurrency: currency,
    category,
    date,
    status,
    description,
    merchantName,
    receiptUrl:    previewUrl,
    escalated:     false,
    waitingTime:   "-",
    employeeName:  "Sarah Jenkins",
    history: [
      { action: "Draft Created",        actionBy: "Sarah Jenkins", timestamp: new Date().toISOString() },
      ...(status === "Pending" ? [{ action: "Submitted for Approval", actionBy: "Sarah Jenkins", timestamp: new Date().toISOString() }] : []),
    ],
  })

  // ── Save as Draft ───────────────────────────────────────────────────────────
  const handleSaveDraft = () => {
    const expense = buildExpense("Draft")
    draftStore[expense.id] = expense
    // Insert/update in mockExpenses for MyExpenses page to see
    const idx = mockExpenses.findIndex((e) => e.id === expense.id)
    if (idx >= 0) mockExpenses[idx] = expense
    else          mockExpenses.unshift(expense)
    navigate("/expenses")
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return
    setSubmitted(true)
    setTimeout(() => {
      const expense = buildExpense("Pending")
      const idx = mockExpenses.findIndex((e) => e.id === expense.id)
      if (idx >= 0) mockExpenses[idx] = expense
      else          mockExpenses.unshift(expense)
      navigate(`/expenses/${expense.id}`)
    }, 900)
  }

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency)!

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {editId ? "Edit Draft" : "New Expense"}
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Receipt className="w-4 h-4 text-indigo-500" />
            Upload a receipt to auto-fill fields, or enter details manually.
          </p>
        </div>
        {editId && !isReadOnly && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <Save className="w-3.5 h-3.5" /> Editing Draft · {editId}
          </span>
        )}
      </motion.div>

      {/* ── Read-only Lock Banner ───────────────────────────────────────────── */}
      {isReadOnly && (
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 bg-slate-50 border border-slate-300 rounded-xl p-4 shadow-sm"
        >
          <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-800">
              This expense is locked — status:{" "}
              <span className="capitalize text-indigo-700">{existingDraft?.status}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Only <strong>Draft</strong> expenses can be edited. This expense has already been
              submitted and is now read-only.
            </p>
            <button
              onClick={() => navigate(`/expenses/${editId}`)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              View expense details →
            </button>
          </div>
        </motion.div>
      )}

      {/* ── OCR Success Banner ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isScanned && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{   opacity: 0, y: -10 }}
            className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm"
          >
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Fields auto-filled from receipt</p>
              <p className="text-xs text-emerald-600 mt-0.5">AI has extracted the details — please verify before submitting.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-12">

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <Card className="order-2 md:order-1 md:col-span-7 border-slate-200/70 shadow-sm">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Expense Details
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Fill in the details of your reimbursement request.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">

            {/* Amount + Currency */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Amount &amp; Currency</Label>
              <div className="flex gap-2">
                {/* Currency picker */}
                <div className="relative">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => !isReadOnly && setCurrencyOpen((o) => !o)}
                    className="flex items-center gap-1.5 h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{selectedCurrency.symbol}</span>
                    <span>{currency}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <AnimatePresence>
                    {currencyOpen && !isReadOnly && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{   opacity: 0, y: -6,  scale: 0.97 }}
                        className="absolute top-12 left-0 z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                          {CURRENCIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => { setCurrency(c.code); setCurrencyOpen(false) }}
                              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors text-left ${c.code === currency ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"}`}
                            >
                              <span className="w-6 text-center font-bold">{c.symbol}</span>
                              <div>
                                <div className="font-medium">{c.code}</div>
                                <div className="text-xs text-slate-400">{c.name}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Amount input */}
                <div className="flex-1">
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isReadOnly}
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })) }}
                    className={`bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 font-semibold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${errors.amount ? "border-rose-400" : ""}`}
                  />
                </div>
              </div>
              {errors.amount && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.amount}</p>}
            </div>

            {/* Date + Merchant */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-700 font-semibold text-sm">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  disabled={isReadOnly}
                  onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: "" })) }}
                  className={`bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${errors.date ? "border-rose-400" : ""}`}
                />
                {errors.date && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchantName" className="text-slate-700 font-semibold text-sm">Merchant / Vendor</Label>
                <Input
                  id="merchantName"
                  placeholder="e.g. Delta Airlines"
                  value={merchantName}
                  disabled={isReadOnly}
                  onChange={(e) => { setMerchantName(e.target.value); setErrors((p) => ({ ...p, merchantName: "" })) }}
                  className={`bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${errors.merchantName ? "border-rose-400" : ""}`}
                />
                {errors.merchantName && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.merchantName}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 font-semibold text-sm">Category</Label>
              <select
                id="category"
                value={category}
                disabled={isReadOnly}
                onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: "" })) }}
                className={`flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${errors.category ? "border-rose-400" : ""}`}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-semibold text-sm">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what this expense was for..."
                value={description}
                disabled={isReadOnly}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })) }}
                className={`resize-none min-h-[80px] bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${errors.description ? "border-rose-400" : ""}`}
              />
              {errors.description && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3 border-t bg-slate-50/60 py-4 rounded-b-xl">
            <Button
              variant="outline"
              onClick={() => navigate("/expenses")}
              className="border-slate-200 text-slate-600 hover:bg-slate-100 rounded-full px-5"
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={isReadOnly}
                onClick={handleSaveDraft}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full px-5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" /> Save as Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitted || isReadOnly}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitted
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Submitting…</>
                  : <>Submit for Approval <ArrowRight className="ml-2 w-4 h-4" /></>
                }
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* ── Upload / Preview ──────────────────────────────────────────────── */}
        <Card className="order-1 md:order-2 md:col-span-5 border-slate-200/70 shadow-sm h-fit bg-gradient-to-br from-indigo-50/40 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" /> AI Receipt Scanner
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Upload a photo or PDF — fields auto-fill instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="receipt-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  disabled={isReadOnly}
                  onChange={handleFileChange}
                />
                <label
                  htmlFor={isReadOnly ? undefined : "receipt-upload"}
                  className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl transition-all group ${
                    isReadOnly
                      ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                      : "border-indigo-200 cursor-pointer bg-white hover:bg-indigo-50/60 hover:border-indigo-400"
                  }`}
                >
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                    <UploadCloud className="w-7 h-7 text-indigo-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {isReadOnly ? "Upload disabled — expense locked" : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">PNG, JPG or PDF · max 10 MB</p>
                </label>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner"
              >
                {/* Remove button */}
                <button
                  onClick={removeFile}
                  disabled={isReadOnly}
                  className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-white/90 text-rose-500 rounded-full hover:bg-rose-50 border border-rose-100 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>

                {isScanning ? (
                  /* ── Step-by-step extraction progress ─────────────────── */
                  <div className="flex flex-col justify-center h-56 px-5 py-4 bg-slate-50/80 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="relative w-5 h-5 shrink-0">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-200" />
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">AI Scanning Receipt…</p>
                    </div>

                    {OCR_STEPS.map((step, i) => {
                      const StepIcon = step.icon
                      const done    = i < scanStep
                      const active  = i === scanStep
                      return (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: i <= scanStep ? 1 : 0.3, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                            active  ? "bg-indigo-50 border-indigo-200 shadow-sm" :
                            done    ? "bg-emerald-50 border-emerald-100" :
                            "bg-white border-slate-100"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            active ? "bg-indigo-100" : done ? "bg-emerald-100" : "bg-slate-100"
                          }`}>
                            {done
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              : <StepIcon className={`w-3.5 h-3.5 ${active ? "text-indigo-600 animate-pulse" : "text-slate-400"}`} />
                            }
                          </div>
                          <p className={`text-xs font-semibold ${
                            active ? "text-indigo-800" : done ? "text-emerald-700" : "text-slate-400"
                          }`}>
                            {step.label}
                          </p>
                          {done && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                              Done
                            </span>
                          )}
                          {active && (
                            <span className="ml-auto flex gap-0.5">
                              {[0,1,2].map(d => (
                                <span key={d} className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d*0.15}s` }} />
                              ))}
                            </span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  /* ── Receipt preview after scan ───────────────────────── */
                  previewUrl && file.type.startsWith("image/") ? (
                    <div className="relative h-52">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/60 to-transparent p-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-52 p-6">
                      <div className="w-14 h-18 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate w-full text-center px-4">{file.name}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Scanned successfully
                      </p>
                    </div>
                  )
                )}
              </motion.div>
            )}

            {/* Tips */}
            <div className="mt-4 space-y-2">
              {["Point camera at a flat, well-lit receipt", "Ensure amount & merchant name are visible", "Blurry images reduce extraction accuracy"].map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-xs text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
