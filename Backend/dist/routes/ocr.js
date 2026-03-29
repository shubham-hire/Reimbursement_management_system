"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
// ─── Category keywords for auto-detection ────────────────────────────────────
const CATEGORY_KEYWORDS = {
    Travel: [
        "airline", "flight", "hotel", "uber", "lyft", "taxi", "cab",
        "airbnb", "booking", "train", "railway", "bus", "airport",
        "grab", "delta", "united", "jetblue", "southwest",
    ],
    Food: [
        "restaurant", "cafe", "coffee", "lunch", "dinner", "breakfast",
        "food", "meal", "pizza", "burger", "bar", "grill", "kitchen",
        "starbucks", "mcdonalds", "subway", "swiggy", "zomato", "doordash",
    ],
    Equipment: [
        "apple", "dell", "hp", "lenovo", "microsoft", "monitor",
        "keyboard", "mouse", "laptop", "phone", "headset", "camera",
        "b&h", "best buy", "amazon",
    ],
    Software: [
        "adobe", "microsoft 365", "slack", "zoom", "notion",
        "figma", "github", "aws", "google cloud", "saas",
        "subscription", "license", "software",
    ],
    "Office Supplies": [
        "staples", "office depot", "paper", "pen", "ink",
        "printer", "toner", "supplies", "stationery",
    ],
};
function detectCategory(text) {
    const lower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                return category;
            }
        }
    }
    return "Other";
}
// ─── Extract amount from OCR text ────────────────────────────────────────────
function extractAmount(text) {
    // Match patterns like $1,234.56  €398.50  ₹12,450  1450.00  etc.
    const patterns = [
        /(?:total|amount|grand\s*total|sum|balance\s*due|net)[:\s]*[\$€£¥₹]?\s*([\d,]+\.?\d*)/i,
        /[\$€£¥₹]\s*([\d,]+\.?\d{0,2})/,
        /(\d{1,3}(?:,\d{3})*\.?\d{0,2})\s*(?:usd|eur|gbp|inr|jpy)/i,
        /(?:total|amount)[:\s]*([\d,]+\.?\d*)/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1]) {
            const amount = parseFloat(match[1].replace(/,/g, ""));
            if (amount > 0 && amount < 1000000) {
                return amount;
            }
        }
    }
    // Fallback: find largest reasonable number in the text
    const allNumbers = text.match(/\d{1,3}(?:,\d{3})*\.\d{2}/g);
    if (allNumbers) {
        const parsed = allNumbers.map((n) => parseFloat(n.replace(/,/g, "")));
        const reasonable = parsed.filter((n) => n > 0 && n < 100000);
        if (reasonable.length > 0) {
            return Math.max(...reasonable);
        }
    }
    return null;
}
// ─── Extract date from OCR text ──────────────────────────────────────────────
function extractDate(text) {
    const patterns = [
        // MM/DD/YYYY or MM-DD-YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
        // YYYY-MM-DD (ISO)
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
        // Month DD, YYYY
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
        // DD Month YYYY
        /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                const dateStr = match[0];
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString().slice(0, 10);
                }
            }
            catch {
                // Skip unparseable dates
            }
        }
    }
    // Fallback to today
    return null;
}
// ─── POST /api/expenses/scan — OCR receipt scanning ─────────────────────────
router.post("/scan", upload_1.upload.single("receipt"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded. Send a 'receipt' field." });
            return;
        }
        const filePath = req.file.path;
        const fileUrl = `/uploads/${req.file.filename}`;
        console.log(`📄 OCR scanning: ${req.file.originalname} (${req.file.size} bytes)`);
        // Run Tesseract OCR
        const { data: { text }, } = await tesseract_js_1.default.recognize(filePath, "eng", {
            logger: (info) => {
                if (info.status === "recognizing text") {
                    console.log(`  OCR progress: ${Math.round((info.progress || 0) * 100)}%`);
                }
            },
        });
        console.log(`✅ OCR complete. Extracted ${text.length} characters.`);
        // Parse the OCR text
        const amount = extractAmount(text);
        const date = extractDate(text) || new Date().toISOString().slice(0, 10);
        const category = detectCategory(text);
        // Build description from first meaningful lines
        const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.length > 3 && l.length < 100);
        const description = lines.slice(0, 3).join(" — ");
        // Get merchant name (usually the first prominent line)
        const merchantName = lines[0] || "Unknown Merchant";
        const result = {
            amount,
            date,
            category,
            description,
            merchantName,
            receiptUrl: fileUrl,
            rawText: text,
            confidence: text.length > 20 ? "high" : "low",
        };
        res.json(result);
    }
    catch (error) {
        console.error("OCR error:", error);
        res.status(500).json({ error: "OCR processing failed" });
    }
});
exports.default = router;
//# sourceMappingURL=ocr.js.map