# Instructions for Developer 3: Manager & Data Viz Owner

You are responsible for the **Manager Approval Dashboard**, **Real-time Currency Conversion**, and **Approval Actions**.

## Backend Tasks
1.  **Approval Queue**:
    - `GET /api/expenses/queue`: Fetch all expenses pending approval where the logged-in user is an authorized approver (check `ApprovalRequest` table).
2.  **External API Integration**:
    - Integrate `api.exchangerate-api.com` to fetch live rates.
    - Cache rates locally (in-memory or simple file) for at least 1 hour to avoid rate limits.
3.  **Approval Actions**:
    - `POST /api/expenses/:id/action`: Accept `{ action: 'APPROVE' | 'REJECT', comments: string }`.
    - Update `ExpenseStatus` and `ApprovalRequest` status.
    - **Crucial**: Update the `convertedAmount` in the `Expense` table using the live exchange rate at the moment of approval.

## Frontend Tasks
1.  **Manager Dashboard**: Build `Frontend/src/app/pages/ManagerDashboard.tsx`.
    - Display a list of pending requests.
    - Show the "Original Amount" (spent currency) vs "Converted Amount" (company's base currency) side-by-side.
2.  **Review Detail View**:
    - Show the receipt image (if available).
    - Provide clear "Approve" and "Reject" buttons.
    - Hide action buttons once an action has been taken.

## Technical Notes
- The `Company` model has a `baseCurrency`. All conversions should target this currency.
- Use the `ExpenseHistory` model to log every manager action.
- Follow the existing design patterns in `Frontend/src/app/styles`.
