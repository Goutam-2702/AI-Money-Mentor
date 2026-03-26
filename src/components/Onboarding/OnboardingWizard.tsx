"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, IndianRupee, Target, FileText,
  ChevronRight, ChevronLeft, Check, Briefcase, Home, GraduationCap, Plane, Car, HeartPulse
} from "lucide-react";
import { Form16Scanner } from "@/components/Form16Scanner";

type RiskType = "conservative" | "moderate" | "aggressive";

interface OnboardingData {
  age: number;
  city: string;
  employmentType: "salaried" | "self_employed" | "freelance";
  income: number;
  expenses: number;
  savings: number;
  loans: number;
  riskAppetite: RiskType;
  selectedGoals: string[];
  hasTermInsurance: boolean;
  hasHealthInsurance: boolean;
}

const GOAL_OPTIONS = [
  { id: "retirement", label: "Retirement / FIRE", icon: HeartPulse, color: "text-purple-500" },
  { id: "house", label: "Buy a House", icon: Home, color: "text-blue-500" },
  { id: "education", label: "Child Education", icon: GraduationCap, color: "text-amber-500" },
  { id: "travel", label: "Travel / Sabbatical", icon: Plane, color: "text-sky-500" },
  { id: "car", label: "Buy a Car", icon: Car, color: "text-green-500" },
  { id: "wealth", label: "Wealth Building", icon: IndianRupee, color: "text-emerald-500" },
];

