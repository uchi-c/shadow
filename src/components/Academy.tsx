import React from "react";
import {
  GraduationCap, ArrowUpRight, ShieldCheck, Swords, Radar, Search,
  Cloud, BrainCircuit, Code2, Scale, Briefcase, Flag, FlaskConical, Award, Users
} from "lucide-react";

interface AcademyProps {
  onNavigate?: (section: string) => void;
  onQuote?: (service: string, message?: string) => void;
}

const ACADEMY_MSG = "I'd like to register interest in Shadow Root Academy (the cybersecurity learning tracks).";

const TRACKS = [
  { icon: ShieldCheck, title: "Cybersecurity Fundamentals", desc: "Core concepts, threats, and defensive hygiene for absolute beginners." },
  { icon: Swords, title: "Ethical Hacking", desc: "Offensive techniques and the pentester's methodology, taught responsibly." },
  { icon: Radar, title: "Blue Team Operations", desc: "Detection, monitoring, and incident response for defenders." },
  { icon: Search, title: "Digital Forensics", desc: "Investigate incidents and recover evidence after a breach." },
  { icon: Cloud, title: "Cloud Security", desc: "Secure modern cloud infrastructure and configurations." },
  { icon: BrainCircuit, title: "AI Security", desc: "Attack and defend AI systems, prompts, and data pipelines." },
  { icon: Code2, title: "Secure Software Development", desc: "Build applications that resist the OWASP Top 10 by design." },
  { icon: Scale, title: "GRC & Compliance", desc: "Governance, risk, and the frameworks organizations answer to." },
  { icon: Briefcase, title: "Career Preparation", desc: "Portfolios, interviews, and the path into a security career." },
  { icon: Flag, title: "Capture The Flag", desc: "Gamified challenges that sharpen skills under real pressure." }
];

const OFFERINGS = [
  { icon: FlaskConical, title: "Hands-on labs", desc: "Practice in safe, isolated environments — not just slides." },
  { icon: Award, title: "Certificates", desc: "Earn recognition as you complete tracks and assessments." },
  { icon: Users, title: "Mentorship & community", desc: "Learn alongside peers with guidance from practitioners." }
];

export default function Academy({ onNavigate, onQuote }: AcademyProps) {
  const registerInterest = () => (onQuote ? onQuote("academy", ACADEMY_MSG) : onNavigate?.("quote"));
  return (
    <section aria-labelledby="academy-heading" className="space-y-12">
      <div className="space-y-4 max-w-3xl">
        <div className="text-[10px] font-mono text-[#60a5fa] tracking-widest uppercase flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#2563eb]" />
          <span>Shadow Root Academy</span>
          <span className="text-[9px] border border-[#2563eb33] text-[#60a5fa] rounded-full px-2 py-0.5">Launching soon</span>
        </div>
        <h2 id="academy-heading" className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-tight">
          Training Africa&apos;s next defenders.
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          A practical, hands-on cybersecurity school built by working practitioners — designed to take beginners in Zambia and across Southern Africa all the way to job-ready. We&apos;re assembling the first cohorts now.
        </p>
        <button
          onClick={registerInterest}
          className="inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)]"
        >
          <span>Register your interest</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Learning tracks */}
      <div className="space-y-5">
        <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Learning tracks</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRACKS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="bg-[#0f1720]/60 border border-[#2563eb1a] rounded-2xl p-5 space-y-2.5 hover:border-[#2563eb44] transition-all">
                <div className="bg-[#0b0f14] border border-[#2563eb33] p-2 rounded-lg w-fit text-[#60a5fa]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-white text-sm">{t.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* What you get */}
      <div className="space-y-5">
        <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">What every track includes</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OFFERINGS.map((o) => {
            const Icon = o.icon;
            return (
              <div key={o.title} className="bg-[#0f1720]/60 border border-[#2563eb1a] rounded-2xl p-5 flex items-start gap-3">
                <div className="bg-[#22c55e]/10 border border-[#22c55e]/25 p-2 rounded-lg text-[#22c55e] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm">{o.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{o.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA banner */}
      <div className="rounded-2xl border border-[#2563eb44] bg-[#0b0f14]/90 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="text-center md:text-left">
          <h3 className="font-display font-bold text-white text-lg">Want in on the first cohort?</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">Register your interest and we&apos;ll reach out with dates, pricing, and scholarship options for students and NGOs.</p>
        </div>
        <button
          onClick={registerInterest}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0"
        >
          Register your interest
        </button>
      </div>
    </section>
  );
}
