import React from "react";
import { ShieldAlert, Scaling, HeartHandshake, Swords, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
import Hover3DLogo from "./Hover3DLogo";
import uchiChinyamaPhoto from "../assets/images/uchi_chinyama_photo_1781708485934.jpg";

export default function About() {
  const steps = [
    {
      metric: "01",
      title: "Silent Reconnaissance",
      desc: "Our audit begins by mapping public assets, ports, DNS servers, and social media vulnerability points of your team without triggering defenses."
    },
    {
      metric: "02",
      title: "Attack Engineering",
      desc: "We build localized simulations (such as a simulated MTN/Airtel Money gateway alert) to evaluate how your human firewall copes with real pressure."
    },
    {
      metric: "03",
      title: "Systems Penetration",
      desc: "We perform rigorous scanning on input fields and databases to find standard OWASP Top 10 vulnerabilities (SQLi, XSS, insecure file uploads)."
    },
    {
      metric: "04",
      title: "Remediation & Hardening",
      desc: "We deliver visual, non-technical instructions to patch your servers and guide workshops for your staff. Or, we custom-develop patched systems for you."
    }
  ];

  return (
    <div id="about" className="bg-transparent py-16 space-y-24 border-b border-[#2563eb33] font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        
        {/* Section Title */}
        <div className="mb-12 flex flex-col space-y-3.5">
          <div className="text-xs font-mono font-bold tracking-widest text-[#60a5fa] uppercase">
            Corporate Identity & Leadership
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight leading-tight">
            Youth-led cybersecurity force scaling across Southern Africa
          </h2>
        </div>

        {/* Grid Split: Narrative & Interactive 3D Hovering Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative & Mission */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <h3 className="font-display font-medium text-lg md:text-xl text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
              <span>Shadow Root Mission & Roots</span>
            </h3>

            <p className="text-sm text-slate-355 leading-relaxed">
              Shadow Root Security Technologies started in Lusaka as an ambitious initiative founded by <strong>Uchi Chinyama</strong>. Frustrated by seeing local NGOs, schools, and growing startup brands fall victim to credential phishing scams and poor coding practices because high-end corporate penetration auditing was prohibitively expensive, they decided to harden their region.
            </p>

            <p className="text-sm text-slate-355 leading-relaxed">
              Today, Shadow Root is <strong>scaling up from 2 to 10 experienced security specialists and developers</strong>. We operate with standard, plain-spoken diagnostics that non-technical managers and agricultural donor groups appreciate. Because of our local threat context knowledge, we build highly reliable React frontends, customized mobile money replica simulations, and unhackable database security retainers.
            </p>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-sans">
              <div 
                className="bg-[#0f1720]/70 border border-[#2563eb33] p-5 rounded-xl hover:shadow-[0_0_15px_rgba(37,99,235,0.1)] focus-within:ring-2 focus-within:ring-[#2563eb] transition-all"
                tabIndex={0}
                aria-label="Core pillar: Scaling Local Talent. Our expanding cohort of security professionals represents the future of Zambian tech sovereignty."
              >
                <div className="bg-[#2563eb22] text-[#60a5fa] p-2 rounded-lg w-fit mb-3 border border-[#2563eb44]">
                  <Scaling className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-white text-sm">Scaling Local Talent</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Our expanding cohort of security professionals represents the future of Zambian tech sovereignty.</p>
              </div>

              <div 
                className="bg-[#0f1720]/70 border border-[#2563eb33] p-5 rounded-xl hover:shadow-[0_0_15px_rgba(37,99,235,0.1)] focus-within:ring-2 focus-within:ring-[#2563eb] transition-all"
                tabIndex={0}
                aria-label="Core pillar: Ethical NGO Pricing. We adjust costs according to organization scale, ensuring donor funds are never spent on bloated licenses."
              >
                <div className="bg-[#2563eb22] text-[#60a5fa] p-2 rounded-lg w-fit mb-3 border border-[#2563eb44]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-white text-sm">Ethical NGO Pricing</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">We adjust costs according to organization scale, ensuring donor funds are never spent on bloated licenses.</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Hologram Hovering Shield Logo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <span className="text-[10px] font-mono tracking-widest text-[#60a5fa] uppercase bg-[#0f1720] border border-[#2563eb33] px-3 py-1 rounded-full">
                Interactive Cursor Perspective
              </span>
            </div>
            <Hover3DLogo />
            <div className="text-[10px] text-slate-500 font-mono text-center mt-3 max-w-xs leading-normal">
              Hover, move, or tap using keyboard focus to inspect the circular root terminal circuit nodes in 3D perspective depth.
            </div>
          </div>

        </div>

        {/* Section 2: Meet the CEO & Co-Leaders (Corporate Profile with Image 1 representation) */}
        <div className="mt-28 space-y-12">
          <div className="flex flex-col space-y-2 border-b border-white/5 pb-4">
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
              Secured Leadership & Founders
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Meet the key engineers and security advocates executing tactical defenses in Zambia.
            </p>
          </div>

          <div className="flex justify-center">
            
            {/* CEO Profile Card: Uchi Chinyama */}
            <div 
              className="bg-[#0f1720]/70 border border-[#2563eb44] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row gap-6 hover:border-[#2563eb] hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all focus-within:ring-2 focus-within:ring-[#2563eb] max-w-2xl w-full"
              tabIndex={0}
              aria-label="Profile of Uchi Chinyama, Chief Executive Officer and Founder of Shadow Root Security Technologies."
            >
              
              {/* Profile Image of CEO Uchi Chinyama */}
              <div 
                className="w-40 h-48 rounded-xl bg-slate-950 border border-[#2563eb55] shrink-0 overflow-hidden relative group"
                role="img"
                aria-label="Corporate portrait of CEO Uchi Chinyama in front of glowing monitoring control systems"
              >
                {/* Simulated Monitor Grid Background (blue bars & maps) */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(11,15,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(11,15,20,0.5)_1px,transparent_1px)] bg-[size:10px_10px] z-20 pointer-events-none"></div>
                <div className="absolute top-2 left-2 w-32 h-1 bg-cyan-500/20 rounded z-20 pointer-events-none"></div>
                
                {/* High Contrast Photograph of CEO */}
                <img 
                  src={uchiChinyamaPhoto}
                  alt="Uchi Chinyama, Chief Executive Officer of Shadow Root Security Technologies"
                  className="w-full h-full object-cover relative z-10 filter brightness-95 contrast-[1.05]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Globe Map trace decoration */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 160 192">
                  <circle cx="110" cy="50" r="28" fill="none" stroke="rgba(0,240,255,0.08)" strokeWidth="1" strokeDasharray="3,3" />
                </svg>

                {/* Stitched 'Shadow Root' Suit pocket label graphic */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2563eb]/25 border border-[#2563eb55] rounded px-1.5 py-0.5 text-[7px] font-mono uppercase text-teal-400 font-bold z-20">
                  Shadow Root CEO
                </div>
              </div>

              {/* Bio & Details Column */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold leading-none uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full w-fit block">
                    FOUNDER &amp; CEO
                  </span>
                  <h4 className="font-display font-black text-xl text-white leading-tight">
                    Uchi Chinyama
                  </h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Youth-led cybersecurity driver, security researcher, and lead web defensive compliance auditor. Dedicated to reinforcing the local NGO ecosystem.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center space-x-2 text-slate-355">
                    <span className="text-[#2563eb]">✔</span>
                    <span>Direct Phishing Architect</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-355">
                    <span className="text-[#2563eb]">✔</span>
                    <span>10+ Years Security Passion</span>
                  </div>
                </div>

                {/* Contacts button deck */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href="mailto:uchichinyama@gmail.com"
                    className="bg-[#2563eb]/20 hover:bg-[#2563eb] border border-[#2563eb66] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                    title="Send secure email to CEO Uchi Chinyama"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Uchi</span>
                  </a>
                  <a
                    href="https://wa.me/260979501830"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                    title="Open WhatsApp message chat with CEO Uchi Chinyama"
                  >
                    💬 Chat WA
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Section 3: Interactive Diagram of "The Shadow Methodology" */}
        <div className="mt-28 bg-[#0f1720]/80 text-white rounded-2xl border border-[#2563eb44] p-6 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-shadow-purple-dark/25 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col space-y-8">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-white/5">
              <Swords className="w-5 h-5 text-[#2563eb] animate-pulse" />
              <span className="font-display font-bold text-sm tracking-tight uppercase font-mono">The Shadow Audit Methodology (Step-by-Step Security)</span>
            </div>

            {/* Steps timeline horizontal on md, vertical on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((st, index) => (
                <div 
                  key={index} 
                  className="bg-[#0b0f14]/70 border border-[#2563eb33] p-5 rounded-xl hover:border-[#60a5fa] focus:ring-2 focus:ring-[#2563eb] transition-all flex flex-col justify-between"
                  tabIndex={0}
                  aria-label={`Step ${st.metric}: ${st.title}. ${st.desc}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#60a5fa] font-black text-sm bg-[#0b0f14]/90 w-8 h-8 rounded-full border border-[#2563eb44] flex items-center justify-center shrink-0">
                      {st.metric}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">ACTIVE</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-100 mt-4 leading-none">
                      {st.title}
                    </h4>
                    <p className="font-sans text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mission Badge footer */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>SECURITY VIGILANCE INDEX: HIGHLY ENFORCED</span>
              <span>ZAMBIA SHADOW FRAMEWORK V2.05</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
