"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { confidenceLabel } from "@/lib/finance/confidence";

interface Recommendation {
  id?: string;
  title: string;
  detail?: string;
  text?: string;
  action?: string;
  citation?: string;
  confidence?: number;
  safetyScore?: number;
  growthScore?: number;
  impact?: string;
}

interface ExplainBadgeProps {
  recommendation: Recommendation;
  position?: "left" | "right";
}

export function ExplainBadge({ recommendation, position = "right" }: ExplainBadgeProps) {
  const [open, setOpen] = useState(false);
  const confidence = recommendation.confidence ?? 75;
  const { label, color, description } = confidenceLabel(confidence);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="text-slate-400 hover:text-[#8B0000] dark:hover:text-red-400 transition"
        aria-label="Why this advice?"
        title="Why this advice?"
      >
        <Info className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 text-sm ${
              position === "left" ? "right-0" : "left-0"
            }`}
          >
            {/* Why Section */}
            <p className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-sm">
              💡 Why this recommendation?
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-3">
              {recommendation.detail ?? recommendation.text ?? "Based on your financial profile analysis."}
            </p>

            {/* Action */}
            {recommendation.action && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-2 mb-3">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  → {recommendation.action}
                </p>
              </div>
            )}

            {/* Impact */}
            {recommendation.impact && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                📈 {recommendation.impact}
              </p>
            )}

            {/* Citation */}
            {recommendation.citation && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mb-3">
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-start gap-1">
                  <span className="text-blue-400 shrink-0">§</span>
                  {recommendation.citation}
                </p>
              </div>
            )}

            {/* Confidence */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Confidence</span>
                <span className={`text-xs font-bold ${color}`}>{label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-tight">{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
