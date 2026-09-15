# LM-Verify ⚖️
### Automated Legal Metrology (Packaged Commodities) Rules, 2011 Compliance Checking Platform

LM-Verify is an automated compliance verification system designed for enforcement officers under the Legal Metrology Act, 2009 and Packaged Commodities Rules (PCR), 2011.

---

## 🌟 Key Features

- **Automated Mandatory Declarations Check**: Scans packages to detect and validate the 6 core statutory declarations under Rule 6 (Manufacturer identity, Generic name, Net quantity, Month/Year of packing, Retail sale price/MRP, Consumer care contacts).
- **Deterministic Rule Engine**: Legal Metrology rules evaluated as pure functions using versioned rule packs (`rulePack_v1.json`) with statutory citations and Rule 32 penalty calculations (₹2,000 / ₹4,000).
- **Category-Specific Exemption Resolution**: Applies exemptions and deltas per product category (Food → FSSAI regulations, Cosmetics → D&C Rules, Bidi/Incense/PSU LPG cylinder exemptions).
- **Multi-Schedule Regulatory Database**: Second Schedule (prescribed pack sizes), Third Schedule ("when packed" allowance) and Fourth Schedule (prescribed units).
- **Cyan Design System**: A single cyan ramp drives navigation, actions, borders and tints, with `PASS` / `REVIEW` / `FAIL` / `NOT_APPLICABLE` colours strictly reserved for compliance verdicts.
- **Measured, not guessed**: Rule 7 numeral heights, Rule 7(3) proportions, Rule 8(1) clear space and Rule 9(1)(b) contrast are physically measured in millimetres from a calibrated capture — and return *needs review* rather than a verdict when the image cannot support one.
- **Inspection Adjudication Console**: Three tables — raw OCR tokens with per-token confidence, the six statutory declarations as printed and normalised, and the compliance checklist — with the measurement evidence beside them and officer overrides logged against the account.
- **Description spell check**: A Legal Metrology domain lexicon flags misspellings with suggestions, and doubles as an OCR-quality signal. Advisory only — it carries no penalty and never fails an inspection.
- **Evidentiary Digital Reports**: PDF certificates with a verification QR code and SHA-256 hash, plus editable DOCX and XLSX exports, stored in GridFS.
- **Role-Based Access Control (RBAC)**: Field Inspector, Senior Inspector, Controller/Admin, Legal Officer and Auditor, enforced on the API and reflected in the navigation.

---

## 🔐 Authentication & Security

Authentication is a real, token-based system — there is no demo bypass.

| Control | Implementation |
| --- | --- |
| Password storage | bcrypt, 12 rounds by default (`BCRYPT_ROUNDS`) |
| Password policy | 10+ chars with upper, lower, digit and symbol, enforced by Zod |
| Access token | 15-minute JWT (`sub`, `role`, `jurisdiction`, `tv`), sent as a bearer header |
| Refresh token | 7-day JWT in an **httpOnly, SameSite** cookie — never readable by JavaScript |
| Token storage | Access token kept in memory only, so stored XSS cannot exfiltrate it |
| Refresh rotation | Every refresh issues a new token; the previous one is invalidated |
| Replay detection | Refresh tokens are stored **hashed**; reuse of a consumed token revokes the session |
| Session revocation | `tokenVersion` invalidates all issued tokens on logout-all, password change, role change or deactivation |
| Brute force | Per-IP rate limiting on `/auth/login` plus account lockout after 5 failed attempts |
| Enumeration | Unknown email, wrong password and inactive account all return one identical 401 |
| Transport | CORS locked to `CLIENT_URL` with credentials, Helmet headers, 1 MB body cap |
| Audit trail | Every sign-in, sign-out, override and adjudication is written to `AuditLog` |

The browser silently refreshes the access token before it expires, and a single-flight
interceptor retries any request that races the expiry — so a working session never
interrupts the officer.

---

## 🏗️ Architecture

```
Client (Next.js 14 App Router + Tailwind CSS)
   │  axios client: bearer header, silent refresh, typed { success, data } envelope
   ▼
API Gateway / Express (JWT + RBAC + rate limiting + Multer + Audit Logging)
   ├── Deterministic Rule Engine (Rules 6, 7, 8, 9, 11, 12, 13 + Rule 32 penalties)
   ├── Report Generation Service (PDFKit, docx, exceljs → GridFS + SHA-256)
   ├── MongoDB + GridFS (Inspections, Products, RulePacks, Reports, Users, AuditLog)
   └── Vision client ──► Python sidecar (vision-service/)
                          ├── OCR behind one contract: PaddleOCR | EasyOCR | stub
                          ├── Quality gate, perspective correction, mm calibration
                          ├── Glyph measurement (Sauvola + connected components)
                          └── Contrast (WCAG) and Rule 8 clear-space geometry
```

**The boundary that matters.** The sidecar reads and measures; it never decides
compliance. Verdicts come from a versioned JSON rule pack evaluated as pure functions.
A model in the extraction path can be swapped, retrained or rolled back without any
verdict changing meaning — which is what makes a finding defensible months later.

### The inspection lifecycle

1. `POST /api/inspections` — the inspection is raised against the signed-in officer.
2. `POST /api/inspections/:id/vision` — the capture goes to the sidecar, which gates the
   image quality, rectifies it, derives mm/px from the reference in frame, reads the label
   and measures glyph height, contrast and clear space.
3. `PUT /api/inspections/:id/evaluate` — the rule engine runs over the extraction and the
   measurements, and Rule 32 penalties are computed.
4. `PUT /api/inspections/:id/override` — a senior officer may override any verdict, with a
   recorded reason.
