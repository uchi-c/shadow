import React, { useMemo, useState } from "react";
import { Eye, EyeOff, ShieldCheck, ShieldAlert, Lock, Check, X } from "lucide-react";

// A small set of very common passwords / patterns worth flagging outright.
const COMMON = new Set([
  "password", "password1", "123456", "12345678", "123456789", "qwerty", "abc123",
  "111111", "123123", "admin", "letmein", "welcome", "monkey", "dragon", "iloveyou",
  "football", "master", "login", "passw0rd", "shadow", "root", "toor", "changeme",
  "qwerty123", "1q2w3e4r", "zaq12wsx", "trustno1", "sunshine", "princess", "azerty"
]);

const SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function hasSequence(pw: string): boolean {
  const lower = pw.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i < seq.length - 2; i++) {
      const chunk = seq.slice(i, i + 3);
      if (lower.includes(chunk) || lower.includes([...chunk].reverse().join(""))) return true;
    }
  }
  return false;
}

interface CheckItem {
  ok: boolean;
  text: string;
}

interface Analysis {
  score: 0 | 1 | 2 | 3 | 4;
  bits: number;
  crackTime: string;
  checks: CheckItem[];
}

const SCORE_META = [
  { label: "Very weak", color: "#ef4444", bar: "bg-red-500" },
  { label: "Weak", color: "#f97316", bar: "bg-orange-500" },
  { label: "Fair", color: "#eab308", bar: "bg-yellow-500" },
  { label: "Strong", color: "#84cc16", bar: "bg-lime-500" },
  { label: "Very strong", color: "#22c55e", bar: "bg-[#22c55e]" }
] as const;

function formatCrackTime(seconds: number): string {
  if (!isFinite(seconds)) return "effectively forever";
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [365, "day"],
    [100, "year"],
    [Infinity, "century"]
  ];
  let value = seconds;
  let name = "second";
  for (const [factor, label] of units) {
    if (value < factor) { name = label; break; }
    value /= factor;
    name = label;
  }
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  if (name === "century" && rounded > 100) return "centuries";
  return `${rounded.toLocaleString()} ${name}${rounded === 1 ? "" : "s"}`;
}

function analyze(pw: string): Analysis {
  const length = pw.length;
  let pool = 0;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasDigit) pool += 10;
  if (hasSymbol) pool += 33;

  const rawBits = length > 0 ? length * Math.log2(pool || 1) : 0;

  // Deduct entropy for predictable structure.
  let penaltyBits = 0;
  const isCommon = COMMON.has(pw.toLowerCase());
  const repeated = /(.)\1\1/.test(pw);
  const sequential = hasSequence(pw);
  if (isCommon) penaltyBits += 30;
  if (repeated) penaltyBits += 8;
  if (sequential) penaltyBits += 8;

  const bits = Math.max(0, rawBits - penaltyBits);

  // Offline attack against a fast hash: ~10 billion guesses/second, expect half the space.
  const guesses = Math.pow(2, bits) / 2;
  const seconds = guesses / 1e10;

  let score: Analysis["score"];
  if (bits < 28) score = 0;
  else if (bits < 40) score = 1;
  else if (bits < 60) score = 2;
  else if (bits < 80) score = 3;
  else score = 4;

  const checks: CheckItem[] = [
    { ok: length >= 12, text: "At least 12 characters" },
    { ok: hasLower && hasUpper, text: "Upper- and lower-case letters" },
    { ok: hasDigit, text: "Contains a number" },
    { ok: hasSymbol, text: "Contains a symbol" },
    { ok: !isCommon, text: "Not a commonly used password" },
    { ok: !repeated && !sequential, text: "No obvious repeats or sequences" }
  ];

  return { score, bits: Math.round(bits), crackTime: formatCrackTime(seconds), checks };
}

export default function PasswordAnalyzer() {
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);

  const analysis = useMemo(() => (value ? analyze(value) : null), [value]);
  const meta = analysis ? SCORE_META[analysis.score] : null;

  return (
    <div className="bg-[#0f1720]/70 border border-[#2563eb33] rounded-2xl p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="bg-[#2563eb]/15 border border-[#2563eb44] p-2.5 rounded-xl text-[#60a5fa]">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base">Password Strength Analyzer</h3>
          <p className="text-xs text-slate-400 font-mono">Estimate entropy &amp; time-to-crack in real time.</p>
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <label htmlFor="pw-analyzer-input" className="sr-only">Password to analyze</label>
        <input
          id="pw-analyzer-input"
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Type a password to test it…"
          className="w-full bg-[#070a0f] border border-[#2563eb33] rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/40"
        />
        <button
          type="button"
          onClick={() => setReveal(r => !r)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer"
          aria-label={reveal ? "Hide password" : "Show password"}
        >
          {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength meter */}
      <div className="space-y-2">
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-[#1e293b] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${analysis && analysis.score >= i ? (meta?.bar ?? "") : ""}`}
                style={{ width: analysis && analysis.score >= i ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5" style={{ color: meta?.color ?? "#64748b" }}>
            {analysis && analysis.score >= 3 ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {meta ? meta.label : "Awaiting input"}
          </span>
          {analysis && (
            <span className="text-slate-400">
              ~{analysis.bits} bits · cracks in <span className="text-white font-semibold">{analysis.crackTime}</span>
            </span>
          )}
        </div>
      </div>

      {/* Checklist */}
      {analysis && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {analysis.checks.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-mono">
              {c.ok
                ? <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                : <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              <span className={c.ok ? "text-slate-300" : "text-slate-500"}>{c.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Privacy note — important for a security brand */}
      <p className="text-[10px] text-slate-500 font-mono leading-relaxed border-t border-white/5 pt-3 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
        Analyzed entirely in your browser. Your password is never transmitted, logged, or stored — estimates assume a fast offline attack (~10 billion guesses/second).
      </p>
    </div>
  );
}
