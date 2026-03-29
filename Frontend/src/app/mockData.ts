// ─── User ────────────────────────────────────────────────────────────────────

export const mockUser = {
  id: "usr-001",
  name: "Sarah Jenkins",
  role: "EMPLOYEE" as const,
  jobTitle: "Senior Designer",
  email: "sarah.j@company.com",
  companyId: "cmp-001",
  managerId: "usr-mgr-001",
  managerName: "David Chen",
};

// ─── Currency List ────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: "USD", name: "US Dollar",         symbol: "$" },
  { code: "EUR", name: "Euro",              symbol: "€" },
  { code: "GBP", name: "British Pound",     symbol: "£" },
  { code: "JPY", name: "Japanese Yen",      symbol: "¥" },
  { code: "INR", name: "Indian Rupee",      symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar",   symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc",       symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan",      symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar",  symbol: "HK$" },
  { code: "MXN", name: "Mexican Peso",      symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real",    symbol: "R$" },
  { code: "KRW", name: "South Korean Won",  symbol: "₩" },
  { code: "AED", name: "UAE Dirham",        symbol: "د.إ" },
  { code: "SEK", name: "Swedish Krona",     symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone",   symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar",symbol: "NZ$" },
  { code: "ZAR", name: "South African Rand",symbol: "R" },
  { code: "THB", name: "Thai Baht",         symbol: "฿" },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currencyCode}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExpenseStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export interface ExpenseHistoryItem {
  action: string;
  actionBy: string;
  timestamp: string; // ISO date string
  comments?: string;
}

export interface Expense {
  id: string;
  amount: number;
  spentCurrency: string;
  category: string;
  date: string;
  status: ExpenseStatus;
  description: string;
  merchantName: string;
  receiptUrl: string | null;
  escalated: boolean;
  waitingTime: string;
  employeeName: string;
  history: ExpenseHistoryItem[];
}

// ─── Mock Expenses ────────────────────────────────────────────────────────────

export const mockExpenses: Expense[] = [
  // 1 — Draft (just started, no receipt yet)
  {
    id: "EXP-2024-012",
    amount: 0,
    spentCurrency: "USD",
    category: "Travel",
    date: "2024-04-01",
    status: "Draft",
    description: "",
    merchantName: "",
    receiptUrl: null,
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-04-01T08:00:00Z",
      },
    ],
  },

  // 2 — Draft (started, some details filled in, from Japan trip)
  {
    id: "EXP-2024-011",
    amount: 12450,
    spentCurrency: "JPY",
    category: "Travel",
    date: "2024-03-28",
    status: "Draft",
    description: "Shinkansen ticket Tokyo to Osaka for client visit",
    merchantName: "JR East",
    receiptUrl: null,
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-28T14:30:00Z",
      },
    ],
  },

  // 3 — Pending
  {
    id: "EXP-2024-010",
    amount: 398.5,
    spentCurrency: "EUR",
    category: "Food",
    date: "2024-03-25",
    status: "Pending",
    description: "Client dinner at La Maison, Frankfurt — 4 attendees",
    merchantName: "La Maison Restaurant",
    receiptUrl: "https://placehold.co/600x800/f0f4ff/4f46e5?text=Receipt",
    escalated: false,
    waitingTime: "3 days",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-25T10:15:00Z",
      },
      {
        action: "Submitted for Approval",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-25T10:42:00Z",
        comments: "Dinner with Heinz & team after the product demo.",
      },
      {
        action: "Assigned to Approver",
        actionBy: "System",
        timestamp: "2024-03-25T10:42:05Z",
        comments: "Routed to David Chen (Manager)",
      },
    ],
  },

  // 4 — Pending & Escalated
  {
    id: "EXP-2024-009",
    amount: 2500.0,
    spentCurrency: "USD",
    category: "Equipment",
    date: "2024-03-20",
    status: "Pending",
    description: "LG 27\" 4K UltraFine monitor for home office",
    merchantName: "Apple Store",
    receiptUrl: "https://placehold.co/600x800/f0fdf4/16a34a?text=Receipt",
    escalated: true,
    waitingTime: "9 days",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-20T09:00:00Z",
      },
      {
        action: "Submitted for Approval",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-20T09:30:00Z",
      },
      {
        action: "Assigned to Approver",
        actionBy: "System",
        timestamp: "2024-03-20T09:30:05Z",
        comments: "Routed to David Chen (Manager)",
      },
      {
        action: "Escalated",
        actionBy: "System",
        timestamp: "2024-03-22T09:30:00Z",
        comments: "SLA breached (48h). Reassigned to Director — Linda Park.",
      },
    ],
  },

  // 5 — Approved
  {
    id: "EXP-2024-008",
    amount: 85.2,
    spentCurrency: "USD",
    category: "Software",
    date: "2024-03-15",
    status: "Approved",
    description: "Monthly Adobe Creative Cloud subscription renewal",
    merchantName: "Adobe Inc.",
    receiptUrl: "https://placehold.co/600x800/ecfdf5/059669?text=Receipt",
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-15T11:00:00Z",
      },
      {
        action: "Submitted for Approval",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-15T11:05:00Z",
      },
      {
        action: "Assigned to Approver",
        actionBy: "System",
        timestamp: "2024-03-15T11:05:05Z",
        comments: "Routed to David Chen (Manager)",
      },
      {
        action: "Approved",
        actionBy: "David Chen",
        timestamp: "2024-03-16T09:20:00Z",
        comments: "Recurring software subscription — auto-approved.",
      },
    ],
  },

  // 6 — Approved (multi-currency)
  {
    id: "EXP-2024-007",
    amount: 1450.0,
    spentCurrency: "USD",
    category: "Travel",
    date: "2024-03-10",
    status: "Approved",
    description: "Flight to New York for Q4 Summit — round trip",
    merchantName: "Delta Airlines",
    receiptUrl: "https://placehold.co/600x800/eff6ff/2563eb?text=Receipt",
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-10T07:00:00Z",
      },
      {
        action: "Submitted for Approval",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-10T07:15:00Z",
      },
      {
        action: "Assigned to Approver",
        actionBy: "System",
        timestamp: "2024-03-10T07:15:05Z",
        comments: "Routed to David Chen (Manager)",
      },
      {
        action: "Approved",
        actionBy: "David Chen",
        timestamp: "2024-03-11T10:00:00Z",
        comments: "Approved. Please submit per-diem separately.",
      },
    ],
  },

  // 7 — Rejected
  {
    id: "EXP-2024-006",
    amount: 320.5,
    spentCurrency: "USD",
    category: "Food",
    date: "2024-03-05",
    status: "Rejected",
    description: "Team dinner — 8 attendees",
    merchantName: "Nobu Restaurant NYC",
    receiptUrl: "https://placehold.co/600x800/fff1f2/e11d48?text=Receipt",
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-05T20:00:00Z",
      },
      {
        action: "Submitted for Approval",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-03-05T20:30:00Z",
      },
      {
        action: "Assigned to Approver",
        actionBy: "System",
        timestamp: "2024-03-05T20:30:05Z",
        comments: "Routed to David Chen (Manager)",
      },
      {
        action: "Rejected",
        actionBy: "David Chen",
        timestamp: "2024-03-06T09:00:00Z",
        comments:
          "Exceeds the $35/person meal policy limit. Please re-submit within policy.",
      },
    ],
  },

  // 8 — Rejected (SGD currency)
  {
    id: "EXP-2024-005",
    amount: 340.0,
    spentCurrency: "SGD",
    category: "Travel",
    date: "2024-02-28",
    status: "Rejected",
    description: "Taxi from Changi Airport to hotel",
    merchantName: "Grab Singapore",
    receiptUrl: null,
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
    history: [
      {
        action: "Draft Created",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-02-28T14:00:00Z",
      },
      {
        action: "Submitted for Approval",
        actionBy: "Sarah Jenkins",
        timestamp: "2024-02-28T14:10:00Z",
        comments: "Airport taxi — no company car available.",
      },
      {
        action: "Assigned to Approver",
        actionBy: "System",
        timestamp: "2024-02-28T14:10:05Z",
        comments: "Routed to David Chen (Manager)",
      },
      {
        action: "Rejected",
        actionBy: "David Chen",
        timestamp: "2024-02-29T11:00:00Z",
        comments: "Missing receipt. Please re-submit with proof of purchase.",
      },
    ],
  },
];

