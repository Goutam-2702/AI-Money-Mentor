<div align="center">

# 🏦 AI Money Mentor

### *Your AI-Powered Personal Wealth Manager*

**Built for India. Powered by Economic Times Intelligence.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ai--money--mentor--sigma.vercel.app-8B0000?style=for-the-badge&logoColor=white)](https://ai-money-mentor-sigma.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

---

*Upload your Form 16 → Get AI-powered tax optimization, portfolio analysis, and FIRE projections in under 60 seconds.*

</div>

---

## 🎯 What is AI Money Mentor?

AI Money Mentor is a **production-grade personal finance platform** for Indian salaried professionals that:

- **Parses Form 16 PDFs** to extract income, deductions, and tax details automatically
- **Compares Old vs. New Tax Regime** using exact FY 2025-26 slabs and saves you money
- **Analyses your mutual fund portfolio** for expense ratio red flags and stock overlap
- **Projects your FIRE date** (Financial Independence, Retire Early) with interactive simulators
- **Generates rule-based, quantified recommendations** — every insight includes a ₹ impact and regulatory citation
- **Runs a 6-dimensional Money Health Score** across Emergency, Insurance, Debt, Tax, Investments, and Retirement

> 💡 No generic advice. Every recommendation cites specific sections of the Income Tax Act, SEBI circulars, or AMFI guidelines.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 **Form 16 Scanner** | Drag-and-drop PDF upload with animated scan progress and auto-extraction |
| 🧮 **Tax Engine** | Old vs. New regime comparison using exact FY 2025-26 slabs, 87A rebate, surcharges |
| 📊 **Money Health Score** | 6-dimensional gauge: Emergency · Insurance · Debt · Tax · Investments · Retirement |
| 🔥 **FIRE Simulator** | Interactive slider showing corpus projection at any retirement age |
| 🎯 **Goal Tracker** | SIP shortfall calculation per goal (house, education, retirement) with on-track status |
| 🔬 **Portfolio X-Ray** | Overlap detection across mutual funds using Sharpe overlap algorithm |
| 💡 **Rule Engine** | 9 IF-THEN rules, each with ₹ impact, confidence score, citation, safety and growth ratings |
| 🤖 **Structured AI** | Claude/GPT returns typed JSON: title · detail · action · impact · citation · confidence |
| 👫 **Couple's Optimizer** | Joint vs. individual strategy with tax saved badge |
| 📈 **Live NAV Data** | Real-time mutual fund NAVs from AMFI India (free, cached 4h) |
| 🔐 **Security** | CSP headers, rate limiting, Zod input validation, server-side sanitization |
| 📱 **Onboarding Wizard** | 4-step guided setup: Personal → Money → Goals → Documents |

---

## 🏗 System Architecture

```mermaid
graph TB
    User([👤 User]) --> Wizard[Onboarding Wizard\n4-Step Flow]
    User --> Scanner[Form 16 Scanner\nPDF Upload]

    Wizard --> API[/api/analyze\nPOST]
    Scanner --> Upload[/api/upload\nMultipart Form]
    Upload --> Extract[Document Extraction\nMock → AWS Textract]
    Extract --> API

    API --> Zod[Zod Validation\nSchema Enforcement]
    Zod --> Middleware[Next.js Middleware\nCSP · Rate Limit · Headers]

    Zod --> RuleEngine[Rule Engine\n9 IF-THEN Rules]
    Zod --> TaxEngine[Tax Engine\nOld vs New FY25-26]
    Zod --> PortfolioEngine[Portfolio X-Ray\nSharpe Overlap]
    Zod --> GoalsEngine[Goal Planner\nSIP Shortfall]
    Zod --> WealthEngine[FIRE Calculator\nWealth Projection]

    TaxEngine --> NetResponse[Structured\nResponse]
    RuleEngine --> NetResponse
    PortfolioEngine --> NetResponse
    GoalsEngine --> NetResponse
    WealthEngine --> NetResponse

    NetResponse --> AILayer[AI Layer\nClaude / GPT-3.5]
    AILayer --> Cache[(Cache Layer\nIn-Memory / Redis)]
    AILayer --> NetResponse

    NetResponse --> AMFI[AMFI NAV API\nLive Fund Data]
    NetResponse --> MongoDB[(MongoDB Atlas\nUser Profiles)]

    NetResponse --> Dashboard[Dashboard\nRecharts · Framer Motion]
```

---

## 🛠 Tech Stack

### Core
| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion animations |
| **Charts** | Recharts (AreaChart, PieChart, RadialBar) |
| **Icons** | Lucide React |
| **Fonts** | Playfair Display (headings) · Inter (body) |

### Backend
| Layer | Technology |
|---|---|
| **Runtime** | Node.js via Next.js API Routes (serverless) |
| **Validation** | Zod — centralized schemas for all endpoints |
| **Database** | MongoDB (Mongoose ODM) |
| **Caching** | In-memory Map (dev) · Redis via `REDIS_URL` (prod) |
| **Logging** | Custom structured JSON logger |
| **Security** | Next.js Middleware — CSP, X-Frame-Options, rate limiting |

### AI & Financial Data
| Layer | Technology |
|---|---|
| **Primary AI** | Anthropic Claude (claude-3-haiku) — structured JSON output |
| **Fallback AI** | OpenAI GPT-3.5 Turbo |
| **Fund NAV** | AMFI India API (free, daily updated) |
| **Tax Rules** | Income Tax Act 1961 + Finance Act 2024 (hardcoded FY 25-26) |
| **Deployment** | Vercel (Mumbai `bom1` region, daily cron) |

---

## 📁 Project Structure

```
ai-money-mentor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts        # Main 7-engine analysis pipeline
│   │   │   ├── upload/route.ts         # PDF upload + validation
│   │   │   ├── portfolio/nav/route.ts  # AMFI NAV lookup + fund search
│   │   │   └── cron/update-nav/        # Daily NAV cache refresh
│   │   ├── globals.css                 # ET brand tokens + theme
│   │   ├── layout.tsx                  # SEO metadata, fonts
│   │   └── page.tsx                    # App shell, state machine
│   │
│   ├── components/
│   │   ├── Onboarding/
│   │   │   └── OnboardingWizard.tsx   # 4-step guided setup
│   │   ├── Dashboard.tsx              # Main results UI
│   │   ├── Form16Scanner.tsx          # PDF drag-and-drop upload
│   │   ├── ExplainBadge.tsx           # "Why this advice?" tooltip
│   │   ├── GoalTracker.tsx            # Goal progress cards
│   │   └── ThemeToggle.tsx            # Dark/light mode
│   │
│   ├── lib/
│   │   ├── finance/
│   │   │   ├── tax.ts                 # Indian tax engine (Old/New regime)
│   │   │   ├── rules.ts               # IF-THEN rule engine (9 rules)
│   │   │   ├── portfolio.ts           # Overlap detection algorithm
│   │   │   ├── goals.ts               # Goal-based SIP planner
│   │   │   ├── fire.ts                # FIRE date / corpus projector
│   │   │   ├── xirr.ts                # Newton-Raphson XIRR
│   │   │   ├── scoring.ts             # Legacy health score
│   │   │   ├── insights.ts            # Legacy insight generator
│   │   │   ├── planning.ts            # Legacy SIP planner
│   │   │   └── confidence.ts          # Per-recommendation confidence
│   │   ├── data/
│   │   │   └── mf.ts                  # AMFI NAV fetcher + portfolio calc
│   │   ├── ai.ts                      # AI layer (structured JSON output)
│   │   ├── cache.ts                   # Cache-aside with Redis fallback
│   │   ├── db.ts                      # MongoDB connection (singleton)
│   │   ├── logger.ts                  # Structured JSON logger
│   │   ├── schemas.ts                 # Zod schemas (all endpoints)
│   │   └── validation.ts              # Legacy field-level validation
│   │
│   ├── middleware.ts                  # Security headers + rate limiting
│   │
│   └── models/
│       ├── UserFinance.ts             # Legacy analysis record
│       └── FinancialProfile.ts        # Full user profile with goals
│
├── vercel.json                        # Deployment + cron config
├── .env.local                         # (see Environment Variables section)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (free tier works)
- At least one AI API key (Anthropic or OpenAI)

### 1. Clone

```bash
git clone https://github.com/Goutam-2702/AI-Money-Mentor.git
cd AI-Money-Mentor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys (see [Environment Variables](#-environment-variables) below).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Try the Demo

Click **"Demo Dashboard"** on the upload screen to instantly load a sample financial profile and see all features without uploading a real PDF.

---

## 🔑 Environment Variables

Create `.env.local` in the project root:

```env
# ── AI (at least one required) ────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...          # Claude — primary AI provider
OPENAI_API_KEY=sk-...                 # GPT-3.5 — fallback

# ── Database ──────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-money-mentor

# ── Cache (optional — in-memory fallback used if not set) ────────────────────
REDIS_URL=redis://...                  # Upstash or Railway Redis

# ── Security ──────────────────────────────────────────────────────────────────
CRON_SECRET=your-random-secret         # Protects /api/cron/* endpoints

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL=info                         # trace | debug | info | warn | error
```

> **Note:** The app runs in **Demo Mode** if no AI keys are provided — all UI, charts, and financial calculations still work fully.

---

## 📡 API Reference

### `POST /api/analyze`

The main analysis pipeline. Accepts a financial profile and returns a comprehensive wealth analysis.

**Request Body**
```json
{
  "age": 30,
  "income": 120000,
  "expenses": 65000,
  "savings": 500000,
  "loans": 800000,
  "investments": "ELSS ₹1.5L, NPS, Nifty 50 Index Fund",
  "goals": "FIRE by 45, daughter's college in 12 years",
  "riskAppetite": "moderate",
  "goalsList": [
    {
      "title": "Child Education",
      "targetAmount": 5000000,
      "targetDate": "2036-07-01",
      "currentSaved": 200000,
      "priority": "high"
    }
  ]
}
```

**Response Shape**
```json
{
  "success": true,
  "data": {
    "score": {
      "overall": 72,
      "emergency": 60,
      "insurance": 50,
      "debt": 75,
      "tax": 55,
      "investments": 80,
      "retirement": 65
    },
    "taxComparison": {
      "recommendation": "new",
      "savedAmount": 43200,
      "savedMonthly": 3600,
      "reasoning": "...",
      "old": { "totalTax": 187200, "effectiveRate": 13.0, "inHandMonthly": 91800 },
      "new": { "totalTax": 144000, "effectiveRate": 10.0, "inHandMonthly": 95400 }
    },
    "recommendations": [
      {
        "id": "term_insurance",
        "title": "Get ₹1.8Cr Term Life Cover Immediately",
        "insight": "You have no term insurance — your family has zero income protection.",
        "action": "Buy ₹1.8Cr cover (30-year term) on PolicyBazaar. ~₹14,400/year.",
        "impact": "Family protected with ₹1.8Cr cover for ₹14,400/year.",
        "citation": "IRDAI · 15× annual income rule",
        "confidence": 92,
        "safetyScore": 100,
        "growthScore": 0,
        "severity": "critical"
      }
    ],
    "goalPlans": [...],
    "portfolioAnalysis": {...},
    "wealth_projection": [...],
    "aiAdvice": {
      "summary": "...",
      "keyInsight": "...",
      "taxVerdict": "...",
      "redFlags": [...],
      "monthlyChecklist": [...]
    }
  }
}
```

### `POST /api/upload`

Accepts a PDF/image file (multipart/form-data) and returns extracted Form 16 fields.

```bash
curl -X POST https://your-domain.vercel.app/api/upload \
  -F "file=@form16.pdf"
```

### `GET /api/portfolio/nav?search=hdfc`

Search mutual funds by name using AMFI data.

### `POST /api/portfolio/nav`

Get live NAV for specific AMFI scheme codes.

```json
{ "schemeCodes": ["120503", "119598", "101206"] }
```

---

## 🧮 Financial Engines

### 1. Indian Tax Engine (`src/lib/finance/tax.ts`)
- Implements **exact FY 2025-26 slabs** for both Old and New Tax Regimes
- Handles all **age-based exemptions** (Regular / Senior 60+ / Super Senior 80+)
- Applies **Section 87A rebate** (₹12,500 old / ₹25,000 new)
- Models **surcharge tiers** (10%, 15%, 25%, 37%)
- Calculates from deductions: 80C · 80D · HRA · LTA · 24(b) Home Loan · 80CCD(1B) NPS

### 2. Rule Engine (`src/lib/finance/rules.ts`)
9 IF-THEN rules covering the most impactful personal finance decisions:

| Rule ID | Trigger | Output |
|---|---|---|
| `emergency_fund_build` | < 6 months cover | Months to goal, redirect amount |
| `term_insurance` | No term cover | 15× income cover amount, premium estimate |
| `health_insurance` | No health cover | ₹10L floater recommendation |
| `tax_regime_switch` | Savings > ₹10K | Exact ₹ saving, submission deadline |
| `section_80c` | Unused 80C limit | ₹46,800 tax saving, ELSS SIP amount |
| `high_debt_reduction` | EMI > 40% income | Priority debt to clear, interest cost |
| `increase_sip` | SIP gap detected | 20-year wealth impact at 12% CAGR |
| `fire_feasibility` | Savings rate < 20% | Required savings rate for target FIRE age |
| `diversify_portfolio` | Overlap score < 60 | Expense ratio saving over 20 years |

### 3. Portfolio Overlap Detection (`src/lib/finance/portfolio.ts`)
Uses the **Sharpe overlap formula** — calculates the minimum-weighted common stock exposure between two funds as a percentage of the smaller fund's top-holdings total weight.

```
Overlap % = Σ min(w₁ᵢ, w₂ᵢ) / min(Σw₁, Σw₂) × 100
```

### 4. XIRR Calculator (`src/lib/finance/xirr.ts`)
Newton-Raphson iteration with 200 max iterations and 1e-7 precision — the industry standard for IRR calculation in Indian mutual funds.

### 5. Goal Planner (`src/lib/finance/goals.ts`)
Projects goal feasibility using:
- **FV of current savings** at monthly compounding
- **FV of SIP contributions** using exact SIP future value formula
- **Required SIP** to bridge the shortfall
- Risk-adjusted returns: 7% (conservative) · 10% (moderate) · 13% (aggressive)

---

## 💡 Sample Output

**Input:** Age 30, ₹1.2L/month income, ₹65K expenses, ₹5L savings, no term insurance

| Metric | Result |
|---|---|
| Money Health Score | **68 / 100** |
| Tax Saving (New Regime) | **₹43,200/year** (₹3,600/month more in-hand) |
| Emergency Fund Gap | **₹1.9L shortfall** (3.6 months vs. 6 month target) |
| FIRE Date (current rate) | **Age 52** |
| FIRE Date (optimized) | **Age 47** (5 years earlier) |
| Portfolio Overlap | **Axis Bluechip ↔ Nifty 50: 72%** — High |
| Top Risk Alert | No term insurance — family has zero income protection |

---

## 🗺 Roadmap

### ✅ Phase 1 — UI & Financial Engine (Complete)
- [x] 6-dimensional Money Health Score
- [x] Old vs. New Tax Regime comparison engine
- [x] FIRE Simulator with interactive slider
- [x] Portfolio overlap detection
- [x] Couple's Optimizer split view
- [x] Rule-based recommendation engine (9 rules)
- [x] Form 16 PDF upload with scanning animation
- [x] SEBI disclaimer

### ✅ Phase 2 — Production Hardening (Complete)
- [x] Zod validation on all API routes
- [x] Security headers + rate limiting middleware
- [x] Structured JSON AI output (citations, confidence, ₹ impact)
- [x] Live AMFI NAV integration (no API key needed)
- [x] XIRR / CAGR calculators
- [x] Goal-based planning engine
- [x] Per-recommendation confidence scoring
- [x] ExplainBadge tooltip ("Why this advice?")
- [x] 4-step Onboarding Wizard
- [x] Structured logging
- [x] Vercel cron for daily NAV refresh

### 🔜 Phase 3 — Advanced Features (Planned)
- [ ] NextAuth v5 + Google login (user memory across sessions)
- [ ] RAG pipeline with Pinecone (Indian tax law + SEBI circular embeddings)
- [ ] AWS Textract for real Form 16 field extraction
- [ ] Real-time portfolio tracker (link AMFI folio numbers)
- [ ] Automated monthly PDF report generation
- [ ] Zerodha Kite Connect integration (live portfolio import)
- [ ] WhatsApp notifications for monthly summaries

---

## 🔒 Security

- **Input Validation:** All API inputs validated with Zod schemas before processing
- **Rate Limiting:** 20 requests/minute per IP (in-memory, upgradeable to Upstash Redis)
- **Security Headers:** Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- **Data Sanitization:** All string inputs trimmed and length-capped server-side
- **No PAN Storage:** PAN numbers (if extracted from Form 16) are never persisted
- **HTTPS Enforced:** Vercel enforces TLS on all routes

---

## 🏛 Regulatory Compliance

> **SEBI Disclaimer:** AI Money Mentor provides general financial information and educational content only. It does not constitute investment advice, financial planning, or portfolio management services as defined under **SEBI (Investment Advisers) Regulations, 2013**. All projections are estimates based on assumed rates of return and are not guaranteed. Please consult a **SEBI-registered Investment Advisor** before making financial decisions.
>
> Mutual fund investments are subject to market risks. Past performance does not guarantee future results. Tax calculations are based on publicly available Income Tax Act provisions for FY 2025-26 and may not reflect individual circumstances.

---

## 🧑‍💻 Author

**Goutam** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Goutam--2702-24292e?style=flat-square&logo=github)](https://github.com/Goutam-2702)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for 40 million Indian salaried professionals who deserve better financial advice.**

[![Live Demo](https://img.shields.io/badge/Try_it_Live-ai--money--mentor--sigma.vercel.app-8B0000?style=for-the-badge)](https://ai-money-mentor-sigma.vercel.app)

</div>
