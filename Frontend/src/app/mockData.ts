export const mockUser = {
  name: "Sarah Jenkins",
  role: "Senior Designer",
  email: "sarah.j@company.com",
};

export const chartData = [
  { name: "Jan", expenses: 1200 },
  { name: "Feb", expenses: 1800 },
  { name: "Mar", expenses: 1400 },
  { name: "Apr", expenses: 2200 },
  { name: "May", expenses: 900 },
  { name: "Jun", expenses: 2600 },
];

export const donutData = [
  { name: "Travel", value: 4500, color: "#3b82f6" }, // blue-500
  { name: "Food", value: 3000, color: "#10b981" }, // emerald-500
  { name: "Equipment", value: 1500, color: "#f59e0b" }, // amber-500
  { name: "Others", value: 1000, color: "#64748b" }, // slate-500
];

export const mockExpenses = [
  {
    id: "EXP-2023-089",
    amount: 1450.0,
    category: "Travel",
    date: "2023-10-15",
    status: "Pending",
    description: "Flight to New York for Q4 Summit",
    merchant: "Delta Airlines",
    escalated: false,
    waitingTime: "2 days",
    employeeName: "Sarah Jenkins",
  },
  {
    id: "EXP-2023-088",
    amount: 320.5,
    category: "Food",
    date: "2023-10-12",
    status: "Approved",
    description: "Team Dinner with Clients",
    merchant: "Steakhouse NYC",
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
  },
  {
    id: "EXP-2023-087",
    amount: 45.0,
    category: "Travel",
    date: "2023-10-10",
    status: "Rejected",
    description: "Taxi to Airport",
    merchant: "Uber",
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
  },
  {
    id: "EXP-2023-086",
    amount: 2500.0,
    category: "Equipment",
    date: "2023-10-05",
    status: "Pending",
    description: "New MacBook Pro Monitor",
    merchant: "Apple Store",
    escalated: true,
    waitingTime: "5 days",
    employeeName: "Sarah Jenkins",
  },
  {
    id: "EXP-2023-085",
    amount: 85.2,
    category: "Others",
    date: "2023-10-01",
    status: "Approved",
    description: "Monthly Software Subscription",
    merchant: "Adobe Inc.",
    escalated: false,
    waitingTime: "-",
    employeeName: "Sarah Jenkins",
  },
];

export const mockPendingApprovals = [
  {
    id: "EXP-2023-101",
    employeeName: "Michael Chang",
    amount: 850.0,
    category: "Travel",
    date: "2023-10-18",
    waitingTime: "1 day",
    escalated: false,
  },
  {
    id: "EXP-2023-095",
    employeeName: "Emily Davis",
    amount: 3200.0,
    category: "Equipment",
    date: "2023-10-14",
    waitingTime: "4 days",
    escalated: true,
  },
  {
    id: "EXP-2023-092",
    employeeName: "David Kim",
    amount: 120.0,
    category: "Food",
    date: "2023-10-12",
    waitingTime: "6 days",
    escalated: true,
  },
];

export const mockRules = [
  {
    id: "RULE-01",
    description: "Standard Employee Expenses",
    isManagerApprover: true,
    managerOverrideId: null,
    flowType: "SEQUENTIAL",
    minApprovalPercentage: 100,
    approvers: [
      { id: "APP-1", approverId: "Finance Team", isRequired: true, sequenceOrder: 1 }
    ]
  },
  {
    id: "RULE-02",
    description: "High Value Equipment (> $2000)",
    isManagerApprover: true,
    managerOverrideId: "VP_ID_123",
    flowType: "PARALLEL",
    minApprovalPercentage: 50,
    approvers: [
      { id: "APP-2", approverId: "Finance Director", isRequired: true, sequenceOrder: 1 },
      { id: "APP-3", approverId: "IT Manager", isRequired: false, sequenceOrder: 1 }
    ]
  }
];
