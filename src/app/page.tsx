"use client";

import { useState } from "react";
import { InputForm } from "@/components/InputForm";
import { Dashboard } from "@/components/Dashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
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
      alert("Something went wrong!");
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setData(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="AI Money Mentor Logo" 
              width={60} 
              height={60} 
              className="h-14 w-14 object-contain transition-transform hover:scale-105"
              priority
            />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
              AI Money Mentor
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                  Take Control of Your Financial Future
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  AI Money Mentor analyzes your income, expenses, and goals to build a personalized, actionable roadmap tailored for the Indian market.
                </p>
              </div>
              <InputForm onSubmit={handleSubmit} isLoading={false} />
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
                <div className="w-24 h-24 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
                <Wallet className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mt-8 text-slate-800 dark:text-slate-200">Analyzing your finances...</h2>
              <p className="text-slate-500 mt-2">Connecting to AI to generate your customized plan.</p>
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
    </div>
  );
}
