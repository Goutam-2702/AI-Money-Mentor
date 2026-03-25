# AI Money Mentor

AI Money Mentor is an AI-powered personal finance advisor specifically built for Indian users. It takes basic financial data, analyzes it, calculates a "financial health score", and generates a comprehensive 3-month action plan using AI (Claude API).

## 🎯 Features

*   **Financial Profile Input**: Easy to use form for Age, Income, Expenses, Savings, Investments, Loans, and Goals.
*   **Rule-Based Health Score**: Automatically calculates your financial health score based on savings rate, emergency funds, and debt-to-income ratio.
*   **AI Recommendations Engine**: Connects to Anthropic Claude (or configured LLM) to produce personalized insights including problems, actionable steps, tax-saving investment ideas (PPF, SIPs, ELSS), and warnings.
*   **Interactive Dashboard**: Uses Recharts and Framer Motion to display colorful, dynamic insight cards and an Income vs Expenses pie chart.
*   **3-Month Road Map**: Step-by-step actionable plan mapped over the next 3 months to reach your financial goals.
*   **MongoDB Integration**: Gracefully handles saving user history into a MongoDB database (Mongoose).

## 🚀 Tech Stack

*   **Frontend**: Next.js (React), Tailwind CSS v4, Framer Motion, Lucide React, Recharts
*   **Backend**: Next.js API Routes (Serverless)
*   **Database**: MongoDB via Mongoose
*   **AI**: Anthropic API SDK (`@anthropic-ai/sdk`)

## 🛠️ Installation & Setup

1. **Clone or Extract the source code.**
2. **Install dependencies:**
   `npm install`
3. **Set up Environment Variables:**
   Copy the example environment file:
   `cp .env.example .env.local`
   Fill in your API keys in `.env.local`:
   *   `MONGODB_URI`: Your MongoDB connection string.
   *   `ANTHROPIC_API_KEY`: Your Claude API key. *(Note: If you leave this blank, the app will use a built-in mock AI response for testing).*
4. **Start the development server:**
   `npm run dev`
5. **Open** `http://localhost:3000` in your browser.

## 📝 Usage workflow

1. Open the app on `localhost:3000`.
2. Fill up the financial form accurately (in ₹ INR).
3. Click on **Generate Free AI Plan**.
4. View your animated, responsive dashboard showing your final score, rule analysis, pie chart, AI actions, and a personalized 3-month path to financial stability.

*(Crafted as a production-ready application layout.)*
