Team Collaboration & Parallel Development Setup
To ensure all 4 team members can work in parallel without causing merge conflicts or blocking each other, we must divide the project along clean module boundaries.

1. Project Organization (Monorepo setup)
Both the Frontend and the new Backend should live in the same repository, but changes in one shouldn't crash the other.

/Frontend (React + Vite)
/Backend (Node.js + Express)
Environment Standardization:

Use Docker Compose for the PostgreSQL database so everyone has the exact same local DB without manual installation. Include a docker-compose.yml in the root.
Maintain a .env.example in both folders.
2. Recommended Git Workflow (Feature Branching)
To avoid overwhelming the main branch, follow a strict branching model:

main: Always production-ready (or demo-ready).
dev: Active integration branch.
Feature branches: feat/auth, feat/expense-ocr, feat/rules-engine.
Golden Rule: Always push to dev first, ensuring the code builds. Never push directly to main.

3. Task Division Matrix (4 Developers)
Below is a breakdown designed explicitly so each person owns a vertical slice or a distinct domain, allowing parallel work from Day 1.

Developer 1 (The Architect & Auth Lead)
Domain: Database Schema, Backend Setup, Auth & User Management.

Backend:
Initialize the Node/Express server in /Backend.
Define the schema.prisma file incorporating Users, Roles, Companies, and Base Currencies.
Build endpoints: POST /signup, POST /login, and token generation.
Frontend:
Build the Login and Signup React Pages.
Integrate the strict Country-to-Currency mapping on signup.
Developer 2 (The Employee Experience Owner)
Domain: Expense Submission, Drafts, and OCR.

Backend:
Build the CRUD API for Expenses: Create Draft, User History Log endpoints.
Setup the Receipt upload handler (Multer) & integrate the chosen OCR library to parse receipt data.
Frontend:
Build the completely functioning "Employee Dashboard".
Build the "New Request" multi-currency modal. Ensure the file upload triggers the OCR endpoint and populates the form.
Implement read-only locks post-submission.
Developer 3 (The Manager & Data Viz Owner)
Domain: Approvals queue, Live Currency Conversion, Team Data.

Backend:
Implement endpoints to fetch "Pending Approvals" for a specific manager (GET /expenses/queue).
Integrate the external Real-time Exchange Rate API (api.exchangerate-api.com).
Implement POST /expenses/:id/action (approve/reject).
Frontend:
Build the "Manager Dashboard" View.
Implement the auto-conversion display logic (translating the submitted currency to the company’s base currency).
Implement the strict visibility logic that hides buttons post-action.
Developer 4 (The Rules & Engine Architect)
Domain: Admin Dashboard and Complex Routing Engine.

Backend:
Build the recursive/conditional logic engine that evaluates an expense against the targeted ApprovalRule.
Handle Sequential vs. Parallel logic constraints, Manager-First conditions, Percentage thresholds, and the "Rejection by Required" instant rejection.
Frontend:
Build the "Admin Dashboard".
Build the highly complex Rules Configuration UI (Dropdowns for manager overrides, checkboxes for sequence vs parallel, dynamically adding Required approvers).
4. How to Start Immediately (Zero Blockers)
Because Developer 2, 3, and 4 need the Database Schema (Developer 1's job) to start hooking up real data, mocking is crucial for Phase 1.

Dev 1 starts creating schema.prisma and Express base.
Dev 2, 3, & 4 immediately start building their React UIs using hardcoded mock JSON arrays (e.g., const mockExpenses = [{...}]).
Once Dev 1 finalizes the schema and basic Auth, everyone begins replacing their mock JSON with actual fetch/axios calls to the newly minted backend endpoints.