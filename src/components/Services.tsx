import React, { useState } from "react";
import { Mail, Terminal, ShieldAlert, BrainCircuit, ArrowUpRight, Check, X, Route, ListChecks, Cpu, Wallet } from "lucide-react";
import { ServiceItem } from "../types";

interface ServicesProps {
  onSelectService: (serviceId: string) => void;
}

interface ServiceDetail {
  process: string[];
  deliverables: string[];
  technologies: string[];
  pricing: string;
}

// Detail content for the service modals. These describe Shadow Root's own
// service offerings (not any client engagement), so they are safe to publish.
const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  phishing_simulation: {
    process: [
      "Scoping & consent — agree targets and rules of engagement",
      "Campaign design — localized lures (MTN/Airtel Money, banks, SaaS logins)",
      "Controlled launch — safe, tracked simulation over an agreed window",
      "Reporting — click and credential metrics, framed without blame",
      "Awareness workshop — turn the findings into hands-on training",
      "Re-test — measure improvement a few months later"
    ],
    deliverables: [
      "Executive summary + per-department metrics",
      "Anonymized click & credential-submission analytics",
      "Interactive security-awareness training session",
      "Prioritized remediation guidance"
    ],
    technologies: ["Localized lure templates", "Anonymized tracking", "Secure reporting"],
    pricing: "Tiered by team size — starts at a budget-friendly basic tier for small teams and NGOs. Scoped after a free consultation."
  },
  secure_web_dev: {
    process: [
      "Discovery — goals, threat model, and scope",
      "Architecture — security-first design (auth, data flow, headers)",
      "Build — React/Express with input validation and rate limiting",
      "Hardening — CSP/HSTS, dependency audit, secure file handling",
      "Launch — SSL, performance pass, and monitoring",
      "Handover — documentation and an optional support retainer"
    ],
    deliverables: [
      "Fast, mobile-first React frontend",
      "Hardened Express/Node backend",
      "Security headers (CSP, HSTS, X-Frame-Options)",
      "Rate limiting, input sanitization & SSL setup"
    ],
    technologies: ["React", "Next.js", "Node.js", "Express", "TypeScript", "Tailwind"],
    pricing: "Milestone-based payment structure for software and web projects. Estimated after a scoping consultation."
  },
  pentest_audits: {
    process: [
      "Scoping & authorization — targets, depth, rules of engagement",
      "Reconnaissance — surface and asset discovery",
      "Testing — OWASP Top 10, injection, XSS, auth & misconfiguration",
      "Validation — confirm findings and rate severity",
      "Reporting — clear remediation steps, prioritized",
      "Re-test / retainer — verify fixes; optional 24/7 monitoring"
    ],
    deliverables: [
      "Comprehensive findings report with severity ratings",
      "Proof-of-concept for confirmed issues",
      "Prioritized remediation roadmap",
      "Optional continuous-scanning retainer"
    ],
    technologies: ["OWASP methodology", "Web / API / network testing", "Config & database review"],
    pricing: "One-time comprehensive audits, or monthly retainers for 24/7 coverage. Priced after scoping."
  },
  ai_workflows: {
    process: [
      "Use-case mapping — where AI adds real value (support, leads)",
      "Architecture — server-side, key-hidden design (like this site's concierge)",
      "RAG setup — ground answers in your own knowledge base",
      "Integration — web widget and/or WhatsApp Business API",
      "Safety — escalation routing, PII-safe logging, rate limits",
      "Launch & tune — monitor and refine over time"
    ],
    deliverables: [
      "Secure server-side AI concierge",
      "Retrieval-augmented answers grounded in your content",
      "WhatsApp Business API integration (optional)",
      "Human-takeover routing + lead capture"
    ],
    technologies: ["Google Gemini", "RAG", "Express (hidden keys)", "WhatsApp Business API"],
    pricing: "Scoped to integration complexity and volume. Assessed in a free consultation."
  }
};

