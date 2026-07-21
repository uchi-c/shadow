import React, { useState } from "react";
import { FolderGit, CheckCircle, Database, HelpCircle, FileSpreadsheet, Lock } from "lucide-react";
import { CaseStudyItem } from "../types";

export default function CaseStudies() {
  const [activeTab, setActiveTab] = useState<string>("ngo_phishing");

  const caseStudies: CaseStudyItem[] = [
    {
      id: "ngo_phishing",
      title: "Anti-Social Engineering Simulation & Workforce Hardening",
      client: "Civic Empowerment Foundation Southern Africa (Local NGO)",
      location: "Lusaka, Zambia",
      challenge: "The non-profit, handling sensitive agricultural grants and international donor accounts, suspected vulnerabilities to credential theft scams. Their team lacked core understanding of spoofed domains.",
      solution: "Shadow Root designed a secure, silent phishing campaign replicating local MTN & Airtel Mobile Money transaction verification notifications. This was completed anonymously without staff pre-alerts.",
      results: "On the initial run, 45% of NGO staff inputs credentials. Shadow Root stepped in immediately to conduct interactive, plain-language cybersecurity workshops. A follow-up simulation conducted 90 days later resulted in a drop in clicks to just 1.8%, protecting donor accounts completely."
    },
    {
      id: "dist_retail",
      title: "E-Commerce Re-Architecture & DDoS Flood Remediation",
      client: "Bata Distribution Logistics (Retail Vendor)",
      location: "Lusaka, Zambia",
      challenge: "Frequent web portal crash-spikes triggered by automated inventory scrapers and form SQL injection probes, causing checkout downtime and loss of local business reputation.",
      solution: "We re-engineered their interface using a hardened React + Node structure, replacing default databases connections with parameterized queries. Added server-side rate-limit maps and rigid Security Headers (HSTS, CSP).",
      results: "Achieved 100% uptime through 8 months of continuous operational tracking. The web form prevents injection scripts entirely, attaining a verified 'A+' mark on public SSL labs check analyzers."
    }
  ];

  const activeStudy = caseStudies.find(c => c.id === activeTab) || caseStudies[0];

  return (
    <div id="case" className="bg-transparent py-24 border-b border-[#2563eb33]">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl mb-6 md:mb-0">
            <div className="text-xs font-mono font-bold tracking-widest text-[#60a5fa] uppercase mb-3.5">
              Mission Deliveries
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Real-world defense outcomes delivered locally
            </h2>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex bg-[#0f1720]/70 border border-[#2563eb33] p-1 rounded-xl shrink-0 space-x-1.5 font-sans">
            <button
              onClick={() => setActiveTab("ngo_phishing")}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "ngo_phishing"
                  ? "bg-[#2563eb] text-white shadow-[0_0_15px_#2563eb]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Agricultural NGO Simulation
            </button>
            <button
              onClick={() => setActiveTab("dist_retail")}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "dist_retail"
                  ? "bg-[#2563eb] text-white shadow-[0_0_15px_#2563eb]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Retail E-Commerce Auditing
            </button>
          </div>
        </div>

        {/* Mission Card Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0f1720]/70 border border-[#2563eb33] rounded-3xl p-6 md:p-10 relative overflow-hidden">
          {/* Subtle watermarks */}
          <div className="absolute top-10 right-10 opacity-[0.02] pointer-events-none text-[#2563eb]">
            <FolderGit className="w-80 h-80" />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div>
              <span className="font-mono text-[10px] text-[#60a5fa] font-extrabold uppercase bg-[#2563eb22] border border-[#2563eb44] px-2.5 py-1 rounded-full">
                CASE ANALYSIS REPORT
              </span>
              <h3 className="font-display font-bold text-2xl text-white mt-4 leading-tight">
                {activeStudy.title}
              </h3>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <span className="text-slate-500 font-medium font-mono uppercase">ORGANIZATION</span>
                <p className="text-slate-200 font-bold text-sm mt-0.5">{activeStudy.client}</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-slate-500 font-medium font-mono uppercase">OPERATIONAL REGION</span>
                <p className="text-slate-200 font-bold text-sm mt-0.5">{activeStudy.location}</p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center space-x-2 text-emerald-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                <span className="font-bold uppercase tracking-wider text-[10px] font-mono">VERIFIED MITIGATION COMPLETE</span>
              </div>
            </div>
          </div>

          {/* Right Columns: Challenge, Solution, Result breakdown */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-10 relative z-10 font-sans">
            
            <div className="space-y-6">
              {/* Challenge */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>THE THREAT INTERACTION (CHALLENGE)</span>
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed pl-3.5">
                  {activeStudy.challenge}
                </p>
              </div>

              {/* Solution */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                  <span>THE SHADOW PLAN (RECON/IMPLEMENTATION)</span>
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed pl-3.5">
                  {activeStudy.solution}
                </p>
              </div>

              {/* Results */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>SECURITY OUTCOMES RECORDED</span>
                </h4>
                <p className="text-sm text-slate-200 bg-[#0b0f14]/60 border border-[#2563eb33] rounded-lg p-4 font-medium leading-relaxed">
                  {activeStudy.results}
                </p>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-500 italic flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Identifying client records has been completed safely with consent under strict NDA agreements.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
