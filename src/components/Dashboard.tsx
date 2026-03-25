"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ShieldAlert, Lightbulb, TrendingUp, AlertTriangle, CalendarDays, Activity } from "lucide-react";

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];

export function Dashboard({ data, formData, onReset }: { data: any, formData: any, onReset: () => void }) {
  const chartData = [
    { name: 'Expenses', value: formData.expenses },
    { name: 'Savings/Disposable', value: formData.income - formData.expenses > 0 ? formData.income - formData.expenses : 0 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const planData = [
    { month: 'Month 1', tasks: data.plan_3_months?.month1 || [] },
    { month: 'Month 2', tasks: data.plan_3_months?.month2 || [] },
    { month: 'Month 3', tasks: data.plan_3_months?.month3 || [] },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Your AI Financial Plan</h1>
          <p className="text-slate-500 mt-2">Here is a personalized analysis based on current Indian market insights.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Health Score</div>
            <div className={`text-6xl font-black tracking-tighter ${getScoreColor(data.score)}`}>{data.score}<span className="text-2xl text-slate-400 font-bold">/100</span></div>
          </div>
          <button 
            onClick={onReset}
            className="px-6 py-3 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition"
          >
            Start Over
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6"><Activity className="w-5 h-5 text-emerald-500" /> Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '12px',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  itemStyle={{
                    color: 'var(--foreground)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Problems & Actions */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problems */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/30"
          >
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5" /> Key Problems Detected
            </h3>
            <ul className="space-y-3">
              {data.problems?.map((p: string, i: number) => (
                <li key={i} className="flex gap-3 text-red-900/80 dark:text-red-200">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span className="text-sm font-medium">{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30"
          >
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5" /> Immediate Actions
            </h3>
            <ul className="space-y-3">
              {data.actions?.map((p: string, i: number) => (
                <li key={i} className="flex gap-3 text-emerald-900/80 dark:text-emerald-200">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-sm font-medium">{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investments */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 dark:bg-green-900/10 rounded-3xl p-6 border border-green-100 dark:border-green-900/30"
          >
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" /> Investment Strategy
            </h3>
            <ul className="space-y-3">
              {data.investments?.map((p: string, i: number) => (
                <li key={i} className="flex gap-3 items-start text-green-900/80 dark:text-green-200">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
        </motion.div>
        
        {/* Warnings */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-6 border border-amber-100 dark:border-amber-900/30"
          >
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" /> Risk Warnings
            </h3>
            <ul className="space-y-3">
              {data.warnings?.map((p: string, i: number) => (
                <li key={i} className="flex gap-3 items-start text-amber-900/80 dark:text-amber-200">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-medium leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
        </motion.div>
      </div>

      {/* 3 Month Plan */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8"
      >
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-8">
          <CalendarDays className="w-6 h-6 text-teal-500" /> Actionable 3-Month Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planData.map((month, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-teal-100 dark:border-teal-900/50">
              <div className="absolute w-4 h-4 rounded-full bg-teal-500 -left-[9px] top-0 border-4 border-white dark:border-slate-900"></div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{month.month}</h4>
              <ul className="space-y-4">
                {month.tasks?.map((task: string, i: number) => (
                  <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