5. `PUT /api/inspections/:id/adjudicate` — the final verdict is written to product history.

---

## 🔬 The vision layer

Built in the order set out in `ML_Build_Order.txt`. Full detail in
[`vision-service/README.md`](vision-service/README.md).

| Step | What it does |
| --- | --- |
| **1. Two engines, one contract** | `POST /ocr → [{text, box, confidence}]`. PaddleOCR (PP-OCRv5) and EasyOCR both implement it; the benchmark decides which is kept, not reputation |
| **2. Ground-truth set** | ~150 photographed packages across food / cosmetics / detergent / bidi, with hand-measured heights. `benchmark/` reports per-rule precision, recall and the review-queue rate, and refuses to present itself as an accuracy table until the set is complete |
| **3. Regex first, VLM for the rest** | Four heads are statutorily patterned and tagged by regex. Only the manufacturer block and the generic name go to a VLM with a JSON schema. LayoutLMv3/LiLT fine-tuning is deliberately **not** done — it needs hundreds of labelled packs before it beats regex |
| **4. Glyph height in mm** | Crop → upscale 4× → Sauvola binarise → connected components → median digit height × mm/px. **Never** from an OCR bounding box: those are sized to a text region and skew high by 20–40%, reporting violations that are not there |
| **5. Contrast and clear space** | Both fall out of the same mask. WCAG luminance ratio for Rule 9(1)(b); geometric margins for Rule 8(1) |

### Measured accuracy

Against labels rendered at a known mm/px, with EasyOCR localising over live HTTP:

| Metric | Result |
| --- | --- |
| Numeral height error | **0.04–0.09 mm** (MAE 0.03 mm over the sample set) |
| Rule 7(2) band classification | **100%** correct on both sides of the 1 mm and 2 mm bands |
| Padding a region by 40% | changes the measurement by **< 0.2 mm** |
| False glare warnings on clean captures | **0%** across white, cream, mid-tone and dark labels |

Those are rendered labels. The real figures come from the step-2 set, which is why the
harness ships before the numbers do.

### What needs no model at all

De-skew and perspective (findContours + warpPerspective), blur gate (variance of the
Laplacian), glare (local-excess mask with a shape test), panel identification (**asked of
the officer** — a UI answer to an ML problem), sticker-over-MRP (edge discontinuity →
officer confirms), and the spelling check (domain lexicon).

### Confidence gating

| Band | Behaviour |
| --- | --- |
| **HIGH** | The verdict is recorded as stated |
| **MEDIUM** | The measurement is shown, the row reads REVIEW, the case cannot close until an officer looks |
| **LOW** | Nothing is asserted; the row names what was missing and joins the pending queue |

A system that is right 95% of the time and silent about which 5% is unusable in
enforcement. One that is right 90% of the time and says clearly which 10% it is unsure
about is usable, because the uncertainty is routed to a person.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (20 recommended)
- Python 3.10+ (for the OCR sidecar)
- MongoDB (optional — falls back to an in-memory instance that auto-seeds demo data)

### 1. Backend
```bash
cd backend
cp ../.env.example ../.env     # then set JWT_SECRET and JWT_REFRESH_SECRET
npm install
npm run dev                    # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                    # http://localhost:3000
```
Point the client at a non-default API with `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
(see `frontend/.env.local.example`).

### 3. Vision service (OCR + measurement)
```bash
cd vision-service
pip install -r requirements-dev.txt
pip install paddlepaddle==2.6.1 paddleocr==2.8.1   # or: pip install easyocr==1.7.2
python -m uvicorn main:app --host 0.0.0.0 --port 8001
pytest tests/ -q
```
With no OCR weights installed the service still runs, falls back to a deterministic
stub, and flags every reading for officer review. See `vision-service/README.md`.

### Docker Compose
```bash
docker compose up --build
```

### Demo credentials

When the backend falls back to in-memory MongoDB it seeds two accounts:

| Role | Email | Password |
| --- | --- | --- |
| Senior Inspector | `inspector@lmverify.gov.in` | `Password123!` |
| Controller | `admin@lmverify.gov.in` | `Password123!` |

These exist for local testing only. Provision real accounts through
**Users → Add officer** (Controller only), which enforces the password policy.

---

## 🧪 Testing

```bash
cd backend && npm test           # 81 tests
cd vision-service && pytest -q   # 57 tests
```

**Backend** covers the rule engine, price parser and unit normaliser; the auth system
end to end (token issuance, refresh rotation and replay detection, account lockout,
session revocation, every RBAC boundary); the full inspection lifecycle; the Rule 7(2)
Table I and Table II bands; confidence gating; and the spelling advisory.

**Vision service** measures glyph height against labels rendered at a known scale across
all four statutory bands and three capture resolutions, plus calibration, contrast,
clear space, the quality gates and quantity-region localisation.

---

## 🎨 Design System

| Token | Value | Use |
| --- | --- | --- |
| `cyan-deep` / `cyan-950` | `#083344` | Navigation, headers, page titles |
| `cyan-brand` / `cyan-700` | `#0E7490` | Primary surfaces, links, emphasis |
| `cyan-bright` / `cyan-500` | `#06B6D4` | Calls to action, focus rings, accents |
| `cyan-soft` / `cyan-50` | `#ECFEFF` | Tints, hover fills, table headers |
| `verdict-pass` | `#047857` | **Reserved** — PASS / compliant |
| `verdict-review` | `#9A5B08` | **Reserved** — REVIEW / pending |
| `verdict-fail` | `#A61B1B` | **Reserved** — FAIL / non-compliant |

The full `cyan-50 … cyan-950` ramp is available, so borders, tints and hovers are built
from the brand hue rather than falling back to neutral grey.
