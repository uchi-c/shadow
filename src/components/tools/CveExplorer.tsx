import React, { useState } from "react";
import { Bug, Search, ExternalLink, AlertTriangle, ShieldAlert, Loader2, Info } from "lucide-react";

interface Cve {
  id: string;
  summary: string;
  published: string | null;
  lastModified: string | null;
  severity: string | null;
  score: number | null;
  vector: string | null;
  cwe: string[];
  url: string;
}

interface CveResponse {
  query: string;
  totalResults: number;
  results: Cve[];
}

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "text-[#f87171] bg-[#ef4444]/10 border-[#ef4444]/30",
  HIGH: "text-[#fb923c] bg-[#f97316]/10 border-[#f97316]/30",
  MEDIUM: "text-[#facc15] bg-[#eab308]/10 border-[#eab308]/30",
  LOW: "text-[#4ade80] bg-[#22c55e]/10 border-[#22c55e]/30"
};

function severityClass(sev: string | null): string {
  return (sev && SEVERITY_STYLE[sev]) || "text-slate-400 bg-white/5 border-white/10";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const EXAMPLES = ["Log4j", "OpenSSL", "WordPress", "CVE-2021-44228"];

export default function CveExplorer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<CveResponse | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = async (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) {
      setError("Enter a product, technology, or a CVE id (e.g. CVE-2021-44228).");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);

    // A specific CVE id goes to the id param; everything else is a keyword search.
    const isCveId = /^CVE-\d{4}-\d{4,7}$/i.test(trimmed);
    const params = new URLSearchParams(isCveId ? { id: trimmed } : { keyword: trimmed });

    try {
      const res = await fetch(`/api/cve?${params.toString()}`);
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error || "Search failed. Please try again.");
        setData(null);
      } else {
        setData(body as CveResponse);
      }
    } catch {
      setError("Could not reach the vulnerability feed. Please check your connection and try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="bg-[#0f1720]/70 border border-[#2563eb33] rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#2563eb]/15 border border-[#2563eb44] p-2.5 rounded-xl text-[#60a5fa]">
          <Bug className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base">CVE Explorer</h3>
          <p className="text-xs text-slate-400 font-mono">Search live vulnerabilities from the NIST NVD by product or CVE id.</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Apache, nginx, WordPress, CVE-2021-44228"
              aria-label="Search vulnerabilities by product or CVE id"
              className="w-full bg-[#070a0f] border border-[#2563eb22] focus:border-[#2563eb] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setQuery(ex); runSearch(ex); }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-[#2563eb22] text-slate-400 hover:border-[#2563eb66] hover:text-slate-200 transition-all cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-[#fb923c] bg-[#f97316]/5 border border-[#f97316]/20 rounded-lg p-3" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {data && !error && (
        <div className="space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            {data.results.length > 0
              ? <>Showing {data.results.length} of {data.totalResults.toLocaleString()} known {data.totalResults === 1 ? "vulnerability" : "vulnerabilities"} for “{data.query}”</>
              : <>No vulnerabilities found for “{data.query}”.</>}
          </div>

          <ul className="space-y-3">
            {data.results.map((c) => (
              <li key={c.id} className="bg-[#070a0f] border border-[#2563eb1a] rounded-xl p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-white">{c.id}</span>
                    <span className={`text-[9px] font-mono uppercase tracking-widest border rounded-full px-2 py-0.5 ${severityClass(c.severity)}`}>
                      {c.severity || "Unscored"}{c.score !== null ? ` · ${c.score.toFixed(1)}` : ""}
                    </span>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#60a5fa] hover:text-white transition-colors shrink-0 inline-flex items-center gap-1 text-[11px] font-mono"
                    aria-label={`View ${c.id} on the NVD website`}
                  >
                    NVD <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.summary}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500">
                  <span>Published {formatDate(c.published)}</span>
                  {c.cwe.length > 0 && <span className="text-slate-400">{c.cwe.slice(0, 3).join(", ")}</span>}
                  {c.vector && <span className="hidden md:inline truncate max-w-full">{c.vector}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty initial state */}
      {!searched && !error && (
        <div className="flex items-start gap-2 text-xs text-slate-400 bg-[#2563eb]/5 border border-[#2563eb]/15 rounded-lg p-3">
          <ShieldAlert className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
          <span>Search a technology in your stack to see the known vulnerabilities affecting it — then check whether your version is patched.</span>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[10px] text-slate-500 font-mono leading-relaxed border-t border-white/5 pt-3">
        <Info className="w-3 h-3 shrink-0 mt-0.5" />
        <span>Live data from the NIST National Vulnerability Database (NVD). Results are informational; matching a CVE to your exact version and configuration is what a Shadow Root assessment does for you.</span>
      </p>
    </div>
  );
}
