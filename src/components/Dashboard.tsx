"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertTriangle, CalendarDays, Activity, Flame, Bot, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6'];

export function Dashboard({ data, formData, onReset }: { data: any, formData: any, onReset: () => void }) {
  const investable = formData.income - formData.expenses > 0 ? formData.income - formData.expenses : 0;
  
  const chartData = [
    { name: 'Expenses', value: formData.expenses },
    { name: 'Investable Cashflow', value: investable },
  ];

  const getScoreInfo = (score: number) => {
    if (score >= 80) return { color: 'text-green-500', bg: 'bg-green-500', text: 'Excellent' };
    if (score >= 50) return { color: 'text-amber-500', bg: 'bg-amber-500', text: 'Needs Improvement' };
    return { color: 'text-red-500', bg: 'bg-red-500', text: 'Critical Action Needed' };
  };

  const getInsightIcon = (type: string) => {
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (type === 'danger') return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  const scoreInfo = getScoreInfo(data.score);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* 1. TOP SUMMARY CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 overflow-hidden rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative"
      >
        <div className={`absolute top-0 left-0 w-full h-2 ${scoreInfo.bg}`} />
        <div className="p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Your Financial Blueprint</h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              Health Status: <span className={`${scoreInfo.color} font-bold`}>{scoreInfo.text}</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Score</div>
              <div className={`text-6xl font-black tracking-tighter ${scoreInfo.color}`}>
                {data.score}
                <span className="text-2xl text-slate-400 font-bold">/100</span>
              </div>
            </div>
            <button 
              onClick={onReset}
              className="px-6 py-3 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              Recalculate
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. HERO FEATURE: WHAT TO DO THIS MONTH */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CalendarDays className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm uppercase tracking-wider font-black shadow-lg">Hero Rule</span>
            What Should I Do THIS MONTH?
          </h2>
          <div className="space-y-4 max-w-3xl">
            {data.monthly_plan?.map((step: string, i: number) => (
              <div key={i} className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-inner border border-emerald-500/30">
                  {i + 1}
                </div>
                <p className="text-lg font-medium tracking-tight mt-0.5 text-slate-100">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. CASHFLOW CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col"
        >
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-emerald-500" /> Cashflow</h3>
          <div className="flex-1 min-h-[250px]">
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
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '12px',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. ALGORITHMIC INSIGHTS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><AlertTriangle className="w-5 h-5 text-amber-500" /> System Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.insights?.map((insight: any, i: number) => (
              <div 
                key={i} 
                className={`p-4 rounded-2xl border ${
                  insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 
                  insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 
                  'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                } flex gap-4 items-start`}
              >
                <div className="shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
                <p className={`text-sm font-medium ${
                  insight.type === 'danger' ? 'text-red-900 dark:text-red-200' : 
                  insight.type === 'success' ? 'text-green-900 dark:text-green-200' : 
                  'text-amber-900 dark:text-amber-200'
                }`}>{insight.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 5. FIRE TARGETS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 p-4 opacity-5 pointer-events-none">
            <Flame className="w-48 h-48" />
          </div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Flame className="w-5 h-5 text-orange-500" /> F.I.R.E Targets</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Base Target (25x Yearly Expenses)</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
                ₹{((data.fire_plan?.baseFireCorpus) || 0).toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                Real Target (Inflation Adjusted {data.fire_plan?.inflationRate}% over {data.fire_plan?.yearsToProjection}yrs)
              </p>
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                ₹{((data.fire_plan?.inflationAdjustedCorpus) || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* 6. AI MENTOR SUMMARY */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30"
        >
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-800 dark:text-emerald-400">
            <Bot className="w-5 h-5" /> Mentor's Verdict
          </h3>
          <div className="prose prose-sm dark:prose-invert text-emerald-900 dark:text-emerald-100/80 leading-relaxed font-medium">
            {data.ai_summary}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
