import React from "react";
import { Boxes, Bot, FlaskConical, Radar, GraduationCap, ArrowUpRight, Check, Sparkles } from "lucide-react";

interface ProductsProps {
  onNavigate?: (section: string) => void;
  onQuote?: (service: string, message?: string) => void;
}

type Status = "Live" | "In development" | "Planned";

const STATUS_STYLE: Record<Status, string> = {
  "Live": "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30",
  "In development": "text-[#60a5fa] bg-[#2563eb]/10 border-[#2563eb]/30",
  "Planned": "text-slate-400 bg-white/5 border-white/10"
};

interface Product {
  id: string;
  name: string;
  tagline: string;
  status: Status;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  cta: string;
  target: string; // "quote" routes to the quote form with context; anything else navigates
  quoteService?: string;
  quoteMessage?: string;
}

const PRODUCTS: Product[] = [
  {
    id: "kuma", name: "Kuma AI", tagline: "Virtual security concierge", status: "Live", icon: Bot,
    desc: "The server-side AI concierge already running on this site. Deploy it on your own website or WhatsApp to answer customers, qualify leads, and escalate incidents 24/7 — with your API keys safely hidden.",
    cta: "Deploy Kuma", target: "quote",
    quoteService: "ai_workflows", quoteMessage: "I'm interested in deploying Kuma AI (the virtual security concierge) for my organization."
  },
  {
    id: "labs", name: "Shadow Root Labs", tagline: "Hands-on cyber ranges", status: "In development", icon: FlaskConical,
    desc: "Isolated, disposable practice environments and capture-the-flag challenges for training teams and students on real attack-and-defense scenarios.",
    cta: "Notify me", target: "quote",
    quoteService: "consultation", quoteMessage: "Please notify me when Shadow Root Labs (hands-on cyber ranges) becomes available."
  },
  {
    id: "academy", name: "Shadow Root Academy", tagline: "Cyber skills for Africa", status: "In development", icon: GraduationCap,
    desc: "Structured learning paths that take beginners to job-ready defenders — fundamentals, ethical hacking, blue-team, forensics, cloud, and AI security.",
    cta: "Explore the Academy", target: "academy"
  },
  {
    id: "threatintel", name: "Threat Intelligence", tagline: "Regional threat feed", status: "Planned", icon: Radar,
    desc: "Curated intelligence on threats targeting Southern African businesses, NGOs, and schools — distilled into practical, prioritized guidance.",
    cta: "Register interest", target: "quote",
    quoteService: "consultation", quoteMessage: "I'd like to register interest in the Shadow Root Threat Intelligence offering."
  }
];

export default function Products({ onNavigate, onQuote }: ProductsProps) {
  const requestQuote = (service: string, message: string) =>
    onQuote ? onQuote(service, message) : onNavigate?.("quote");

  const handleProduct = (p: Product) => {
    if (p.target === "quote") requestQuote(p.quoteService ?? "consultation", p.quoteMessage ?? "");
    else onNavigate?.(p.target);
  };

  return (
    <section aria-labelledby="products-heading" className="space-y-12">
      <div className="space-y-3">
        <div className="text-[10px] font-mono text-[#60a5fa] tracking-widest uppercase flex items-center gap-2">
          <Boxes className="w-4 h-4 text-[#2563eb]" />
          <span>The Shadow Root Ecosystem</span>
        </div>
        <h2 id="products-heading" className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-tight">
          Products in the making.
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
          We&apos;re building an ecosystem of security products for African organizations. Some are live today; others are in active development — labelled honestly, because trust is the point.
        </p>
      </div>

      {/* Flagship: URUU */}
      <div className="relative rounded-3xl border border-[#2563eb44] bg-gradient-to-br from-[#0f1720] to-[#0b0f14] p-6 md:p-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2563eb] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="relative space-y-5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-white font-display font-black text-2xl md:text-3xl tracking-tight">
              <Sparkles className="w-6 h-6 text-[#60a5fa]" />
              URUU
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-widest border rounded-full px-2.5 py-1 ${STATUS_STYLE["In development"]}`}>
              In development
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Flagship platform</span>
          </div>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            URUU is Shadow Root&apos;s flagship AI platform — one workspace that unifies <strong className="text-white">secure web development</strong>, <strong className="text-white">AI integration</strong>, <strong className="text-white">phishing defense</strong>, and <strong className="text-white">cybersecurity</strong>. It learns from real deployments — starting with this very site — to automate how organizations build and protect their digital presence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {["Secure web build automation", "AI assistants grounded in your data", "Phishing simulation & awareness engine", "Continuous, prioritized threat intelligence"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="bg-[#2563eb]/15 text-[#60a5fa] p-0.5 rounded-full border border-[#2563eb44]">
                  <Check className="w-3 h-3" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => requestQuote("uruu", "I'd like to join the URUU early-access waitlist.")}
            className="inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            <span>Join the early-access waitlist</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Other products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PRODUCTS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="bg-[#0f1720]/70 border border-[#2563eb22] rounded-2xl p-6 flex flex-col justify-between gap-5 hover:border-[#2563eb55] transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-[#2563eb]/15 border border-[#2563eb44] p-2.5 rounded-xl text-[#60a5fa]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-widest border rounded-full px-2 py-0.5 ${STATUS_STYLE[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">{p.name}</h3>
                  <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">{p.tagline}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
              <button
                onClick={() => handleProduct(p)}
                className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#60a5fa] hover:text-white transition-colors cursor-pointer"
              >
                <span>{p.cta}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