const RISK_OPTIONS: Array<{ value: RiskType; label: string; desc: string; color: string }> = [
  { value: "conservative", label: "Conservative", desc: "FDs, Debt Funds (6–8%)", color: "border-blue-400 bg-blue-50 dark:bg-blue-950/30" },
  { value: "moderate", label: "Moderate", desc: "Balanced Funds (9–11%)", color: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" },
  { value: "aggressive", label: "Aggressive", desc: "Pure Equity (12–15%)", color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30" },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            i < current ? "bg-[#8B0000] text-white" :
            i === current ? "bg-[#8B0000] text-white ring-4 ring-red-200 dark:ring-red-900" :
            "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}>
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
              i < current ? "bg-[#8B0000]" : "bg-slate-200 dark:bg-slate-700"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, prefix }: any) {
  return (
    <div>
      <label className="block text-sm font-sans font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? "pl-8" : "pl-4"} pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30 focus:border-[#8B0000] transition`}
        />
      </div>
    </div>
  );
}

export function OnboardingWizard({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({
    employmentType: "salaried",
    riskAppetite: "moderate",
    selectedGoals: [],
    hasTermInsurance: false,
    hasHealthInsurance: false,
  });

  const update = (fields: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...fields }));

  const handleFinish = (formData: any) => {
    // Merge onboarding + PDF/form data
    const goalsText = (data.selectedGoals ?? []).join(", ");
    onComplete({
      age: data.age ?? 30,
      income: data.income ?? formData.income ?? 50000,
      expenses: data.expenses ?? formData.expenses ?? 30000,
      savings: data.savings ?? formData.savings ?? 0,
      loans: data.loans ?? formData.loans ?? 0,
      investments: formData.investments ?? "",
      goals: formData.goals ?? goalsText,
      riskAppetite: data.riskAppetite ?? "moderate",
      employmentType: data.employmentType,
      hasTermInsurance: data.hasTermInsurance,
      hasHealthInsurance: data.hasHealthInsurance,
      _form16: formData._form16,
    });
  };

  const steps = [
    // STEP 0 — Personal Info
    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-[#8B0000]" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Tell us about yourself</h3>
          <p className="text-sm font-sans text-slate-500">This helps us personalise your financial analysis</p>
        </div>
      </div>

      <div className="space-y-4">
        <InputField label="Your Age" value={data.age ?? ""} onChange={(v: number) => update({ age: v })} type="number" placeholder="e.g. 28" />
        <InputField label="City" value={data.city ?? ""} onChange={(v: string) => update({ city: v })} placeholder="e.g. Mumbai" />

        <div>
          <label className="block text-sm font-sans font-medium text-slate-600 dark:text-slate-400 mb-1.5">Employment Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "salaried", label: "Salaried", icon: Briefcase },
              { value: "self_employed", label: "Self Employed", icon: Target },
              { value: "freelance", label: "Freelance", icon: User },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => update({ employmentType: value as any })}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-sans font-medium ${
                  data.employmentType === value
                    ? "border-[#8B0000] bg-red-50 dark:bg-red-950/30 text-[#8B0000] dark:text-red-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-sans font-medium text-slate-600 dark:text-slate-400 mb-1.5">Term Insurance?</label>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => update({ hasTermInsurance: v })}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-sans font-medium transition ${
                    data.hasTermInsurance === v ? "border-[#8B0000] bg-red-50 dark:bg-red-950/30 text-[#8B0000]" : "border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}>
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-sans font-medium text-slate-600 dark:text-slate-400 mb-1.5">Health Insurance?</label>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => update({ hasHealthInsurance: v })}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-sans font-medium transition ${
                    data.hasHealthInsurance === v ? "border-[#8B0000] bg-red-50 dark:bg-red-950/30 text-[#8B0000]" : "border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}>
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>,

    // STEP 1 — Money Snapshot
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
          <IndianRupee className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Your Money Snapshot</h3>
          <p className="text-sm font-sans text-slate-500">Monthly figures in ₹ — estimates are fine</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Monthly Take-Home" value={data.income ?? ""} onChange={(v: number) => update({ income: v })} type="number" placeholder="85,000" prefix="₹" />
        <InputField label="Monthly Expenses" value={data.expenses ?? ""} onChange={(v: number) => update({ expenses: v })} type="number" placeholder="50,000" prefix="₹" />
        <InputField label="Total Savings / FD" value={data.savings ?? ""} onChange={(v: number) => update({ savings: v })} type="number" placeholder="2,00,000" prefix="₹" />
        <InputField label="Outstanding Loans" value={data.loans ?? ""} onChange={(v: number) => update({ loans: v })} type="number" placeholder="0" prefix="₹" />
      </div>
    </motion.div>,

    // STEP 2 — Goals & Risk
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">What matters to you?</h3>
          <p className="text-sm font-sans text-slate-500">Select your financial goals</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {GOAL_OPTIONS.map(({ id, label, icon: Icon, color }) => {
          const selected = (data.selectedGoals ?? []).includes(id);
          return (
            <button key={id}
              onClick={() => {
                const goals = data.selectedGoals ?? [];
                update({ selectedGoals: selected ? goals.filter(g => g !== id) : [...goals, id] });
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm font-sans font-medium transition-all ${
                selected ? "border-[#8B0000] bg-red-50 dark:bg-red-950/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}>
              <Icon className={`w-4 h-4 shrink-0 ${selected ? "text-[#8B0000]" : color}`} />
              <span className={selected ? "text-[#8B0000] dark:text-red-400" : "text-slate-600 dark:text-slate-300"}>{label}</span>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-sans font-medium text-slate-600 dark:text-slate-400 mb-3">Risk Appetite</label>
        <div className="space-y-2">
          {RISK_OPTIONS.map(({ value, label, desc, color }) => (
            <button key={value} onClick={() => update({ riskAppetite: value })}
              className={`w-full flex justify-between items-center p-3 rounded-xl border-2 text-left transition-all ${
                data.riskAppetite === value ? color + " border-opacity-100" : "border-slate-200 dark:border-slate-700"
              }`}>
              <div>
                <p className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                <p className="text-xs font-sans text-slate-500">{desc}</p>
              </div>
              {data.riskAppetite === value && <Check className="w-4 h-4 text-[#8B0000]" />}
            </button>
          ))}
        </div>
      </div>
    </motion.div>,

    // STEP 3 — Document Upload
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Connect your documents</h3>
          <p className="text-sm font-sans text-slate-500">Upload Form 16 for precise analysis, or skip</p>
        </div>
      </div>
      {/* Reuse Form16Scanner — it calls handleFinish on submit */}
      <Form16Scanner onSubmit={handleFinish} compact />
    </motion.div>,
  ];

  const canProceed = [
    () => !!data.age && data.age >= 18,
    () => !!data.income && data.income > 0 && !!data.expenses,
    () => true, // Goals step — optional
  ][step];

  return (
    <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header bar */}
      <div className="bg-[#8B0000] px-8 py-6 text-white">
        <h2 className="text-2xl font-serif font-bold">AI Money Mentor</h2>
        <p className="text-red-100 font-sans text-sm">Powered by Economic Times Intelligence · Step {step + 1} of 4</p>
      </div>

      <div className="p-8">
        <StepIndicator current={step} total={4} />

        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>

        {/* Navigation (not on last step — Form16Scanner handles submission) */}
        {step < 3 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-sans font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            <button
              onClick={() => step === 2 ? setStep(3) : setStep(s => s + 1)}
              disabled={canProceed && !canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B0000] text-white font-sans font-semibold text-sm hover:bg-[#6b0000] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {step === 2 ? "Upload Document" : "Continue"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Skip on last step */}
        {step === 3 && (
          <div className="text-center mt-4">
            <button onClick={() => handleFinish({ income: data.income, expenses: data.expenses, savings: data.savings, loans: data.loans, goals: (data.selectedGoals ?? []).join(', ') })}
              className="text-sm font-sans text-slate-400 hover:text-[#8B0000] underline transition">
              Skip document upload → Analyse with my numbers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
