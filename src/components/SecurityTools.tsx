import React from "react";
import { Wrench, Lock } from "lucide-react";
import PasswordAnalyzer from "./tools/PasswordAnalyzer";
import PhishingDetector from "./tools/PhishingDetector";
import SecurityMaturity from "./tools/SecurityMaturity";
import CveExplorer from "./tools/CveExplorer";
import LineSidebar from "./LineSidebar";

interface SecurityToolsProps {
  onNavigate?: (section: string) => void;
  onQuote?: (service: string, message?: string) => void;
}

const TOOL_ANCHORS = ["tool-password", "tool-phishing", "tool-maturity", "tool-cve"];
const TOOL_LABELS = ["Password Strength", "Phishing Detector", "Maturity Assessment", "CVE Explorer"];

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
          <div id="tool-cve" className="scroll-mt-28"><CveExplorer /></div>
        </div>
      </div>

      {/* More tools on the roadmap */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
        <Lock className="w-3.5 h-3.5" />
        <span>More tools rolling out — tell us what you need.</span>
      </div>
    </section>
  );
}
