"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import type { GoalPlan } from "@/lib/finance/goals";

interface GoalTrackerProps {
  goalPlans: GoalPlan[];
  totalGoalSIPRequired: number;
}

const PRIORITY_CONFIG = {
  critical: { color: "bg-red-500", text: "text-red-600", label: "Critical" },
  high: { color: "bg-amber-500", text: "text-amber-600", label: "High" },
  medium: { color: "bg-blue-500", text: "text-blue-600", label: "Medium" },
  low: { color: "bg-slate-400", text: "text-slate-500", label: "Low" },
};

function formatMonths(months: number): string {
  if (months >= 24) return `${Math.round(months / 12)} years`;
  if (months >= 12) return `${(months / 12).toFixed(1)} years`;
  return `${months} months`;
}

export function GoalTracker({ goalPlans, totalGoalSIPRequired }: GoalTrackerProps) {
  if (!goalPlans || goalPlans.length === 0) return null;

  const onTrackCount = goalPlans.filter((g) => g.onTrack).length;
  const atRiskCount = goalPlans.length - onTrackCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">
              Goal Tracker
            </h2>
            <p className="text-xs font-sans text-slate-500">
              {onTrackCount}/{goalPlans.length} goals on track
            </p>
          </div>
        </div>

        {totalGoalSIPRequired > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-400 font-sans">Additional SIP needed</p>
            <p className="text-lg font-serif font-black text-[#8B0000] dark:text-red-400">
              ₹{totalGoalSIPRequired.toLocaleString("en-IN")}
              <span className="text-xs font-sans font-normal text-slate-500">/mo</span>
            </p>
          </div>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium font-sans border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {onTrackCount} On Track
        </div>
        {atRiskCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium font-sans border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5" />
            {atRiskCount} Need Attention
          </div>
        )}
      </div>

      {/* Goal Cards */}
      <div className="space-y-4">
        {goalPlans.map((plan, i) => {
          const priority = PRIORITY_CONFIG[plan.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;

          return (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`rounded-2xl border p-5 transition-all ${
                plan.onTrack
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10"
                  : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10"
              }`}
            >
              {/* Title row */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                  <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {plan.title}
                  </h3>
                  <span className={`text-xs font-sans ${priority.text} dark:opacity-80`}>
                    ({priority.label})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-sans text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatMonths(plan.monthsRemaining)}
                </div>
              </div>

              {/* Amount row */}
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-xs text-slate-500 font-sans">Target</p>
                  <p className="text-base font-serif font-bold text-slate-800 dark:text-slate-100">
                    ₹{plan.targetAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-sans">Projected</p>
                  <p className={`text-base font-serif font-bold ${plan.onTrack ? "text-emerald-600" : "text-amber-600"}`}>
                    ₹{plan.projectedCorpus.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-sans text-slate-400 mb-1">
                  <span>Current: ₹{plan.currentSaved.toLocaleString("en-IN")}</span>
                  <span>{plan.progressPercent}% saved</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${plan.progressPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${plan.onTrack ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                </div>
              </div>

              {/* Suggestion */}
              <div className={`rounded-xl p-2.5 ${plan.onTrack ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                <p className="text-xs font-sans text-slate-700 dark:text-slate-300">
                  {plan.suggestion}
                </p>
              </div>

              {/* Extra stats */}
              {!plan.onTrack && plan.requiredMonthlySIP > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-xs text-slate-500 font-sans">
                    Additional SIP needed
                  </span>
                  <span className="text-sm font-bold font-sans text-amber-600 dark:text-amber-400">
                    +₹{plan.requiredMonthlySIP.toLocaleString("en-IN")}/month
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Return rate note */}
      <p className="text-xs text-slate-400 font-sans mt-4 text-center">
        Projections assume {goalPlans[0]?.annualReturnUsed ?? 10}% annual return.
        Actual returns may vary. Mutual fund investments are subject to market risk.
      </p>
    </motion.div>
  );
}
