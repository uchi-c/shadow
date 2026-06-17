import React, { useState } from "react";
import { Mail, Terminal, ShieldAlert, BrainCircuit, ArrowUpRight, Check } from "lucide-react";
import { ServiceItem } from "../types";

interface ServicesProps {
  onSelectService: (serviceId: string) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <div id="services" className="bg-transparent py-24 border-b border-[#6C00FF33]">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col space-y-4">
          <div className="text-xs font-mono font-bold tracking-widest text-[#A370FF] uppercase">
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
                className="group relative bg-[#120826]/70 hover:bg-[#120826] text-slate-100 rounded-2xl border border-[#6C00FF33] p-6 md:p-8 transition-all flex flex-col justify-between hover:shadow-[0_0_25px_rgba(108,0,255,0.15)]"
              >
                <div>
                  {/* Icon Container */}
                  <div className="mb-6 flex justify-between items-start">
                    <div className="bg-[#6C00FF] p-3 rounded-xl shadow-[0_0_15px_#6C00FF]">
                      {renderIcon(service.icon)}
                    </div>
                    <button 
                      onClick={() => onSelectService(service.id)}
                      className="opacity-60 group-hover:opacity-100 text-slate-400 group-hover:text-[#A370FF] hover:scale-110 transition-all p-1"
                      title="Request a customized quote"
                    >
                      <ArrowUpRight className="w-5 h-5 pointer-events-none" />
                    </button>
                  </div>

                  {/* Title & Descriptions */}
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-[#6C00FF] transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="font-sans text-sm text-slate-300 mt-3 leading-relaxed">
                    {service.description}
                  </p>

                  <p className="font-sans text-xs text-slate-400 mt-3 leading-relaxed border-l-2 border-[#6C00FF66] pl-3">
                    {service.longDescription}
                  </p>

                  {/* Features Bullets */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                        <div className="bg-[#6C00FF22] text-[#A370FF] p-0.5 rounded-full flex items-center justify-center border border-[#6C00FF44]">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="font-sans font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Quote CTA */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => onSelectService(service.id)}
                    className="text-xs font-sans font-bold text-slate-200 hover:text-[#A370FF] flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Request Custom Campaign Quote</span>
                    <ArrowUpRight className="w-4 h-4 text-[#A370FF]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic bottom Trust Banner */}
        <div className="mt-16 bg-[#0a0515]/90 rounded-2xl border border-[#6C00FF66] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C00FF1a] to-transparent pointer-events-none"></div>
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
            className="bg-[#6C00FF] hover:bg-[#8e3aff] text-white px-6 py-3 rounded-lg font-sans text-xs font-bold transition-all relative z-10 shadow-[0_0_15px_#6C00FF] cursor-pointer"
          >
            Schedule Free Vulnerability Consultation
          </button>
        </div>

      </div>
    </div>
  );
}
