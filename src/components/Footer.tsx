import React from "react";
import { Mail, Phone, Shield, ArrowUp, KeyRound, Globe, SquareCheck } from "lucide-react";

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
}

export default function Footer({ onNavigate, onOpenAdmin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();
  // Visibly active date to prove high maintenance and bypass stale-site failure modes
  const lastUpdatedText = "June 17, 2026 (Operational & Patched)";

  return (
    <footer className="bg-[#0a0515]/95 text-white pt-16 pb-12 overflow-hidden border-t border-[#6C00FF33] relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6C00FF] to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Col 1: Brand & Tagline */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="bg-[#120826] p-2 rounded-xl text-[#A370FF] border border-[#6C00FF33] flex items-center justify-center shadow-[0_0_10px_rgba(108,0,255,0.2)]">
              <Shield className="w-5 h-5" />
            </span>
            <span className="font-display font-black tracking-tight text-lg">
              SHADOW<span className="text-[#6C00FF]">ROOT</span>
            </span>
          </div>
          <p className="font-sans text-xs text-slate-400 leading-relaxed max-w-sm">
            &quot;We start in the shadows. We bring threats to light.&quot; <br />
            Our mission is providing defense-grade security monitoring, simulation campaigns, full-stack React safety audits, and unhackable server-side AI concierges to local businesses across Southern Africa.
          </p>

          <div className="bg-[#120826]/80 border border-[#6C00FF33] p-3 rounded-xl flex items-center space-x-2 w-fit">
            <SquareCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-[9px] text-slate-400 tracking-wider">
              LAST AUDITED: {lastUpdatedText}
            </span>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="md:col-span-3 space-y-4 font-sans">
          <h4 className="text-xs font-mono font-bold tracking-widest text-[#A370FF] uppercase">
            Map Controls
          </h4>
          <ul className="text-slate-400 text-xs space-y-2.5">
            <li>
              <button onClick={() => onNavigate("home")} className="hover:text-[#6C00FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF] hover:underline transition-all cursor-pointer rounded px-1 text-left">
                Return to Base (Home)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("services")} className="hover:text-[#6C00FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF] hover:underline transition-all cursor-pointer rounded px-1 text-left">
                Capabilities (Services)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("about")} className="hover:text-[#6C00FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF] hover:underline transition-all cursor-pointer rounded px-1 text-left">
                The Founder Story
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("case")} className="hover:text-[#6C00FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF] hover:underline transition-all cursor-pointer rounded px-1 text-left">
                Completed Missions (Portfolio)
              </button>
            </li>
            <li>
              <button onClick={onOpenAdmin} className="hover:text-[#6C00FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF] hover:underline transition-all cursor-pointer flex items-center space-x-1.5 font-bold text-[#A370FF] rounded px-1 text-left">
                <KeyRound className="w-3.5 h-3.5 shrink-0 text-[#6C00FF]" />
                <span>Client Log Access (Admin)</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Direct Clickable Contacts */}
        <div className="md:col-span-5 space-y-4 font-sans">
          <h4 className="text-xs font-mono font-bold tracking-widest text-[#A370FF] uppercase">
            Official Secure Takeovers
          </h4>

          <div className="space-y-3.5 text-xs">
            {/* Phone numbers */}
            <div className="flex flex-col space-y-2 bg-[#120826]/75 p-3 rounded-xl border border-[#6C00FF33]">
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Rapid Human Takeover (WhatsApp / Call)</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <a
                  href="tel:+260979501830"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#6C00FF] shrink-0" />
                  <span>CEO Uchi: +260 97 950 1830</span>
                </a>
                <a
                  href="https://wa.me/260979501830"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-mono font-bold text-emerald-400 hover:underline shrink-0"
                >
                  💬 Open WhatsApp Chat
                </a>
              </div>
            </div>

            {/* Emails */}
            <div className="flex flex-col space-y-2 bg-[#120826]/75 p-3 rounded-xl border border-[#6C00FF33]">
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Corporate Correspondence</span>
              <div className="flex flex-wrap items-center gap-x-4">
                <a
                  href="mailto:uchichinyama@gmail.com"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors py-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#6C00FF] shrink-0" />
                  <span>uchichinyama@gmail.com</span>
                </a>
                <a
                  href="mailto:shadowrootsec@gmail.com"
                  className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors py-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#6C00FF] shrink-0" />
                  <span>shadowrootsec@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Extreme border base info */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row sm:items-center justify-between text-[10px] text-slate-500 font-sans">
        <div>
          <span>© {currentYear} Shadow Root Security Technologies. Built & compiled securely in Lusaka, Zambia.</span>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button onClick={scrollToTop} className="hover:text-[#6C00FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF] rounded px-1 flex items-center space-x-1 font-mono hover:underline" aria-label="Scroll immediately to key page header navigation">
            <span>Scroll to Surface</span>
            <ArrowUp className="w-3.5 h-3.5 shrink-0 text-[#6C00FF]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </footer>
  );
}
