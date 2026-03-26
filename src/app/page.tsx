"use client";

import { useState } from "react";
import { OnboardingWizard } from "@/components/Onboarding/OnboardingWizard";
import { Dashboard } from "@/components/Dashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, MessageCircle, X } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showBubble, setShowBubble] = useState(true);

  const handleSubmit = async (userInput: any) => {
    setFormData(userInput);
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInput),
      });

      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setStatus("success");
      } else {
        // Show field-level validation errors if present
        if (json.fieldErrors) {
          const firstError = Object.values(json.fieldErrors).flat()[0];
          setErrorMsg(String(firstError ?? json.error));
        } else {
          setErrorMsg(json.error ?? "Analysis failed. Please try again.");
        }
        setStatus("error");
      }
    } catch (err) {
      // Offline / network failure — show demo dashboard
      console.error("[analyze]", err);
      setData(null);
      setErrorMsg("Could not reach the server. Showing demo data.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setData(null);
    setErrorMsg("");
  };

  // Dynamic bubble message from AI advice
  const bubbleMsg =
    data?.aiAdvice?.keyInsight ??
    data?.quickAction ??
    "Upload your Form 16 to get personalised tax & investment insights.";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors font-sans flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl tracking-tight text-[#8B0000] dark:text-red-500">
              ET{" "}
              <span className="font-sans font-medium text-slate-800 dark:text-slate-200 uppercase tracking-widest text-base hidden sm:inline">
                | Money Mentor
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {status === "success" && (
              <button
                onClick={handleReset}
                className="text-sm font-sans text-slate-500 hover:text-[#8B0000] dark:hover:text-red-400 transition underline hidden sm:block"
              >
                ← New Analysis
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <AnimatePresence mode="wait">

          {/* ONBOARDING WIZARD */}
          {status === "idle" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#8B0000] dark:text-red-50 mb-4 tracking-tight leading-tight">
                  Your AI Personal Wealth Manager
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-sans">
                  AI-powered analysis of your Form 16, portfolio, and tax regime — in under 60 seconds.
                </p>
              </div>
              <OnboardingWizard onComplete={handleSubmit} />
            </motion.div>
          )}

          {/* LOADING */}
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                <div className="w-24 h-24 rounded-full border-4 border-[#8B0000] border-t-transparent animate-spin absolute top-0 left-0" />
                <Wallet className="w-8 h-8 text-[#8B0000] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">
                Generating Your Wealth Strategy...
              </h2>
              <div className="mt-4 space-y-1 text-sm font-sans text-slate-500">
                <p className="animate-pulse">⚡ Running tax regime comparison engine</p>
                <p className="animate-pulse delay-300">📊 Analysing portfolio overlap</p>
                <p className="animate-pulse delay-700">🤖 Generating AI-powered recommendations</p>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-3">
                Analysis Failed
              </h2>
              <p className="text-slate-500 font-sans mb-8">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#8B0000] text-white font-sans font-semibold rounded-xl hover:bg-[#6b0000] transition shadow-lg"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {status === "success" && data && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard data={data} formData={formData} onReset={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Floating Action Bubble ──────────────────────────────────────────── */}
      {showBubble && (
        <div className="fixed bottom-6 right-6 z-50">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3 w-80 mb-4 ml-auto"
          >
            <div className="bg-[#8B0000] text-white p-2 rounded-full mt-0.5 shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-100 font-sans text-sm">
                {status === "success" ? "AI Insight" : "Get Started"}
              </p>
              <p className="text-slate-600 dark:text-slate-400 font-sans text-xs mt-1 leading-relaxed">
                {bubbleMsg}
              </p>
            </div>
            <button
              onClick={() => setShowBubble(false)}
              className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
