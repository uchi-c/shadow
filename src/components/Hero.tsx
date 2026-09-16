import React from "react";
import { ArrowRight, ShieldCheck, Workflow, Mail, Building2 } from "lucide-react";

interface HeroProps {
  onNavigate: (section: string) => void;
}

const DELIVERABLES = [
  { icon: Mail, label: "Phishing Simulation & Awareness Training" },
  { icon: Workflow, label: "AI Workflow Automation for Institutions" },
  { icon: ShieldCheck, label: "Secure Systems Development & Auditing" },
  { icon: Building2, label: "Strategic Digital Trust Advisory" }
];

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <div id="home" className="relative bg-transparent min-h-screen pt-28 pb-16 flex flex-col justify-center overflow-hidden border-b border-[#2563eb33]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
        {/* Left Hand Copy Content */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="inline-block px-3 py-1 bg-[#2563eb22] border border-[#2563eb44] rounded text-[#60a5fa] text-xs font-semibold w-fit">
            Zambia&apos;s Digital Trust &amp; Secure Systems Partner
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-none text-white tracking-tight leading-[1.1]">
            Building digital trust for the <span className="text-[#2563eb]">next era of institutions.</span>
          </h1>

          <p className="font-sans text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
            Secure systems, structured workflows, and institutional intelligence — delivered through phishing simulation, AI workflow automation, and strategic digital trust advisory for government, NGOs, schools, and universities across Zambia.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onNavigate("quote")}
              className="px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <span>Request Free Audit</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => onNavigate("services")}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded border border-slate-700 transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <span>View Services</span>
            </button>
          </div>

          {/* Quick Facts */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 font-sans">
            <div>
              <div className="font-display font-bold text-3xl text-white leading-none">Founder-Led</div>
              <div className="text-xs text-slate-400 mt-1.5 font-medium">Structured Functional Roles</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl text-white leading-none">5</div>
              <div className="text-xs text-slate-400 mt-1.5 font-medium">Functional Departments</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-display font-bold text-3xl text-[#2563eb] leading-none">4</div>
              <div className="text-xs text-slate-400 mt-1.5 font-medium">Institution Types Served</div>
            </div>
          </div>
        </div>

        {/* Right Hand Side: What we deliver */}
        <div className="lg:col-span-5 relative w-full h-full max-w-lg mx-auto">
          <div className="bg-[#0f1720] rounded-2xl border border-white/10 p-6 md:p-8">
            <div className="text-xs font-semibold text-[#60a5fa] uppercase tracking-wide mb-5">
              What We Deliver
            </div>
            <ul className="space-y-4">
              {DELIVERABLES.map((item) => (
                <li key={item.label} className="flex items-center space-x-3.5">
                  <div className="bg-[#2563eb]/15 border border-[#2563eb44] text-[#60a5fa] p-2 rounded-lg shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="text-xs text-slate-400 leading-relaxed">
                Serving government offices, NGOs, schools, and universities across Zambia and Africa.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
