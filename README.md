# 💹 AI Money Mentor — by Economic Times

> **A premium, AI-powered personal wealth management platform built for the Indian investor.**  
> Powered by Claude / OpenAI · Built with Next.js 16 · Styled with Tailwind CSS v4

---

## 📸 Overview

AI Money Mentor is a high-fidelity financial intelligence dashboard integrated into the Economic Times (ET) product ecosystem. It transforms raw financial data—income, expenses, debts, investments—into a structured, personalised wealth strategy in seconds.

The platform goes far beyond a basic "budget tracker." It acts as a **Personal Wealth Manager**, providing a Money Health Score, FIRE Path Simulation, Portfolio X-Ray, Tax Optimisation engine, and an actionable monthly plan—all delivered with a premium `Playfair Display` + `Inter` typography system over a sophisticated Deep Maroon, Slate Grey, and Crisp White colour palette.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Form 16 Scanner** | Drag-and-drop UI with a "scanning laser" animation to parse PDF uploads and extract tax deductions automatically |
| **Money Health Dashboard** | Central gauge chart (0–100 overall score) with 6 radial mini-metrics: Emergency, Insurance, Debt, Tax, Investments, Retirement |
| **FIRE Path Simulator** | Interactive slider to drag a target retirement age; real-time multi-area graph shifts showing Corpus vs. Savings vs. Inflation |
| **Couple's Tax Optimizer** | Split-screen comparison of Individual Filing vs. AI-Optimized Joint Strategy, with a highlighted gold "Tax Saved" badge |
| **Portfolio X-Ray** | Mutual Fund list showing Red Flag icons (High Expense Ratio) and Overlap Alerts with hover tooltips |
| **AI Recommendations + Safety Meter** | Each actionable insight includes dual progress bars for **Safety** and **Growth** — addressing the Indian investor's safety-first mindset |
| **WhatsApp-style Action Bubble** | A persistent floating notification delivering 1-sentence, hyper-specific insights (e.g., *"Switch tax regime to save ₹12,000 this month"*) |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 (custom palette: Maroon `#8B0000`, Gold `#D4AF37`) |
| **Fonts** | Playfair Display (Serif headings), Inter (Sans-serif data) via Google Fonts |
| **Charts** | [Recharts](https://recharts.org/) — AreaChart, PieChart, RadialBarChart |
| **Animations** | [Framer Motion](https://www.framer-motion.com/) |
| **AI Backend** | [Anthropic Claude](https://www.anthropic.com/) (primary) · [OpenAI](https://openai.com/) (fallback) |
| **Database** | [MongoDB](https://www.mongodb.com/) via Mongoose |
| **Icons** | [Lucide React](https://lucide.dev/) — thin-line minimalist vectors |

---

## 📁 Project Structure

```
ai-money-mentor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/        # POST endpoint — AI financial analysis
│   │   ├── globals.css          # Tailwind v4 theme (maroon, gold, slate palette)
│   │   ├── layout.tsx           # Root layout with Playfair + Inter fonts
│   │   └── page.tsx             # Main entry — scanner → loading → dashboard
│   ├── components/
│   │   ├── Form16Scanner.tsx    # Drag-and-drop PDF uploader with scan animation
│   │   ├── Dashboard.tsx        # Full wealth dashboard (all 6 modules)
│   │   ├── ThemeProvider.tsx    # next-themes dark/light mode wrapper
│   │   └── ThemeToggle.tsx      # Header theme switcher button
│   └── lib/
│       ├── ai.ts                # Claude / OpenAI client abstraction
│       ├── db.ts                # MongoDB connection singleton
│       ├── utils.ts             # Shared utilities
│       └── finance/
│           ├── scoring.ts       # Money Health Score engine (0–100)
│           ├── fire.ts          # FIRE retirement corpus projections
│           ├── insights.ts      # Rule-based shock insights & alerts
│           └── planning.ts      # Monthly action plan generator
├── .env.example                 # Environment variable template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `≥ 18`
- A MongoDB Atlas cluster (free tier works)
- An Anthropic **or** OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ai-money-mentor.git
cd ai-money-mentor
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# .env.local
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-money-mentor
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # Optional fallback
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How the AI Engine Works

```
User Input / PDF Upload
        │
        ▼
┌───────────────────────────────────┐
│  Finance Engine (lib/finance/)    │
│  · scoring.ts → Health Score      │
│  · fire.ts    → FIRE Projections  │
│  · insights.ts→ Shock Alerts      │
│  · planning.ts→ Monthly Plan      │
└───────────────────────────────────┘
        │
        ▼
┌─────────────────────┐
│  AI Layer (lib/ai)  │  ← Anthropic Claude (primary)
│  Generates summary, │  ← OpenAI GPT (fallback)
│  verdicts, & advice │
└─────────────────────┘
        │
        ▼
   Dashboard UI
```

The rule-based finance engine computes the Money Health Score **before** calling the LLM, ensuring deterministic, fast results. The AI layer enriches with natural-language summaries and personalised advice layered on top.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key (primary AI) |
| `OPENAI_API_KEY` | ⬜ | OpenAI key (optional fallback) |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `brand-maroon` | `#8B0000` | Primary CTA, headings, active states |
| `brand-gold` | `#D4AF37` | Tax savings badges, highlights |
| `brand-slate` | `#475569` | Muted data, secondary text |
| Font (Serif) | Playfair Display | Section headings — authoritative ET feel |
| Font (Sans) | Inter | Data labels, body text, UI elements |

---

## 🛡️ Security & Privacy

- All PDF processing is performed server-side. No file contents are stored permanently.
- MongoDB stores only anonymised session-level analysis results.
- All API routes are protected from direct client-side exposure of AI keys.
- `.env.local` is git-ignored by default.

---

## 📄 License

This project is private and proprietary. Built as part of the Economic Times AI Feature Initiative.

---

<p align="center">
  Built with ❤️ for the Indian investor · Powered by <strong>Economic Times Intelligence</strong>
</p>
