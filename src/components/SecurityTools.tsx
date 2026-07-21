import React from "react";
import { Wrench, Bug, Lock } from "lucide-react";
import PasswordAnalyzer from "./tools/PasswordAnalyzer";
import PhishingDetector from "./tools/PhishingDetector";
import SecurityMaturity from "./tools/SecurityMaturity";
import LineSidebar from "./LineSidebar";

interface SecurityToolsProps {
  onNavigate?: (section: string) => void;
  onQuote?: (service: string, message?: string) => void;
}

const TOOL_ANCHORS = ["tool-password", "tool-phishing", "tool-maturity"];
const TOOL_LABELS = ["Password Strength", "Phishing Detector", "Maturity Assessment"];

export default function SecurityTools({ onNavigate, onQuote }: SecurityToolsProps) {
  const scrollToTool = (index: number) => {
    document.getElementById(TOOL_ANCHORS[index])?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="tools" aria-labelledby="tools-heading" className="space-y-10">
      <div className="space-y-3">
        <div className="text-[10px] font-mono text-[#60a5fa] tracking-widest uppercase flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#2563eb]" />
          <span>Free Security Tools</span>
        </div>
        <h2 id="tools-heading" className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-tight">
          Test your defenses in seconds.
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
          Practical, no-signup security utilities that run entirely in your browser. Built by Shadow Root for businesses, NGOs, and schools across Southern Africa.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-12">
        {/* Proximity navigator (React Bits LineSidebar) */}
        <aside className="hidden lg:block" aria-label="Jump to a tool">
          <div className="sticky top-28">
            <LineSidebar
              items={TOOL_LABELS}
              accentColor="#2563eb"
              textColor="#94a3b8"
              markerColor="#334155"
              defaultActive={0}
              onItemClick={scrollToTool}
              fontSize={0.95}
              markerLength={44}
              itemGap={24}
              maxShift={16}
              proximityRadius={90}
            />
          </div>
        </aside>

        {/* Stacked tools */}
        <div className="space-y-10 min-w-0">
          <div id="tool-password" className="scroll-mt-28"><PasswordAnalyzer /></div>
          <div id="tool-phishing" className="scroll-mt-28"><PhishingDetector /></div>
          <div id="tool-maturity" className="scroll-mt-28"><SecurityMaturity onNavigate={onNavigate} onQuote={onQuote} /></div>
        </div>
      </div>

      {/* Roadmap of upcoming tools */}
      <div className="space-y-4">
        <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>More tools rolling out</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div className="bg-[#0f1720]/50 border border-[#2563eb1a] rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="bg-[#0b0f14] border border-[#2563eb33] p-2 rounded-lg text-[#60a5fa]">
                <Bug className="w-4 h-4" />
              </div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 border border-white/10 rounded-full px-2 py-0.5">
                Soon
              </span>
            </div>
            <h4 className="font-display font-bold text-white text-sm">CVE Explorer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Look up known vulnerabilities affecting your stack.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
