import { createBrowserRouter } from "react-router"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { SubmitExpense } from "./pages/SubmitExpense"
import { MyExpenses } from "./pages/MyExpenses"
import { ExpenseDetail } from "./pages/ExpenseDetail"
import { ManagerDashboard } from "./pages/ManagerDashboard"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "submit", Component: SubmitExpense },
      { path: "expenses", Component: MyExpenses },
      { path: "expenses/:id", Component: ExpenseDetail },
      { path: "approvals", Component: ManagerDashboard },
      { path: "*", Component: () => <div className="p-8 text-center text-slate-500">Page not found</div> },
    ],
  },
])
