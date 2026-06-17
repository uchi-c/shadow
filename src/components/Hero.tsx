import React, { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, HelpCircle, RefreshCw, Zap, Server } from "lucide-react";

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  // Defensive scanner simulator parameters for trust signaling
  const [scanState, setScanState] = useState<"IDLE" | "SCANNING" | "SECURE">("IDLE");
  const [analyzedTargets, setAnalyzedTargets] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const testAttackVectors = [
    "SQLi concatenations validation checker",
    "Dependency vulnerabilities scanned CVE-2025",
    "Social Engineering Phishing mimic gates",
    "Open CORS headers validation check",
    "Sensitive data leakage & unmasked API keys",
    "Secure cookie policies confirmation",
    "Client-side frame injection defense check"
  ];

  useEffect(() => {
    if (scanState === "SCANNING") {
      setScanProgress(0);
      setAnalyzedTargets([]);
      
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 15;
          if (next >= 100) {
            clearInterval(interval);
            setScanState("SECURE");
            setAnalyzedTargets(testAttackVectors);
            return 100;
          }
          
          // Gradually pull targets
          const count = Math.min(Math.floor((next / 100) * testAttackVectors.length), testAttackVectors.length - 1);
          setAnalyzedTargets(testAttackVectors.slice(0, count + 1));
          return next;
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, [scanState]);

  return (
    <div id="home" className="relative bg-transparent min-h-screen pt-28 pb-16 flex flex-col justify-center overflow-hidden border-b border-[#6C00FF33]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
        {/* Left Hand Copy Content */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="inline-block px-3 py-1 bg-[#6C00FF22] border border-[#6C00FF44] rounded text-[#A370FF] text-xs font-bold uppercase tracking-widest mb-2 w-fit font-mono">
            Lusaka&apos;s Premier Security Partner
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-none text-white tracking-tight leading-[1.1]">
            We start in the <span className="text-[#6C00FF]">shadows.</span>
          </h1>

          <p className="font-sans text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
            We bring threats to light through elite penetration testing, AI integration, and secure web engineering. Protecting local businesses, NGOs, and growing startup brands.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onNavigate("quote")}
              className="px-8 py-4 bg-[#6C00FF] hover:bg-[#8e3aff] text-white font-bold rounded shadow-[0_0_20px_rgba(108,0,255,0.4)] transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <span>Request Free Audit</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => onNavigate("services")}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded border border-slate-705 transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <span>View Services</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 font-sans">
            <div>
              <div className="font-display font-bold text-3xl text-white leading-none">2 to 10+</div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">Security Experts Scaling Up</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl text-white leading-none">98.2%</div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">NGO Simulation Retainment</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-display font-bold text-3xl text-[#6C00FF] leading-none text-shadow-purple">A+ SSL</div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">Production Hardening Mark</div>
            </div>
          </div>
        </div>

        {/* Right Hand Side: Dynamic interactive security sandbox console */}
        <div className="lg:col-span-5 relative w-full h-full max-w-lg mx-auto">
          <div className="relative bg-[#120826] rounded-2xl border border-[#6C00FF66] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-[11px] leading-relaxed text-slate-300">
            {/* Console Header */}
            <div className="bg-[#0a0515] px-4 py-3 border-b border-[#6C00FF33] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500 font-bold ml-1.5 text-[9px] tracking-wider uppercase">Sandbox Assessment V2</span>
              </div>
              <div className="flex items-center space-x-1">
                <Server className="w-3.5 h-3.5 text-[#6C00FF]" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">SECURE-PORT</span>
              </div>
            </div>

            {/* Console Body */}
            <div className="p-5 flex flex-col space-y-4 min-h-[300px] justify-between">
              {scanState === "IDLE" && (
                <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#6C00FF22] border border-[#6C00FF44] flex items-center justify-center text-[#6C00FF] animate-pulse">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">Shadow Sandbox Scan</h3>
                    <p className="text-[10px] text-slate-400 max-w-[240px] mt-1.5 leading-relaxed">
                      Verify your public web endpoints alignment. Click below to execute local compliance audit.
                    </p>
                  </div>
                  <button
                    onClick={() => setScanState("SCANNING")}
                    className="bg-[#6C00FF] hover:bg-[#8e3aff] text-white px-5 py-2.5 rounded text-[10px] font-bold cursor-pointer flex items-center space-x-1.5 shadow-[0_0_15px_#6C00FF] transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Security Handshake</span>
                  </button>
                </div>
              )}

              {scanState === "SCANNING" && (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-[10px] bg-[#0a0515] p-2 rounded border border-[#6C00FF33]">
                    <span className="font-bold text-[#6C00FF] animate-pulse-ring">AUDITING CORE DIRECTIVES...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-[#1c0f3a] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#6C00FF] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#6C00FF]" 
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>

                  <div className="space-y-1.5 text-slate-400 text-[10px] mt-2 max-h-[140px] overflow-y-auto">
                    {analyzedTargets.map((target, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-slate-300">
                        <span className="text-emerald-400 font-bold">✔</span>
                        <span className="text-slate-450 font-mono text-[9.5px]">{target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scanState === "SECURE" && (
                <div className="flex flex-col space-y-4">
                  <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg flex items-start space-x-3">
                    <div className="bg-emerald-500/20 p-1 rounded text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[11px] leading-tight flex items-center space-x-2">
                        <span>Handshake Compliant</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded text-[8px] font-mono">PASS</span>
                      </h4>
                      <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">
                        Your sandbox handshake validated successfully. Form sanitization, parameterized structures, and secured Express channels are 100% active.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 bg-[#0a0515]/80 p-2.5 rounded border border-[#6C00FF33] max-h-[120px] overflow-y-auto">
                    {testAttackVectors.map((target, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[9px] text-slate-400">
                        <span className="truncate">{target}</span>
                        <span className="text-emerald-400 font-bold ml-2">PASS</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setScanState("IDLE")}
                    className="text-slate-500 hover:text-white transition-all text-center text-[10px] hover:underline"
                  >
                    Reset Security Diagnostic Sandbox
                  </button>
                </div>
              )}

              {/* Console Footer */}
              <div className="border-t border-[#6C00FF1a] pt-3 flex items-center justify-between text-[9px] text-slate-500">
                <span>ENCRYPTION CLIENT: SHA-256</span>
                <span>STATUS: SECURE CONTEXT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
