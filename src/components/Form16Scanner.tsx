"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function Form16Scanner({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleDemoMode = () => {
    const demoData = {
      age: 32,
      income: 180000,
      expenses: 85000,
      savings: 400000,
      investments: "Mutual Funds ₹8L, FDs ₹3L",
      loans: 1200000,
      goals: "FIRE by 45, Child Education"
    };
    onSubmit(demoData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    startScanning();
  };

  const startScanning = () => {
    setIsScanning(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => handleDemoMode(), 1000);
      }
    }, 150);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="bg-[#8B0000] p-10 text-white relative">
          <h2 className="text-4xl font-serif font-bold mb-3 tracking-tight">AI Money Mentor</h2>
          <p className="text-red-100 font-sans text-lg">Powered by Economic Times Intelligence.</p>
          <div className="absolute top-10 right-10 flex gap-2">
             <button 
              type="button" 
              onClick={handleDemoMode}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition font-sans"
            >
              <Zap className="w-4 h-4 text-[#D4AF37]" /> Demo Dashboard
            </button>
          </div>
        </div>
        
        <div className="p-10">
          <AnimatePresence mode="wait">
            {!isScanning ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all ${
                  isHovering 
                    ? "border-[#8B0000] bg-red-50 dark:bg-red-950/20" 
                    : "border-slate-300 dark:border-slate-700 hover:border-[#8B0000]/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={handleDrop}
                onClick={startScanning}
              >
                <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner cursor-pointer">
                  <UploadCloud className={`w-12 h-12 transition-colors ${isHovering ? "text-[#8B0000]" : "text-slate-400"}`} />
                </div>
                <h3 className="text-2xl font-serif font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Upload your Form 16 or Tax PDF
                </h3>
                <p className="text-slate-500 font-sans mb-6">
                  Drag and drop here, or click to browse. We use bank-grade encryption to extract your details.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm font-sans text-slate-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-bit Encryption</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto-Categorization</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center relative"
              >
                <div className="relative w-40 h-56 mx-auto mb-8 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center">
                   <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                   
                   {/* Scanning Laser Animation */}
                   <motion.div 
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                     className="absolute left-0 right-0 h-1 bg-[#8B0000] shadow-[0_0_15px_#8B0000] opacity-80"
                   />
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4">
                  {scanProgress < 100 ? "Scanning for hidden deductions..." : "Analysis Complete!"}
                </h3>
                
                <div className="w-full max-w-md mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className="bg-[#8B0000] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <div className="h-6">
                  {scanProgress > 20 && scanProgress < 50 && <p className="text-sm font-sans text-slate-500 animate-fade-in">Extracting HRA & 80C...</p>}
                  {scanProgress >= 50 && scanProgress < 80 && <p className="text-sm font-sans text-slate-500 animate-fade-in">Analyzing investment overlap...</p>}
                  {scanProgress >= 80 && scanProgress < 100 && <p className="text-sm font-sans text-slate-500 animate-fade-in">Optimizing tax regime...</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
