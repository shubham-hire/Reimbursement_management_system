# Instructions for Developer 4: Rules & Engine Architect

You are responsible for the **Admin Dashboard**, **Complex Approval Rules Engine**, and **Routing Logic**.

## Backend Tasks
1.  **Rules Engine**:
    - Build a service in `Backend/src/services/ruleEngine.ts` that evaluates an expense against a user's `ApprovalRule`.
    - Handle `SEQUENTIAL` vs `PARALLEL` logic.
    - If `minApprovalPercentage` is <100, calculate logic.
    - If a "Required" approver rejects, trigger immediate `REJECTED` status for the expense.
2.  **Admin API**:
    - `GET /api/admin/rules`: Fetch global or per-user rules.
    - `POST /api/admin/rules`: Create/Update rules for a user.

## Frontend Tasks
1.  **Admin Dashboard**: Build `Frontend/src/app/pages/AdminDashboard.tsx`.
    - High-level charts (using `recharts`) showing spending trends and approval bottlenecks.
2.  **Rules Configuration UI**:
    - Build a complex UI to define `ApprovalRules`.
    - Allow adding multiple `RuleApprover` rows.
    - Checkboxes for `isRequired`.
    - Input for `sequenceOrder` and `minApprovalPercentage`.

## Technical Notes
- This is the most complex logic part. Ensure your `ruleEngine` correctly populates the `ApprovalRequest` table when an expense is submitted by an employee.
- Use the `Role.ADMIN` middleware to protect these routes.
- Ensure the `FlowType` enum (SEQUENTIAL/PARALLEL) is respected.
