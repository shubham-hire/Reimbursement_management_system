# Instructions for Developer 2: Employee Experience Owner

You are responsible for the **Expense Submission flow**, **Draft management**, and **OCR receipt parsing**.

## Backend Tasks
1.  **Multer Setup**: Create a middleware/utility to handle file uploads in `Backend/src/utils/upload.ts`. Save receipts in a root `uploads/` folder.
2.  **OCR Integration**: Use `tesseract.js` to parse uploaded receipts. 
    - Create an endpoint `POST /api/expenses/scan` that accepts an image, runs OCR, and returns suggested `amount`, `date`, and `category`.
3.  **Expense CRUD**:
    - `POST /api/expenses`: Create a new Expense record. Support saving as `DRAFT` or submitting as `PENDING_APPROVAL`.
    - `GET /api/expenses`: Fetch the logged-in user's expense history.
    - Ensure every expense creation adds an entry to the `ExpenseHistory` table.

## Frontend Tasks
1.  **Employee Dashboard**: Build `Frontend/src/app/pages/EmployeeDashboard.tsx`. 
    - Show a table/list of the user's expenses with status colors (Draft=Gray, Pending=Yellow, Approved=Green, Rejected=Red).
2.  **New Request Modal**: 
    - Create a multi-step or comprehensive modal for expense submission.
    - Include a file upload area. When a user uploads a receipt, it should automatically trigger the backend OCR and populate the `Amount`, `Date`, and `Description` fields.
    - Allow manual overrides of the OCR data.
3.  **Read-only Locks**: If an expense status is NOT `DRAFT`, the UI must disable all editing/deletion for that record.

## Technical Notes
- Use the existing `PrismaClient` exported from `src/index.ts`.
- The `Expense` model in `schema.prisma` already has `ocrData` (JSON) and `spentCurrency` fields.
- Use `lucide-react` for icons and Tailwind CSS for styling.
