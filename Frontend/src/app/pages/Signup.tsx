import { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router"

const countryCurrencyMap: Record<string, string> = {
  "US": "USD",
  "IN": "INR",
  "UK": "GBP",
  "CA": "CAD",
  "AU": "AUD",
  "EU": "EUR",
  "JP": "JPY",
  "SG": "SGD",
  "AE": "AED"
}

export function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    country: "US",
    role: "EMPLOYEE"
  })
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const baseCurrency = useMemo(() => countryCurrencyMap[formData.country] || "USD", [formData.country])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          baseCurrency
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      // Save token and user info
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Navigate to dashboard
      navigate("/")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-slate-100 my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
          <p className="text-slate-500 mt-2">Join to start managing reimbursements efficiently</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              required
              className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Acme Corp"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
              >
                {Object.keys(countryCurrencyMap).map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                Base Currency <span className="text-xs text-indigo-500 font-normal">(Auto-mapped)</span>
              </label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-2 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed font-medium"
                value={baseCurrency}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex justify-center items-center mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
