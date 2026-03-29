# AI Agent Guidelines (Developers 2, 3, 4)

**Context**: Developer 1 has successfully initialized the baseline architecture. The Node.js/Express backend has been built (`/Backend/src/index.ts`), Prisma has been configured, and the database schema (`schema.prisma`) is final. In `/Frontend`, standard React routing and the Login/Signup pages are completed mapping straight to `http://localhost:5000/api/auth`. 

As Developer 2, Developer 3, or Developer 4, you are inheriting a fully working, integrated monorepo. **Your primary goal is to add functionality strictly within your domain without breaking the existing backend DB or the frontend routing.**

## 🚨 CRITICAL RULES FOR ALL AGENTS 🚨

1. **DO NOT MODIFY `schema.prisma` UNLESS ABSOLUTELY NECESSARY** 
   - Developer 1 has already defined `Company`, `User`, `Expense`, `ExpenseHistory`, `ApprovalRule`, `RuleApprover`, and `ApprovalRequest`.
   - Your frontend pages should construct their UI to match this schema perfectly. 
   - If you genuinely must add a new field for your logic, you must carefully `npx prisma db push` it, but try to use existing nullable fields (`ocrData`, JSON columns, etc.) first.

2. **DOCKER DATABASE IS ALREADY CONFIGURED (PORT 5433)**
   - The PostgreSQL database is expected to run via Docker using `docker compose up -d db`. 
   - **Crucial**: Notice that the port is `5433` (i.e. `localhost:5433`). The `.env` matches this exactly to avoid Mac host collisions. DO NOT revert the port back to `5432`.

3. **SKIP THE "MOCKING" PHASE**
   - The `role.md` mentions starting with hardcoded mocks. Because Developer 1 finished the Prisma schema setup *early*, you can completely skip the mocking phase! 
   - You must write real Express routes in `/Backend/src/routes/...` and real `fetch` API calls in the React Frontend using the DB schema right away.

4. **USE EXISTING PACKAGES IN /Frontend**
   - The Frontend is a Vite+React app. It uses Tailwind CSS heavily. 
   - Basic Radix UI and Shadcn components might be present or available.
   - For icons, `lucide-react` is installed (`<IconName className="..." />`).

5. **YOUR DOMAIN BOUNDARIES**
   - **Developer 2**: Focus strictly on `/expenses` endpoints (OCR/Multer upload, Draft creation) and the "Employee Dashboard" UI for submitting expenses. Do not touch Auth or Approvals.
   - **Developer 3**: Focus strictly on the "Manager Dashboard", Approval Queue logic (`GET /expenses/queue`, `POST /expenses/:id/action`), and real-time Exchange Rate conversion. Do not touch the Employee submission logic.
   - **Developer 4**: Focus strictly on the recursive Approval engine engine (Sequential/Parallel execution logic hooks) and the "Admin Dashboard". 

6. **STARTING THE DEV SERVERS**
   - **Backend**: In `/Backend`, run `npm run dev`. This will start the API at `http://localhost:5000`.
   - **Frontend**: In `/Frontend`, run `npm run dev`. This will start Vite at `http://localhost:5173`.
   - Ensure the DB is already up using `docker compose up -d db` at the root.

---

*Remember: Every line of code should enhance the system safely. Check your logs and read existing code before overwriting files blindly.*
