import React from "react";
import { Shield, Radio, KeyRound, ArrowRight } from "lucide-react";

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  onOpenAdmin: () => void;
}

export default function Navbar({ onNavigate, activeSection, onOpenAdmin }: NavbarProps) {
  const navItems = [
    { label: "Home", target: "home" },
    { label: "Services", target: "services" },
    { label: "Founder Story", target: "about" },
    { label: "Case Studies", target: "case" },
    { label: "Quote Generator", target: "quote" }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-[#070a0f88] backdrop-blur-md border-b border-[#2563eb33] flex justify-between items-center px-4 md:px-10 py-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      {/* Brand Identity / Logo */}
      <button 
        onClick={() => onNavigate("home")} 
        className="flex items-center space-x-3 cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-lg p-1"
        aria-label="Shadow Root Security Technologies homepage"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-shadow-purple/30 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
          <div className="relative bg-[#2563eb] p-2 rounded-lg flex items-center justify-center shadow-[0_0_15px_#2563eb]">
            <Shield className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-white text-lg leading-none tracking-tight flex items-center">
            SHADOW<span className="text-[#2563eb] ml-1">ROOT</span>
          </div>
          <div className="text-[9px] font-mono tracking-widest text-[#60a5fa] uppercase font-semibold mt-1">
            Security Tech
          </div>
        </div>
      </button>

      {/* Center Nav Items (Desktop) */}
      <div 
        className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest text-slate-400"
        role="navigation"
        aria-label="Primary navigation menu"
      >
        {navItems.map((item) => (
          <button
            key={item.target}
            onClick={() => onNavigate(item.target)}
            className={`font-sans transition-all relative py-1 hover:text-[#2563eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded px-1.5 ${
              activeSection === item.target 
                ? "text-[#2563eb]" 
                : "text-slate-400"
            }`}
            aria-label={`Navigate to ${item.label} section`}
            aria-current={activeSection === item.target ? "page" : undefined}
          >
            {item.label}
            {activeSection === item.target && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563eb] rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Right Action Widgets */}
      <div className="flex items-center space-x-3.5">
        {/* Connection status dot - trust builder */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#ffffff05] border border-white/10 px-3 py-1.5 rounded-full font-mono text-[10px] text-emerald-400 font-semibold" aria-label="SSL Connection status: Enforced">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>SSL ENFORCED</span>
        </div>

        <button
          onClick={onOpenAdmin}
          className="hidden md:flex items-center space-x-1.5 bg-[#ffffff05] hover:bg-slate-800 border border-white/10 text-slate-200 px-3.5 py-1.5 rounded-md font-sans text-xs font-semibold cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          aria-label="Open team leader administrative secure control panel"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => onNavigate("quote")}
          className="px-5 py-2 bg-transparent border border-[#2563eb] text-[#2563eb] font-bold rounded hover:bg-[#2563eb] hover:text-white text-xs tracking-wider transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          aria-label="Navigate to quote consultation form"
        >
          <span>GET SECURE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}
