"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Zap,
  AlertCircle,
  X,
} from "lucide-react";

type ScanPhase = "idle" | "uploading" | "scanning" | "error";

interface UploadState {
  phase: ScanPhase;
  fileName: string;
  fileSize: string;
  progress: number;
  statusText: string;
  errorMsg: string;
}

const SCAN_STEPS = [
  { at: 15, text: "Parsing document structure..." },
  { at: 30, text: "Extracting salary & CTC details..." },
  { at: 48, text: "Reading HRA & LTA exemptions..." },
  { at: 62, text: "Analysing Section 80C investments..." },
  { at: 75, text: "Detecting Section 80D (health insurance)..." },
  { at: 88, text: "Optimising Old vs. New tax regime..." },
  { at: 98, text: "Building your wealth profile..." },
];

export function Form16Scanner({ onSubmit, compact = false }: { onSubmit: (data: any) => void; compact?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [state, setState] = useState<UploadState>({
    phase: "idle",
    fileName: "",
    fileSize: "",
    progress: 0,
    statusText: "",
    errorMsg: "",
  });

  // ── Demo shortcut ────────────────────────────────────────────────────────────
  const handleDemoMode = () => {
    onSubmit({
      age: 32,
      income: 180000,
      expenses: 85000,
      savings: 400000,
      investments: "Mutual Funds ₹8L, FDs ₹3L, ELSS ₹1.5L",
      loans: 1200000,
      goals: "FIRE by 45, Child Education",
    });
  };

  // ── Animate progress bar while uploading/scanning ────────────────────────────
  const animateProgress = (
    fromPct: number,
    toPct: number,
    durationMs: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 30;
      const stepSize = (toPct - fromPct) / steps;
      const interval = durationMs / steps;
      let current = fromPct;
      const timer = setInterval(() => {
        current += stepSize;
        const capped = Math.min(current, toPct);
        const step = SCAN_STEPS.slice().reverse().find((s) => s.at <= capped);
        setState((prev) => ({
          ...prev,
          progress: capped,
          statusText: step?.text ?? prev.statusText,
        }));
        if (current >= toPct) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  };

  // ── Core upload handler ──────────────────────────────────────────────────────
  const processFile = async (file: File) => {
    // Client-side validation
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setState((prev) => ({
        ...prev,
        phase: "error",
        errorMsg: `Unsupported file: "${file.name}". Please upload a PDF, JPEG, or PNG.`,
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setState((prev) => ({
        ...prev,
        phase: "error",
        errorMsg: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB allowed.`,
      }));
      return;
    }

    const sizeFmt =
      file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;

    setState({
      phase: "uploading",
      fileName: file.name,
      fileSize: sizeFmt,
      progress: 0,
      statusText: "Uploading file securely...",
      errorMsg: "",
    });

    try {
      // Animate 0 → 30% while actual upload happens
      const uploadPromise = (async () => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        return res.json();
      })();

      await animateProgress(0, 30, 1200);

      setState((prev) => ({
        ...prev,
        phase: "scanning",
        statusText: "Scanning for hidden deductions...",
      }));

      // Animate 30 → 95% during server-side scan processing
      const [animDone, uploadResult] = await Promise.all([
        animateProgress(30, 95, 4000),
        uploadPromise,
      ]);

      if (!uploadResult.success) {
        setState((prev) => ({
          ...prev,
          phase: "error",
          errorMsg: uploadResult.error ?? "Upload failed. Please try again.",
        }));
        return;
      }

      // Snap to 100%
      setState((prev) => ({
        ...prev,
        progress: 100,
        statusText: "Analysis complete!",
      }));

      // Build financial profile from extracted fields
      const extracted = uploadResult.extracted?.extractedFields ?? {};
      const monthlyGross = Math.round((extracted.grossSalary ?? 1800000) / 12);

      await new Promise((r) => setTimeout(r, 1000));

      onSubmit({
        age: 32, // Could come from PAN or user input
        income: monthlyGross,
        expenses: Math.round(monthlyGross * 0.5),
        savings: 400000,
        investments: `Form 16 extracted: 80C ₹${(extracted.section80C ?? 150000).toLocaleString("en-IN")}, HRA ₹${(extracted.hra ?? 0).toLocaleString("en-IN")}`,
        loans: 0,
        goals: "Tax-optimised wealth building",
        // Pass raw extracted data for the backend to use
        _form16: extracted,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        phase: "error",
        errorMsg: "Network error. Please check your connection and try again.",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setState({
      phase: "idle",
      fileName: "",
      fileSize: "",
      progress: 0,
      statusText: "",
      errorMsg: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isActive = state.phase === "uploading" || state.phase === "scanning";

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Hidden native file input — triggered programmatically */}
      <input
        ref={fileInputRef}
        id="form16-upload-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload Form 16 or Tax PDF"
      />

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
      {/* Compact mode hides the header branding */}
      {!compact && (
        <div className="bg-[#8B0000] p-10 text-white relative">
          <h2 className="text-4xl font-serif font-bold mb-3 tracking-tight">
            AI Money Mentor
          </h2>
          <p className="text-red-100 font-sans text-lg">
            Powered by Economic Times Intelligence.
          </p>
          <div className="absolute top-10 right-10">
            <button
              type="button"
              onClick={handleDemoMode}
              disabled={isActive}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-40 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition font-sans"
            >
              <Zap className="w-4 h-4 text-[#D4AF37]" /> Demo Dashboard
            </button>
          </div>
        </div>
      )}

        {/* Body */}
        <div className="p-10">
          <AnimatePresence mode="wait">
            {/* ── IDLE ──────────────────────────────────────────────────── */}
            {state.phase === "idle" && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Drop Zone */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Click to select PDF or drag and drop"
                  className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer select-none ${
                    isHovering
                      ? "border-[#8B0000] bg-red-50 dark:bg-red-950/20"
                      : "border-slate-300 dark:border-slate-700 hover:border-[#8B0000]/60 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) =>
                    e.key === "Enter" && fileInputRef.current?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsHovering(true);
                  }}
                  onDragLeave={() => setIsHovering(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <UploadCloud
                      className={`w-12 h-12 transition-colors ${
                        isHovering ? "text-[#8B0000]" : "text-slate-400"
                      }`}
                    />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Upload your Form 16 or Tax PDF
                  </h3>
                  <p className="text-slate-500 font-sans mb-2">
                    Drag & drop here, or{" "}
                    <span className="text-[#8B0000] font-semibold underline">
                      click to browse
                    </span>
                  </p>
                  <p className="text-slate-400 font-sans text-xs mb-6">
                    Accepted: PDF, JPEG, PNG · Max size: 10 MB
                  </p>
                  <div className="flex items-center justify-center gap-6 text-sm font-sans text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      256-bit Encryption
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Auto-Categorisation
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── UPLOADING / SCANNING ───────────────────────────────────── */}
            {(state.phase === "uploading" || state.phase === "scanning") && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                {/* Animated doc icon */}
                <div className="relative w-40 h-56 mx-auto mb-8 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center gap-2">
                  <FileText className="w-14 h-14 text-slate-300 dark:text-slate-600" />
                  {state.fileName && (
                    <p className="text-[10px] font-sans text-slate-400 px-3 truncate w-full text-center">
                      {state.fileName}
                    </p>
                  )}
                  {/* Laser scan line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-[#8B0000] shadow-[0_0_12px_4px_#8B0000] opacity-75"
                  />
                </div>

                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {state.progress < 100
                    ? "Scanning for deductions..."
                    : "Analysis Complete!"}
                </h3>
                <p className="text-slate-500 font-sans text-sm mb-6 h-5">
                  {state.statusText}
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-md mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-[#8B0000] h-full rounded-full"
                    animate={{ width: `${state.progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.4 }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-sans">
                  {Math.round(state.progress)}%
                </p>

                {state.fileSize && (
                  <p className="text-xs text-slate-400 mt-4 font-sans">
                    File: <span className="font-medium text-slate-600 dark:text-slate-300">{state.fileName}</span>{" "}
                    ({state.fileSize})
                  </p>
                )}
              </motion.div>
            )}

            {/* ── ERROR ─────────────────────────────────────────────────── */}
            {state.phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 mx-auto bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-3">
                  Upload Failed
                </h3>
                <p className="text-slate-500 font-sans text-sm mb-8 max-w-sm mx-auto">
                  {state.errorMsg}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-[#8B0000] text-white font-sans font-semibold rounded-xl hover:bg-[#6b0000] transition shadow-lg"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleDemoMode}
                    className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-sans font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Use Demo Instead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