export default function Services({ onSelectService }: ServicesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openService, setOpenService] = useState<ServiceItem | null>(null);

  const servicesData: ServiceItem[] = [
    {
      id: "phishing_simulation",
      title: "Phishing Simulations & Awareness Training",
      description: "Design customized phishing mock attacks replicating local mobile money alerts, banks, and mailboxes to run safe team assessment.",
      longDescription: "NGOs, educational entities, and businesses in Zambia are frequently targeted with social engineering. Shadow Root designs safe phishing simulations, detailing who clicked and what credentials were leaked. This is paired with on-site cybersecurity culture training to build robust human firewalls.",
      icon: "Mail",
      features: [
        "MTN/Airtel Money local alert templates",
        "Anonymized employee tracking analytics",
        "NGO trust and donor safety focus",
        "Actionable cyber security workshops"
      ]
    },
    {
      id: "secure_web_dev",
      title: "Defense-Grade Web Development",
      description: "Custom full-stack software built with security first. Escape unvalidated templates with high-performance and resilient React apps.",
      longDescription: "Standard agencies ignore secure headers, sanitization, and brute-force protection. Shadow Root builds ultra-fast, mobile-first websites and React frontends configured with CSP headers, rigid input validation, and DDoS rate-limiting to prevent hackers from defacing or exploiting your backend.",
      icon: "Terminal",
      features: [
        "React & Express tailored stack",
        "Strict input parsing & escape filters",
        "Full-scope Content Security Policies",
        "SSL setup and speed optimizations"
      ]
    },
    {
      id: "pentest_audits",
      title: "Vulnerability Auditing & Retainer Services",
      description: "Thorough network, API, and codebase penetration testing to patch injection gates and configurations.",
      longDescription: "We act as your on-call security team. Our penetration testing sweeps scan databases and configurations for OWASP Top 10 breaches (SQLi, XSS, SSRF). Organizations can secure ongoing support via our maintenance retainers, which grant 24/7 scanning and immediate incident response.",
      icon: "ShieldAlert",
      features: [
        "OWASP Top 10 complete audits",
        "SQL injection & XSS pen-testing",
        "24/7 Security incident retainer",
        "Direct remediation documentation"
      ]
    },
    {
      id: "ai_workflows",
      title: "Secure AI Integration (Gemini & WhatsApp)",
      description: "Server-side secure virtual concierges and automated chatbots that safely enclose access keys and boost leads.",
      longDescription: "We design AI widgets powered by Google Gemini (like this site's concierge) and WhatsApp business integrations. All AI workflows are deployed inside secure, client-hidden servers to prevent authorization key leaks. It provides customer interactions and leads scheduling 24/7.",
      icon: "BrainCircuit",
      features: [
        "Google Gemini Flash server deployment",
        "WhatsApp Business API connections",
        "PII-safe conversation histories logging",
        "Intelligent human-takeover routers"
      ]
    }
  ];

  const renderIcon = (iconName: string) => {
    const iconClass = "w-7 h-7 text-white";
    switch (iconName) {
      case "Mail":
        return <Mail className={iconClass} />;
      case "Terminal":
        return <Terminal className={iconClass} />;
      case "ShieldAlert":
        return <ShieldAlert className={iconClass} />;
      case "BrainCircuit":
        return <BrainCircuit className={iconClass} />;
      default:
        return <Terminal className={iconClass} />;
    }
  };

  return (
    <div id="services" className="bg-transparent py-24 border-b border-[#2563eb33]">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col space-y-4">
          <div className="text-xs font-mono font-bold tracking-widest text-[#60a5fa] uppercase">
            Defense Capabilities
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">
            Comprehensive services for security & growth
          </h2>
          <p className="font-sans text-slate-400 text-sm md:text-base">
            We operate behind the scenes to audit systems, simulate threats, write bulletproof client code, and implement intelligent AI assistants that run cleanly and safely.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesData.map((service, index) => {
            return (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative bg-[#0f1720]/70 hover:bg-[#0f1720] text-slate-100 rounded-2xl border border-[#2563eb33] p-6 md:p-8 transition-all flex flex-col justify-between hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]"
              >
                <div>
                  {/* Icon Container */}
                  <div className="mb-6 flex justify-between items-start">
                    <div className="bg-[#2563eb] p-3 rounded-xl shadow-[0_0_15px_#2563eb]">
                      {renderIcon(service.icon)}
                    </div>
                    <button 
                      onClick={() => onSelectService(service.id)}
                      className="opacity-60 group-hover:opacity-100 text-slate-400 group-hover:text-[#60a5fa] hover:scale-110 transition-all p-1"
                      title="Request a customized quote"
                    >
                      <ArrowUpRight className="w-5 h-5 pointer-events-none" />
                    </button>
                  </div>

                  {/* Title & Descriptions */}
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-[#2563eb] transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="font-sans text-sm text-slate-300 mt-3 leading-relaxed">
                    {service.description}
                  </p>

                  <p className="font-sans text-xs text-slate-400 mt-3 leading-relaxed border-l-2 border-[#2563eb66] pl-3">
                    {service.longDescription}
                  </p>

                  {/* Features Bullets */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                        <div className="bg-[#2563eb22] text-[#60a5fa] p-0.5 rounded-full flex items-center justify-center border border-[#2563eb44]">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="font-sans font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer CTAs */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setOpenService(service)}
                    className="text-xs font-sans font-bold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Route className="w-4 h-4 text-[#60a5fa]" />
                    <span>View details</span>
                  </button>
                  <button
                    onClick={() => onSelectService(service.id)}
                    className="text-xs font-sans font-bold text-slate-200 hover:text-[#60a5fa] flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Request Quote</span>
                    <ArrowUpRight className="w-4 h-4 text-[#60a5fa]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic bottom Trust Banner */}
        <div className="mt-16 bg-[#0b0f14]/90 rounded-2xl border border-[#2563eb66] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb1a] to-transparent pointer-events-none"></div>
          <div className="flex flex-col space-y-1.5 relative z-10 text-center md:text-left">
            <h3 className="font-display font-bold text-lg md:text-xl">
              Are you an NGO, school, or business in Lusaka?
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-xl">
              Shadow Root provides flexible, tiered packages. Get custom phishing simulations or secure web architectures suited exactly to your staff size.
            </p>
          </div>
          <button
            onClick={() => onSelectService("consultation")}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-lg font-sans text-xs font-bold transition-all relative z-10 shadow-[0_0_15px_#2563eb] cursor-pointer"
          >
            Schedule Free Vulnerability Consultation
          </button>
        </div>

      </div>

      {/* SERVICE DETAIL MODAL */}
      {openService && (() => {
        const detail = SERVICE_DETAILS[openService.id];
        return (
          <div
            className="fixed inset-0 z-50 bg-[#05070b]/85 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${openService.title} details`}
            onClick={() => setOpenService(null)}
          >
            <div
              className="bg-[#0b0f14] border border-[#2563eb44] rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-[0_0_60px_rgba(37,99,235,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0b0f14]/95 backdrop-blur px-6 md:px-8 py-5 border-b border-[#2563eb22] flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2563eb] p-2.5 rounded-xl shadow-[0_0_15px_#2563eb] shrink-0">
                    {renderIcon(openService.icon)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">{openService.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Shadow Root service overview</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenService(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all cursor-pointer shrink-0"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-7">
                {/* Overview */}
                <p className="text-sm text-slate-300 leading-relaxed">{openService.longDescription}</p>

                {detail && (
                  <>
                    {/* Process */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#60a5fa] flex items-center gap-2">
                        <Route className="w-4 h-4" /> How we work
                      </h4>
                      <ol className="space-y-2.5">
                        {detail.process.map((step, i) => (
                          <li key={i} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                            <span className="font-mono text-[10px] text-[#60a5fa] bg-[#2563eb]/10 border border-[#2563eb33] rounded w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#60a5fa] flex items-center gap-2">
                        <ListChecks className="w-4 h-4" /> What you receive
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {detail.deliverables.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <div className="bg-[#22c55e]/15 text-[#22c55e] p-0.5 rounded-full border border-[#22c55e]/30 mt-0.5 shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#60a5fa] flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> Approach &amp; tooling
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detail.technologies.map((t) => (
                          <span key={t} className="text-[11px] font-mono text-slate-300 bg-[#070a0f] border border-[#2563eb33] rounded-full px-3 py-1">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-[#070a0f] border border-[#2563eb1a] rounded-2xl p-4 flex items-start gap-3">
                      <Wallet className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-1">Indicative pricing</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{detail.pricing}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={() => { const id = openService.id; setOpenService(null); onSelectService(id); }}
                    className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    <span>Book a consultation</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOpenService(null)}
                    className="sm:w-auto px-5 py-3 text-sm font-bold text-slate-300 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
