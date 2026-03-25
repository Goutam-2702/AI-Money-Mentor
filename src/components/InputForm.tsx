"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Briefcase, PiggyBank, Target, ArrowRight, Loader2 } from "lucide-react";

export function InputForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
  const [formData, setFormData] = useState({
    age: 28,
    income: 80000,
    expenses: 45000,
    savings: 150000,
    investments: "No investments yet",
    loans: 0,
    goals: "Buy a house in 5 years, save for marriage"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'investments' || name === 'goals' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Your Financial Profile</h2>
        <p className="text-emerald-100">Let's understand your current situation to give you personalized AI advice.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
            <input 
              name="age" 
              type="number" 
              value={formData.age} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-slate-500" /> Monthly Income
            </label>
            <input 
              name="income" 
              type="number" 
              value={formData.income} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-red-500" /> Monthly Expenses
            </label>
            <input 
              name="expenses" 
              type="number" 
              value={formData.expenses} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-green-500" /> Total Savings (Emergency)
            </label>
            <input 
              name="savings" 
              type="number" 
              value={formData.savings} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-orange-500" /> Total Loans/Debts
            </label>
            <input 
              name="loans" 
              type="number" 
              value={formData.loans} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-500" /> Current Investments
            </label>
            <input 
              name="investments" 
              type="text" 
              value={formData.investments} 
              onChange={handleChange}
              placeholder="e.g. FDs, Mutual Funds, None"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" /> Financial Goals
          </label>
          <textarea 
            name="goals" 
            rows={3}
            value={formData.goals} 
            onChange={handleChange}
            placeholder="e.g. Buy a car in 2 years, save for child's education"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing your finances...
            </>
          ) : (
            <>
              Generate Free AI Plan <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
