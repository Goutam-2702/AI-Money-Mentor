"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { AlertCircle, AlertTriangle, ShieldCheck, Zap, User, Users, Info } from "lucide-react";

// Helper for Central Gauge
const GaugeChart = ({ score }: { score: number }) => {
  const data = [
    { name: 'Score', value: score, fill: '#8B0000' },
    { name: 'Remaining', value: 100 - score, fill: '#f1f5f9' }
  ];
  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={5}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-5xl font-serif font-black text-slate-800 dark:text-slate-100">{score}</div>
        <div className="text-xs font-sans font-bold text-slate-500 uppercase tracking-widest mt-1">Health</div>
      </div>
    </div>
  );
};

// Mini Radar/Progress
const MiniScore = ({ title, score, color }: { title: string, score: number, color: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <path
            className="text-slate-100 dark:text-slate-800"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
          {score}
        </div>
      </div>
      <p className="text-xs font-sans font-medium text-slate-600 dark:text-slate-400 mt-2">{title}</p>
    </div>
  );
};

export function Dashboard({ data, formData, onReset }: { data: any, formData: any, onReset: () => void }) {
  const [retireAge, setRetireAge] = useState(45);

  // Support both old flat score and new nested score object
  const scores = data.score ?? {};
  const overallScore = typeof scores === 'number' ? scores : (scores.overall ?? 78);
  const emergencyScore = typeof scores === 'number' ? 75 : (scores.emergency ?? 75);
  const insuranceScore = typeof scores === 'number' ? 70 : (scores.insurance ?? 70);
  const debtScore = typeof scores === 'number' ? 70 : (scores.debt ?? 70);
  const taxScore = typeof scores === 'number' ? 50 : (scores.tax ?? 50);
  const investmentScore = typeof scores === 'number' ? 70 : (scores.investments ?? 70);
  const retirementScore = typeof scores === 'number' ? 65 : (scores.retirement ?? 65);

  // Prefer richer recommendations array, fall back to old insights
  const recommendations = data.recommendations ?? data.insights ?? [];
  const quickAction = data.quickAction ?? data.advice ?? null;
  const taxComparison = data.taxComparison ?? null;
  const shockInsights = data.shockInsights ?? data.shock_insights ?? [];

  // Generate dynamic FIRE data based on dragged retireAge
  const generateFireData = (age: number) => {
    let currentAge = 32;
    const mockData = [];
    let corpus = 1000000;
    let savings = 500000;
    let inflation = 200000;
    
    for (let i = currentAge; i <= 60; i += 2) {
      if (i > age) {
        // Post retirement, corpus drops slightly while inflation rises
        corpus = corpus * 1.05 - 800000;
        savings = savings * 1.02;
        inflation = inflation * 1.08;
      } else {
        corpus = corpus * 1.15 + 1000000;
        savings = savings + 800000;
        inflation = inflation * 1.06;
      }
      mockData.push({
        age: i,
        corpus: Math.max(corpus, 0),
        savings: savings,
        inflation: inflation
      });
    }
    return mockData;
  };

  const fireData = generateFireData(retireAge);

  const portfolio = [
    { name: "HDFC Small Cap Fund", type: "Equity", allocation: "30%", overlap: true, expenseRatio: "1.8%", flag: true },
    { name: "Parag Parikh Flexi Cap", type: "Equity", allocation: "40%", overlap: false, expenseRatio: "0.7%", flag: false },
    { name: "SBI Nifty 50 Index", type: "Equity", allocation: "20%", overlap: true, expenseRatio: "0.2%", flag: false },
    { name: "Axis Bluechip Fund", type: "Equity", allocation: "10%", overlap: true, expenseRatio: "1.9%", flag: true }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-24">
      
      {/* RESET BUTTON */}
      <div className="flex justify-end -mb-4">
        <button onClick={onReset} className="text-sm font-sans text-slate-500 hover:text-[#8B0000] dark:text-slate-400 dark:hover:text-red-400 transition underline">
          ← Analyse another profile
        </button>
      </div>

      {/* 1. MONEY HEALTH DASHBOARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <h2 className="text-2xl font-serif font-bold text-[#8B0000] dark:text-red-400 mb-6 text-center border-b pb-4 border-slate-100 dark:border-slate-800">
          Your Comprehensive Money Health
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="w-full md:w-1/3 text-center">
            <GaugeChart score={overallScore} />
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <MiniScore title="Emergency" score={emergencyScore} color="text-green-500" />
            <MiniScore title="Insurance" score={insuranceScore} color="text-blue-500" />
            <MiniScore title="Debt" score={debtScore} color="text-amber-500" />
            <MiniScore title="Tax" score={taxScore} color="text-red-500" />
            <MiniScore title="Investments" score={investmentScore} color="text-emerald-500" />
            <MiniScore title="Retirement" score={retirementScore} color="text-purple-500" />
          </div>

        </div>
      </motion.div>

      {/* 2. THE FIRE PATH SLIDER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden"
      >
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          The FIRE Path Simulator
        </h2>
        <p className="text-slate-500 font-sans mb-8">Slide to adjust your target retirement age and see real-time corpus shifts.</p>
        
        <div className="mb-8 px-4">
          <div className="flex justify-between text-sm font-sans font-medium text-slate-500 mb-2">
            <span>Aggressive (Age 40)</span>
            <span className="text-[#8B0000] dark:text-red-400 font-bold text-lg">Target: {retireAge} Years</span>
            <span>Relaxed (Age 60)</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="60" 
            value={retireAge} 
            onChange={(e) => setRetireAge(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
          />
        </div>

        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fireData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B0000" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="age" tick={{fill: '#94a3b8'}} />
              <YAxis tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`} tick={{fill: '#94a3b8'}} />
              <RechartsTooltip formatter={(value: any) => `₹${(Number(value) / 100000).toFixed(2)}L`} />
              <Legend />
              <Area type="monotone" dataKey="inflation" stroke="#64748b" fill="#f1f5f9" name="Inflation Impact" />
              <Area type="monotone" dataKey="savings" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSavings)" name="Total Contributions" />
              <Area type="monotone" dataKey="corpus" stroke="#8B0000" fillOpacity={1} fill="url(#colorCorpus)" name="Projected Corpus" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 3. COUPLE'S OPTIMIZER VIEW */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col"
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Couple's Tax<br/>Optimizer
            </h2>
            <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#9a7e20] dark:text-[#D4AF37] px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm">
              <Zap className="w-4 h-4" /> Tax Saved: ₹45,500
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 h-full relative">
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>
            
            <div className="pr-2 sm:pr-4">
              <div className="flex items-center gap-1 sm:gap-2 text-slate-500 mb-4 font-sans font-medium text-xs sm:text-sm uppercase tracking-wider">
                <User className="w-4 h-4 hidden sm:block" /> Individual
              </div>
              <ul className="space-y-4 font-sans text-xs sm:text-sm">
                <li className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300">
                  <span className="mb-1 sm:mb-0">HRA Claim</span> <span className="font-medium text-slate-500">Hero (Him)</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300">
                  <span className="mb-1 sm:mb-0">Home Loan EMI</span> <span className="font-medium text-slate-500">Wife (Her)</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between text-slate-700 dark:text-slate-300">
                  <span className="mb-1 sm:mb-0">Health Ins</span> <span className="font-medium text-slate-500">Split 50/50</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-400 line-through text-sm">
                Liab: ₹2.1L
              </div>
            </div>

            <div className="pl-2 sm:pl-4">
              <div className="flex items-center gap-1 sm:gap-2 text-[#8B0000] dark:text-red-400 mb-4 font-sans font-bold text-xs sm:text-sm uppercase tracking-wider">
                <Users className="w-4 h-4 hidden sm:block" /> AI-Optimized
              </div>
              <ul className="space-y-4 font-sans text-xs sm:text-sm">
                <li className="flex flex-col sm:flex-row sm:justify-between font-bold text-slate-800 dark:text-slate-100">
                  <span className="mb-1 sm:mb-0">HRA Claim</span> <span className="text-green-600">Highest Earner</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between font-bold text-slate-800 dark:text-slate-100">
                  <span className="mb-1 sm:mb-0">Home Loan EMI</span> <span className="text-green-600">Joint Ratio</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between font-bold text-slate-800 dark:text-slate-100">
                  <span className="mb-1 sm:mb-0">Health Ins</span> <span className="text-green-600">Senior Parent</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 font-bold text-emerald-600 sm:text-lg">
                Liab: ₹1.64L
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. PORTFOLIO X-RAY */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-6">
            Portfolio X-Ray
          </h2>
          <div className="space-y-3">
            {portfolio.map((fund, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm sm:text-base">
                    {fund.name} 
                    {fund.flag && <span title="High Expense Ratio Red Flag"><AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /></span>}
                    {fund.overlap && <span title="Portfolio Overlap Alert"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0" /></span>}
                  </h4>
                  <p className="text-xs font-sans text-slate-500 mt-1">{fund.type} • Allocation: {fund.allocation}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={`text-xs sm:text-sm font-bold font-sans ${fund.flag ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    Exp: {fund.expenseRatio}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 5. AI RECOMMENDATIONS + SAFETY METERS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-[#8B0000] rounded-3xl p-8 shadow-xl text-white outline outline-4 outline-[#8B0000]/20"
      >
        <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#D4AF37]" /> AI Recommendations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.slice(0, 4).map((rec: any, i: number) => (
            <div key={rec.id ?? i} className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm flex flex-col gap-4">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-sans font-bold text-base leading-tight">{rec.title}</h3>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                  rec.severity === 'critical' ? 'bg-red-500/30 text-red-200 border-red-400/50' :
                  rec.severity === 'high' ? 'bg-amber-500/20 text-amber-200 border-amber-400/50' :
                  'bg-emerald-500/20 text-emerald-200 border-emerald-400/50'
                }`}>{rec.severity}</span>
              </div>
              <p className="text-red-100 text-sm font-sans">{rec.detail ?? rec.text}</p>
              {rec.action && (
                <p className="text-xs text-[#D4AF37] font-sans font-medium border-t border-white/10 pt-3">
                  → {rec.action}
                </p>
              )}
              {(rec.safetyScore !== undefined) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-200 w-14">Safety</span>
                    <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${rec.safetyScore}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 w-8 text-right">{rec.safetyScore}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-200 w-14">Growth</span>
                    <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${rec.growthScore}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 w-8 text-right">{rec.growthScore}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* TAX COMPARISON PANEL */}
      {taxComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">
              Tax Regime Comparison <span className="text-base font-sans font-normal text-slate-500 ml-2">FY 2025-26</span>
            </h2>
            <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#9a7e20] dark:text-[#D4AF37] px-4 py-2 rounded-full text-sm font-bold">
              Save ₹{taxComparison.savedMonthly?.toLocaleString('en-IN')}/month
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-sans text-sm mb-6">{taxComparison.reasoning}</p>
          <div className="grid grid-cols-2 gap-4">
            {(['old', 'new'] as const).map(regime => {
              const r = taxComparison[regime];
              const isRecommended = taxComparison.recommendation === regime;
              return (
                <div key={regime} className={`p-5 rounded-2xl border-2 ${isRecommended ? 'border-[#8B0000] bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100 capitalize">{regime} Regime</h3>
                    {isRecommended && <span className="text-xs font-bold text-[#8B0000] dark:text-red-400 uppercase">✓ Recommended</span>}
                  </div>
                  <p className="text-2xl font-serif font-black text-slate-800 dark:text-slate-100">₹{r?.totalTax?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500 font-sans mb-2">Annual Tax Liability</p>
                  <p className="text-sm font-sans text-slate-600 dark:text-slate-400">Effective Rate: <span className="font-bold">{r?.effectiveRate}%</span></p>
                  <p className="text-sm font-sans text-slate-600 dark:text-slate-400">In-hand/month: <span className="font-bold">₹{r?.inHandMonthly?.toLocaleString('en-IN')}</span></p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* SEBI DISCLAIMER */}
      <div className="flex items-start gap-3 text-xs text-slate-400 dark:text-slate-600 font-sans p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> AI Money Mentor provides general financial information and educational content only. It does not constitute investment advice, financial planning, or portfolio management services as defined under SEBI (Investment Advisers) Regulations, 2013. All projections are estimates based on assumed rates of return and are not guaranteed. Please consult a SEBI-registered Investment Advisor before making financial decisions. Mutual fund investments are subject to market risks. Past performance does not guarantee future results.
        </p>
      </div>

    </div>
  );
}
