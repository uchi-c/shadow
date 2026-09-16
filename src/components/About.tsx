import React, { lazy, Suspense } from "react";
import { Scaling, HeartHandshake, Swords, ShieldCheck, Mail, Boxes, BrainCircuit, FlaskConical, GraduationCap, PlayCircle } from "lucide-react";
import Hover3DLogo from "./Hover3DLogo";
import ChunkErrorBoundary from "./ChunkErrorBoundary";
import uchiChinyamaPhoto from "../assets/images/uchi_chinyama_founder_portrait.jpg";

const VideoPresenter = lazy(() => import("./VideoPresenter"));

export default function About() {
  const departments = [
    {
      icon: Boxes,
      name: "Product & Platform",
      meaning: "Builds structured products and platform systems for institutional use.",
      scope: "URUU roadmap, product logic, platform design"
    },
    {
      icon: BrainCircuit,
      name: "AI Systems & Automation",
      meaning: "Modernizes weak processes through practical, governance-aware AI.",
      scope: "Workflow automation, implementation, process support"
    },
    {
      icon: ShieldCheck,
      name: "Governance, Risk & Compliance",
      meaning: "Treats trust, ethics, and control as part of the delivery model.",
      scope: "Government-facing work, consent, standards, oversight"
    },
    {
      icon: FlaskConical,
      name: "Research & Innovation",
      meaning: "Studies local institutional problems and tests future capabilities.",
      scope: "Use-case discovery, concept development, prototype logic"
    },
    {
      icon: GraduationCap,
      name: "Training & Awareness",
      meaning: "Helps institutions reduce user-risk and strengthen awareness culture.",
      scope: "Phishing simulation, awareness programs, human-risk interventions"
    }
  ];

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
          <div className="text-xs font-semibold uppercase tracking-wide text-[#60a5fa]">
            Corporate Identity & Leadership
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight leading-tight">
            Founder-led digital trust and secure infrastructure for institutions
          </h1>
        </div>

        {/* Grid Split: Narrative & Interactive 3D Hovering Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative & Mission */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <h2 className="font-display font-medium text-lg md:text-xl text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
              <span>Shadow Root Mission & Roots</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Shadow Root Security Technologies is a Lusaka-based digital trust and secure infrastructure company, founded and led by <strong>Uchi Chinyama</strong>. We started by seeing local NGOs, schools, and growing institutions fall victim to credential phishing scams and poor coding practices because high-end corporate security auditing was prohibitively expensive — and set out to close that gap.
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              Today, Shadow Root builds practical, trust-sensitive systems for government, NGOs, schools, and universities across Africa — combining secure infrastructure, structured workflow automation, and plain-spoken diagnostics that non-technical managers and donor-funded teams can act on with confidence.
            </p>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-sans">
              <div
                className="surface-card p-5"
                tabIndex={0}
                aria-label="Core pillar: Structured Growth. Shadow Root is built on disciplined, founder-led execution with clear functional roles across product, security, and governance."
              >
                <div className="bg-[#2563eb22] text-[#60a5fa] p-2 rounded-lg w-fit mb-3 border border-[#2563eb44]">
                  <Scaling className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-white text-sm">Structured Growth</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Shadow Root is built on disciplined, founder-led execution with clear functional roles across product, security, and governance.</p>
              </div>

              <div
                className="surface-card p-5"
                tabIndex={0}
                aria-label="Core pillar: Scaled Pricing. Costs are structured to an organization's size, so smaller institutions and NGOs aren't priced out."
              >
                <div className="bg-[#2563eb22] text-[#60a5fa] p-2 rounded-lg w-fit mb-3 border border-[#2563eb44]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-white text-sm">Scaled Pricing</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Costs are structured to an organization&apos;s size, so smaller institutions and NGOs aren&apos;t priced out.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Brand Mark */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <Hover3DLogo />
          </div>

        </div>

        {/* Optional overview video — not on the forced homepage path */}
        <div className="mt-20 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#60a5fa] uppercase tracking-wide">
            <PlayCircle className="w-4 h-4 text-[#2563eb]" />
            <span>Watch the overview</span>
          </div>
          <ChunkErrorBoundary reloadOnChunkError={false} fallback={null}>
            <Suspense fallback={null}>
              <VideoPresenter />
            </Suspense>
          </ChunkErrorBoundary>
        </div>

        {/* Section 2: Founder & Lead Strategist (Corporate Profile with Image 1 representation) */}
        <div className="mt-28 space-y-12">
          <div className="flex flex-col space-y-2 border-b border-white/5 pb-4">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              Founder-Led, Structured for Growth
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              Shadow Root is led by a single founder with clear functional roles and strategic collaborators across product, security, and governance.
            </p>
          </div>

          <div className="flex justify-center">

            {/* Founder Profile Card: Uchi Chinyama */}
            <div
              className="surface-card p-6 md:p-8 flex flex-col sm:flex-row gap-6 max-w-2xl w-full"
              tabIndex={0}
              aria-label="Profile of Uchi Chinyama, Founder and Lead Strategist of Shadow Root Security Technologies."
            >

              {/* Profile Image of Founder Uchi Chinyama */}
              <div className="w-44 h-60 rounded-xl bg-slate-950 border border-white/10 shrink-0 overflow-hidden mx-auto sm:mx-0">
                <img
                  src={uchiChinyamaPhoto}
                  alt="Uchi Chinyama, Founder and Lead Strategist of Shadow Root Security Technologies"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Bio & Details Column */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold leading-none uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full w-fit block">
                    FOUNDER &amp; LEAD STRATEGIST
                  </span>
                  <h3 className="font-display font-black text-xl text-white leading-tight">
                    Uchi Chinyama
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Founder and Lead Strategist, security researcher, and lead web defensive compliance auditor. Dedicated to building digital trust for institutions across Africa.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <span className="text-[#2563eb]">✔</span>
                    <span>Direct Phishing Architect</span>
                  </div>
                </div>

                {/* Contacts button deck */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href="mailto:uchichinyama@gmail.com"
                    className="bg-[#2563eb]/20 hover:bg-[#2563eb] border border-[#2563eb66] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                    title="Send secure email to Founder Uchi Chinyama"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Uchi</span>
                  </a>
                  <a
                    href="https://wa.me/260979501830"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                    title="Open WhatsApp message chat with Founder Uchi Chinyama"
                  >
                    💬 Chat WA
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Section 2.5: Public-Facing Department Structure */}
        <div className="mt-28 space-y-8">
          <div className="flex flex-col space-y-2 border-b border-white/5 pb-4">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              How Shadow Root Is Structured
            </h2>
            <p className="text-xs text-slate-400 max-w-md">
              Five functional departments carry out the work, under a single founder rather than a bloated executive structure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="surface-card p-5"
                tabIndex={0}
                aria-label={`Department: ${dept.name}. ${dept.meaning} Primary scope: ${dept.scope}.`}
              >
                <div className="bg-[#2563eb22] text-[#60a5fa] p-2 rounded-lg w-fit mb-3 border border-[#2563eb44]">
                  <dept.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-white text-sm">{dept.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{dept.meaning}</p>
                <p className="text-[10px] text-slate-400 mt-3">{dept.scope}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: The Shadow Audit Methodology */}
        <div className="mt-28 bg-[#0f1720] text-white rounded-2xl border border-white/10 p-6 md:p-10">
          <div className="flex flex-col space-y-8">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-white/5">
              <Swords className="w-5 h-5 text-[#2563eb]" />
              <span className="font-display font-bold text-sm">The Shadow Audit Methodology</span>
            </div>

            {/* Steps timeline horizontal on md, vertical on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((st, index) => (
                <div
                  key={index}
                  className="bg-[#0b0f14]/70 border border-white/10 p-5 rounded-xl hover:border-[#60a5fa] focus:ring-2 focus:ring-[#2563eb] transition-all flex flex-col justify-between"
                  tabIndex={0}
                  aria-label={`Step ${st.metric}: ${st.title}. ${st.desc}`}
                >
                  <span className="font-mono text-[#60a5fa] font-black text-sm bg-[#0b0f14]/90 w-8 h-8 rounded-full border border-[#2563eb44] flex items-center justify-center shrink-0">
                    {st.metric}
                  </span>
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
          </div>
        </div>

      </div>
    </div>
  );
}
