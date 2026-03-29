import * as React from "react"
import { motion } from "motion/react"
import { UploadCloud, CheckCircle2, RefreshCw, X, Receipt, Search, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Textarea } from "../components/ui/textarea"

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

export function SubmitExpense() {
  const [isScanning, setIsScanning] = React.useState(false)
  const [isScanned, setIsScanned] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Simulate OCR scan
      setIsScanning(true)
      setTimeout(() => {
        setIsScanning(false)
        setIsScanned(true)
      }, 2000)
    }
  }

  const removeFile = () => {
    setFile(null)
    setIsScanned(false)
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Submit Expense</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            Upload your receipt to automatically extract details or fill them manually.
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-12">
        {/* Form Column */}
        <Card className="order-2 md:order-1 md:col-span-7 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Expense Details
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Enter the details of your reimbursement request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {isScanned && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start text-sm mb-4 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 mr-3 shrink-0 text-emerald-600 mt-0.5" />
                <p className="font-medium">We've auto-filled some fields using AI OCR from your receipt. Please verify before submitting.</p>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="amount" className="text-slate-700 font-semibold">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-semibold">$</span>
                  <Input 
                    id="amount" 
                    placeholder="0.00" 
                    className="pl-7 bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 transition-all font-semibold text-slate-900" 
                    defaultValue={isScanned ? "45.00" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="date" className="text-slate-700 font-semibold">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  className="bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 transition-all text-slate-900 font-medium"
                  defaultValue={isScanned ? "2023-10-15" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 font-semibold">Category</Label>
              <select 
                id="category" 
                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 font-medium ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all cursor-pointer"
                defaultValue={isScanned ? "travel" : ""}
              >
                <option value="" disabled>Select a category</option>
                <option value="travel">Travel & Transportation</option>
                <option value="food">Meals & Entertainment</option>
                <option value="equipment">Office Equipment</option>
                <option value="software">Software Subscriptions</option>
                <option value="other">Other Expenses</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-semibold">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Briefly describe what this expense was for..." 
                className="resize-none min-h-[100px] bg-slate-50 focus-visible:ring-indigo-500 border-slate-200 transition-all text-slate-900 font-medium"
                defaultValue={isScanned ? "Uber ride to the airport" : ""}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 border-t bg-slate-50/50 py-5 mt-6 rounded-b-xl">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-full font-semibold px-6">Cancel</Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-full font-semibold px-6 shadow-md hover:shadow-lg transition-all flex items-center">
              Submit Request <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Upload Column */}
        <Card className="order-1 md:order-2 md:col-span-5 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 h-fit bg-gradient-to-br from-indigo-50/30 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" /> AI Receipt Scanner
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Upload to auto-fill details</CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div className="relative">
                <input 
                  type="file" 
                  id="receipt-upload" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={handleFileChange}
                />
                <Label 
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-200 rounded-2xl cursor-pointer bg-white hover:bg-indigo-50/50 hover:border-indigo-400 transition-all group"
                >
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <UploadCloud className="w-7 h-7 text-indigo-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">PNG, JPG or PDF (max. 10MB)</p>
                </Label>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center justify-center w-full h-48 border border-slate-200 rounded-2xl bg-white shadow-inner overflow-hidden"
              >
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-slate-50/80">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                      <Search className="absolute inset-0 m-auto w-6 h-6 text-indigo-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Analyzing Receipt...</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Extracting merchant, date, and amount</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 w-full h-full relative group">
                    <button 
                      onClick={removeFile}
                      className="absolute top-3 right-3 p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-20 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 border border-emerald-100 shadow-sm relative">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                         <span className="text-[10px] font-bold text-slate-700">PDF</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate w-full text-center px-4">{file.name}</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Successfully extracted
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