// ─── Derived Stats ────────────────────────────────────────────────────────────

export function getExpenseStats(expenses: Expense[]) {
  return {
    total: expenses.length,
    drafts: expenses.filter((e) => e.status === "Draft").length,
    pending: expenses.filter((e) => e.status === "Pending").length,
    approved: expenses.filter((e) => e.status === "Approved").length,
    rejected: expenses.filter((e) => e.status === "Rejected").length,
    totalApprovedAmount: expenses
      .filter((e) => e.status === "Approved" && e.spentCurrency === "USD")
      .reduce((sum, e) => sum + e.amount, 0),
  };
}

// ─── Chart Data (derived from mockExpenses) ───────────────────────────────────

export const chartData = [
  { name: "Jan", expenses: 1200 },
  { name: "Feb", expenses: 1800 },
  { name: "Mar", expenses: 4455 },
  { name: "Apr", expenses: 2200 },
  { name: "May", expenses: 900 },
  { name: "Jun", expenses: 2600 },
];

export const donutData = [
  { name: "Travel",    value: 4500, color: "#3b82f6" },
  { name: "Food",      value: 3000, color: "#10b981" },
  { name: "Equipment", value: 2500, color: "#f59e0b" },
  { name: "Software",  value: 85,   color: "#8b5cf6" },
  { name: "Others",    value: 1000, color: "#64748b" },
];

// ─── Manager / Approval (Dev 3 will use these) ────────────────────────────────

export const mockPendingApprovals = [
  {
    id: "EXP-2024-010",
    employeeName: "Sarah Jenkins",
    amount: 398.5,
    spentCurrency: "EUR",
    category: "Food",
    date: "2024-03-25",
    waitingTime: "3 days",
    escalated: false,
  },
  {
    id: "EXP-2024-009",
    employeeName: "Michael Chang",
    amount: 850.0,
    spentCurrency: "USD",
    category: "Travel",
    date: "2024-03-22",
    waitingTime: "7 days",
    escalated: true,
  },
  {
    id: "EXP-2024-003",
    employeeName: "Emily Davis",
    amount: 3200.0,
    spentCurrency: "USD",
    category: "Equipment",
    date: "2024-03-18",
    waitingTime: "11 days",
    escalated: true,
  },
];
