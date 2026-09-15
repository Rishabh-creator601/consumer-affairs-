# LM-Verify ⚖️
### Automated Legal Metrology (Packaged Commodities) Rules, 2011 Compliance Checking Platform

LM-Verify is an automated compliance verification system designed for enforcement officers under the Legal Metrology Act, 2009 and Packaged Commodities Rules (PCR), 2011.

---

## 🌟 Key Features

- **Automated Mandatory Declarations Check**: Scans packages to detect and validate the 6 core statutory declarations under Rule 6 (Manufacturer identity, Generic name, Net quantity, Month/Year of packing, Retail sale price/MRP, Consumer care contacts).
- **Deterministic Rule Engine**: 28+ Legal Metrology rules evaluated as pure functions using versioned rule packs (`rulePack_v1.json`) with statutory citations and Rule 32 penalty calculations (₹2,000 / ₹4,000).
- **Category-Specific Exemption Resolution**: Automatically applies exemptions and deltas for 30+ product categories (Food $\rightarrow$ FSSAI regulations, Cosmetics $\rightarrow$ D&C Rules, Bidi/Incense/PSU LPG cylinder exemptions).
- **Multi-Schedule Regulatory Database**: Built-in support for Second Schedule (prescribed pack sizes), Third Schedule ("when packed" allowance), and Fourth Schedule (prescribed units).
- **Cyan Design System**: Built to the specification with deep cyan navigation, bright cyan actions, and strictly reserved compliance verdict colors (`PASS`, `REVIEW`, `FAIL`, `NOT_APPLICABLE`).
- **Inspection Adjudication Console**: Dual-column layout displaying raw OCR extractions alongside statutory checklists with officer override logging.
- **Evidentiary Digital Reports**: Export verifiable compliance certificates and violation notices in **PDF** (with verification QR code and SHA-256 evidence chain), editable **DOCX**, and **XLSX**.
- **Role-Based Access Control (RBAC)**: Supports Field Inspector, Senior Inspector, Controller/Admin, Legal Officer, and Auditor roles.

---

## 🏗️ Architecture

```
Client (Next.js 14 App Router + Tailwind CSS)
   │
   ▼
API Gateway / Express Server (JWT + RBAC + Multer + Audit Logging)
   ├── Deterministic Rule Engine (Rules 6, 7, 8, 9, 11, 12, 13, 18, 31, 32)
   ├── Report Generation Service (PDFKit, docx, exceljs)
   ├── MongoDB + GridFS (Inspections, Products, RulePacks, Reports)
   └── OCR Integration Proxy ──► FastAPI Sidecar / EasyOCR Model
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (optional; defaults to automatic in-memory fallback for local testing)

### Quick Start (Manual)

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`.

3. **OCR Stub (Python)**:
   ```bash
   cd ocr-stub
   pip install -r requirements.txt
   python -m uvicorn main:app --host 0.0.0.0 --port 8001
   ```

### Docker Compose
```bash
docker compose up --build
```

---

## 🧪 Testing

Run backend unit tests for the Rule Engine, Price Parser, and Unit Normalizer:
```bash
cd backend
npm test
```
