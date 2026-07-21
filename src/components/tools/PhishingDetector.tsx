import React, { useMemo, useState } from "react";
import { Mail, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

type Severity = "high" | "medium" | "low";

interface Signal {
  severity: Severity;
  label: string;
  detail: string;
}

const WEIGHT: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly", "rb.gy"];

const KNOWN_BRANDS = ["paypal", "microsoft", "office365", "google", "apple", "amazon", "netflix", "facebook", "instagram", "whatsapp", "dhl", "fedex", "airtel", "mtn", "zanaco", "fnb", "standardbank", "absa"];

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase();
  }
}

function analyzeEmail(text: string): Signal[] {
  const signals: Signal[] = [];
  const lower = text.toLowerCase();
  const push = (severity: Severity, label: string, detail: string) => signals.push({ severity, label, detail });

  const urls = text.match(/https?:\/\/[^\s"'<>)]+/gi) || [];
  const domains = urls.map(extractDomain);

  // --- Link-based signals ---
  if (urls.some(u => /https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(u))) {
    push("high", "Link points to a raw IP address", "Legitimate companies use domain names, not bare IP addresses, in their links.");
  }
  if (domains.some(d => d.startsWith("xn--") || d.includes(".xn--"))) {
    push("high", "Punycode domain detected", "Punycode (xn--) can disguise a lookalike domain using non-Latin characters.");
  }
  if (domains.some(d => URL_SHORTENERS.some(s => d === s || d.endsWith("." + s)))) {
    push("medium", "URL shortener hides the destination", "Shortened links conceal where they actually lead — hover or expand before clicking.");
  }
  if (urls.some(u => /^http:\/\//i.test(u))) {
    push("medium", "Insecure http:// link", "A login or payment page served over plain http is unencrypted and a red flag.");
  }
  // Brand name appears in a subdomain but not the registrable domain (e.g. paypal.com.secure-login.ru)
  for (const d of domains) {
    const parts = d.split(".");
    const registrable = parts.slice(-2).join(".");
    const brandInSub = KNOWN_BRANDS.find(b => d.includes(b) && !registrable.includes(b));
    if (brandInSub) {
      push("high", `Lookalike domain impersonating “${brandInSub}”`, `The link shows “${d}”, where the real domain is “${registrable}”, not ${brandInSub}.`);
      break;
    }
  }
  if (domains.some(d => d.split(".").length >= 5)) {
    push("low", "Unusually deep subdomain in a link", "Long chains of subdomains are often used to make a malicious host look trustworthy.");
  }

  // --- Language-based signals ---
  const urgency = /(urgent|immediately|as soon as possible|within \d+ ?(hours|hrs)|account (has been )?(suspended|locked|disabled)|suspended|unusual (activity|sign[- ]?in)|final notice|act now|verify (your )?(account|identity) now|failure to|will be (closed|terminated|deleted))/i;
  if (urgency.test(text)) {
    push("medium", "Urgency / pressure language", "Threats and deadlines are used to make you act before thinking.");
  }
  const credential = /(verify|confirm|update|re-?enter).{0,30}(password|account|payment|billing|card|credentials)|login to your account|one[- ]?time (password|code|pin)|\bOTP\b|social security|\bssn\b/i;
  if (credential.test(text)) {
    push("high", "Requests credentials or payment details", "Reputable services never ask you to confirm passwords, OTPs, or card details by email.");
  }
  const money = /(gift ?card|wire transfer|western union|bitcoin|\bbtc\b|crypto|cryptocurrency|money ?gram|keep this (confidential|between us)|don'?t tell|do not tell)/i;
  if (money.test(text)) {
    push("high", "Payment / secrecy red flag", "Gift-card, wire-transfer, or ‘keep this secret’ requests are classic business-email-compromise scams.");
  }
  if (/dear (customer|user|member|account holder|sir\/madam|valued)/i.test(text)) {
    push("low", "Generic, impersonal greeting", "Legitimate senders usually address you by name.");
  }
  if (/\b(attached|attachment|open the (file|document))\b/i.test(text) && /\.(exe|scr|zip|rar|js|vbs|iso|lnk|docm|xlsm|html?)\b/i.test(lower)) {
    push("medium", "Risky attachment type mentioned", "Executable, macro, and archive attachments are common malware carriers.");
  }

  // --- Header-based signals (if pasted) ---
  const fromMatch = text.match(/from:\s*"?([^"<\n]*)"?\s*<?([\w.+-]+@[\w.-]+)>?/i);
  if (fromMatch) {
    const display = fromMatch[1].trim();
    const addr = fromMatch[2].toLowerCase();
    const domain = addr.split("@")[1] || "";
    const freeProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com"];
    const brandInDisplay = KNOWN_BRANDS.find(b => display.toLowerCase().includes(b));
    if (brandInDisplay && freeProviders.includes(domain)) {
      push("high", `Sender name says “${brandInDisplay}” but uses a free inbox`, `The display name claims ${brandInDisplay}, yet the address is a personal ${domain} account.`);
    }
  }
  const replyTo = text.match(/reply-to:\s*<?([\w.+-]+@[\w.-]+)>?/i);
  if (fromMatch && replyTo) {
    const fromDomain = (fromMatch[2].split("@")[1] || "").toLowerCase();
    const replyDomain = (replyTo[1].split("@")[1] || "").toLowerCase();
    if (fromDomain && replyDomain && fromDomain !== replyDomain) {
      push("medium", "Reply-To domain differs from the sender", `Replies would go to ${replyDomain}, not ${fromDomain} — a common redirection trick.`);
    }
  }

  return signals;
}

const LEVELS = [
  { label: "Low risk", color: "#22c55e", icon: ShieldCheck },
  { label: "Elevated", color: "#eab308", icon: ShieldAlert },
  { label: "High risk", color: "#f97316", icon: AlertTriangle },
  { label: "Critical", color: "#ef4444", icon: AlertTriangle }
] as const;

const SEV_STYLE: Record<Severity, string> = {
  high: "text-red-400 border-red-500/30 bg-red-500/10",
  medium: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  low: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
};

export default function PhishingDetector() {
  const [text, setText] = useState("");

  const { signals, level } = useMemo(() => {
    if (text.trim().length < 15) return { signals: [] as Signal[], level: -1 };
    const s = analyzeEmail(text);
    const score = s.reduce((acc, x) => acc + WEIGHT[x.severity], 0);
    let lvl = 0;
    if (score >= 9) lvl = 3;
    else if (score >= 5) lvl = 2;
    else if (score >= 2) lvl = 1;
    else lvl = 0;
    return { signals: s, level: lvl };
  }, [text]);

  const meta = level >= 0 ? LEVELS[level] : null;
  const LevelIcon = meta?.icon;

  return (
    <div className="bg-[#0f1720]/70 border border-[#2563eb33] rounded-2xl p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="bg-[#2563eb]/15 border border-[#2563eb44] p-2.5 rounded-xl text-[#60a5fa]">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base">Phishing Email Detector</h3>
          <p className="text-xs text-slate-400 font-mono">Paste a suspicious email to scan it for red flags.</p>
        </div>
      </div>

      <div>
        <label htmlFor="phish-input" className="sr-only">Suspicious email content</label>
        <textarea
          id="phish-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder={"Paste the full email here — include the From: / Reply-To: headers and any links for the best result…"}
          className="w-full bg-[#070a0f] border border-[#2563eb33] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-mono resize-y focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/40"
        />
      </div>

      {meta && LevelIcon && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-display font-bold text-lg" style={{ color: meta.color }}>
              <LevelIcon className="w-5 h-5" />
              {meta.label}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {signals.length} signal{signals.length === 1 ? "" : "s"} detected
            </span>
          </div>

          {signals.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono bg-[#070a0f] border border-white/5 rounded-lg p-3 leading-relaxed">
              No automated red flags found — but that is not a guarantee it is safe. Verify the sender through a channel you trust before acting.
            </p>
          ) : (
            <ul className="space-y-2">
              {signals.map((s, i) => (
                <li key={i} className={`border rounded-lg p-3 ${SEV_STYLE[s.severity]}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold">{s.label}</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest opacity-70">{s.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{s.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-500 font-mono leading-relaxed border-t border-white/5 pt-3 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
        Heuristic analysis performed entirely in your browser — nothing is uploaded. It catches common tricks but cannot detect every attack; when in doubt, don&apos;t click, and confirm with the sender directly.
      </p>
    </div>
  );
}
