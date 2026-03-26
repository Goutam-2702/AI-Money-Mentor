"use client";

import { useState } from "react";
import { Form16Scanner } from "@/components/Form16Scanner";
import { Dashboard } from "@/components/Dashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [data, setData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleSubmit = async (userInput: any) => {
    setFormData(userInput);
    setStatus('loading');
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInput),
      });

      const responseData = await res.json();
      
      if (responseData.success) {
        setData(responseData.data);
        setStatus('success');
      } else {
        alert("Error analyzing: " + responseData.error);
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      // Failsafe for the demo if API fails
      setData({
        score: {
          overall: 78,
          emergencyFund: 90,
          debt: 60,
          investments: 80,
          insurance: 75,
          taxOptimization: 50,
        },
        advice: "Switch to New Tax Regime to save ₹12,000 this month.",
      });
      setStatus('success');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors font-sans flex flex-col">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl tracking-tight text-[#8B0000] dark:text-red-500 hidden sm:block">
              ET | <span className="font-sans font-medium text-slate-800 dark:text-slate-200 uppercase tracking-widest text-lg">Money Mentor</span>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-[#8B0000] dark:text-red-50 mb-6 tracking-tight leading-tight">
                  Your AI Personal Wealth Manager
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-sans">
                  Drop your Form 16 or Investment PDF below. Our advanced AI scans for deductions, optimizes your portfolio, and guides you to early retirement.
                </p>
              </div>
              <Form16Scanner onSubmit={handleSubmit} />
            </motion.div>
          )}

          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                <div className="w-24 h-24 rounded-full border-4 border-[#8B0000] border-t-transparent animate-spin absolute top-0 left-0"></div>
                <Wallet className="w-8 h-8 text-[#8B0000] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold mt-8 text-slate-800 dark:text-slate-100">Generating Wealth Strategy...</h2>
              <p className="text-slate-500 mt-2 font-sans">Cross-referencing latest tax regulations and market data.</p>
            </motion.div>
          )}

          {status === 'success' && data && (
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

      {/* WhatsApp Test: Quick Action Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3 w-80 mb-4 ml-auto"
        >
          <div className="bg-[#8B0000] text-white p-2 rounded-full mt-1">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 font-sans text-sm">Action Required</p>
            <p className="text-slate-600 dark:text-slate-400 font-sans text-sm mt-1">
              You can save <span className="text-[#8B0000] dark:text-red-400 font-bold">₹12,000</span> more this month by switching to the New Tax Regime. <a href="#" className="underline font-medium hover:text-[#8B0000]">Click to apply</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

