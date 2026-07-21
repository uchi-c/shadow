import React, { useMemo, useState } from "react";
import { Gauge, ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Option { label: string; points: number }
interface Question { id: string; q: string; options: Option[]; advice: string }

const MAX_POINTS = 3;

const QUESTIONS: Question[] = [
  {
    id: "mfa",
    q: "Do staff use multi-factor authentication (MFA) on email and key systems?",
    options: [{ label: "Everywhere", points: 3 }, { label: "Some systems", points: 1 }, { label: "Not at all", points: 0 }],
    advice: "Turn on MFA for email and admin accounts first — it blocks the vast majority of account-takeover attacks."
  },
  {
    id: "backups",
    q: "How are backups of critical data handled?",
    options: [{ label: "Automated, tested, offsite", points: 3 }, { label: "Manual / occasional", points: 1 }, { label: "No backups", points: 0 }],
    advice: "Set up automated offsite backups and test a restore — it's your last line of defence against ransomware."
  },
  {
    id: "patching",
    q: "How quickly are software and security updates applied?",
    options: [{ label: "Within days, automated", points: 3 }, { label: "Eventually", points: 1 }, { label: "Rarely / unsure", points: 0 }],
    advice: "Enable automatic updates and schedule a monthly patch review; unpatched software is a top breach vector."
  },
  {
    id: "training",
    q: "Has your team had phishing / security-awareness training in the last 12 months?",
    options: [{ label: "Yes, regularly", points: 3 }, { label: "Once", points: 1 }, { label: "Never", points: 0 }],
    advice: "Run periodic phishing simulations and short training — people are the most targeted layer."
  },
  {
    id: "access",
    q: "Do you enforce least-privilege and revoke access when staff leave?",
    options: [{ label: "Yes, reviewed regularly", points: 3 }, { label: "Informally", points: 1 }, { label: "No", points: 0 }],
    advice: "Review who has access to what quarterly, and off-board leavers immediately to close lingering doors."
  },
  {
    id: "incident",
    q: "Do you have a written incident-response plan you've actually tested?",
    options: [{ label: "Yes, tested", points: 3 }, { label: "Written only", points: 1 }, { label: "No plan", points: 0 }],
    advice: "Document who does what during a breach and run a tabletop exercise — minutes matter in an incident."
  },
  {
    id: "passwords",
    q: "What best describes your password practices?",
    options: [{ label: "Password manager + strong, unique", points: 3 }, { label: "Some rules", points: 1 }, { label: "Reused / weak", points: 0 }],
    advice: "Roll out a password manager so every account gets a strong, unique password without the memory burden."
  }
];

const LEVELS = [
  { min: 0, label: "Critical exposure", color: "#ef4444" },
  { min: 40, label: "Developing", color: "#f97316" },
  { min: 60, label: "Solid foundation", color: "#eab308" },
  { min: 80, label: "Strong posture", color: "#22c55e" }
];

function levelFor(pct: number) {
  return [...LEVELS].reverse().find(l => pct >= l.min) ?? LEVELS[0];
}

export default function SecurityMaturity({ onNavigate, onQuote }: { onNavigate?: (section: string) => void; onQuote?: (service: string, message?: string) => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === QUESTIONS.length;

  const { pct, level, gaps } = useMemo(() => {
    const earned = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
    const max = QUESTIONS.length * MAX_POINTS;
    const pct = Math.round((earned / max) * 100);
    const gaps = QUESTIONS.filter(q => (answers[q.id] ?? 0) < MAX_POINTS && answers[q.id] !== undefined);
    return { pct, level: levelFor(pct), gaps };
  }, [answers]);

  return (
    <div className="bg-[#0f1720]/70 border border-[#2563eb33] rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#2563eb]/15 border border-[#2563eb44] p-2.5 rounded-xl text-[#60a5fa]">
          <Gauge className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base">Security Maturity Assessment</h3>
          <p className="text-xs text-slate-400 font-mono">Seven questions. An honest snapshot of your posture.</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {QUESTIONS.map((q, qi) => (
          <fieldset key={q.id} className="space-y-2">
            <legend className="text-xs text-slate-200 font-medium leading-snug">
              <span className="text-[#60a5fa] font-mono mr-1.5">{String(qi + 1).padStart(2, "0")}</span>{q.q}
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.points;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: opt.points }))}
                    className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      selected
                        ? "bg-[#2563eb] text-white border-[#2563eb]"
                        : "bg-[#070a0f] text-slate-400 border-[#2563eb22] hover:border-[#2563eb66] hover:text-slate-200"
                    }`}
                    aria-pressed={selected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Live score */}
      <div className="border-t border-white/5 pt-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Posture score</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl" style={{ color: complete ? level.color : "#475569" }}>
                {complete ? pct : "—"}
              </span>
              <span className="text-slate-500 text-sm font-mono">/ 100</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold flex items-center gap-1.5" style={{ color: complete ? level.color : "#64748b" }}>
            {complete && pct >= 80 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {complete ? level.label : `${answeredCount}/${QUESTIONS.length} answered`}
          </span>
        </div>
        <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${complete ? pct : (answeredCount / QUESTIONS.length) * 100 * 0.15}%`, backgroundColor: complete ? level.color : "#334155" }}
          />
        </div>

        {complete && (
          <div className="space-y-3">
            {gaps.length === 0 ? (
              <p className="text-xs text-[#22c55e] font-mono bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-lg p-3">
                Excellent — no major gaps flagged. Keep testing and reviewing regularly.
              </p>
            ) : (
              <>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Priority recommendations</div>
                <ul className="space-y-2">
                  {gaps.map(g => (
                    <li key={g.id} className="flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>{g.advice}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {(onQuote || onNavigate) && (
              <button
                onClick={() => (onQuote
                  ? onQuote("consultation", `I completed the Security Maturity Assessment (score ${pct}/100 — ${level.label}) and would like a tailored remediation plan.`)
                  : onNavigate?.("quote"))}
                className="mt-1 inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer"
              >
                <span>Get a tailored remediation plan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-500 font-mono leading-relaxed border-t border-white/5 pt-3">
        Indicative self-assessment computed in your browser — not a substitute for a full audit. Shadow Root can validate and prioritise these findings for your organisation.
      </p>
    </div>
  );
}
