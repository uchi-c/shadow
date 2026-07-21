import { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

// Detects the various messages browsers/bundlers use when a lazily-imported
// chunk can no longer be fetched — which is exactly what happens when a user
// keeps an old tab open across a deploy and the hashed filenames change.
function isChunkLoadError(error: unknown): boolean {
  const msg = error && (error as { message?: unknown }).message
    ? String((error as { message?: unknown }).message)
    : String(error);
  const name = error && (error as { name?: unknown }).name ? String((error as { name?: unknown }).name) : "";
  return (
    name === "ChunkLoadError" ||
    /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed|dynamically imported module/i.test(msg)
  );
}

interface Props {
  children: ReactNode;
  /** Reload the page once on a chunk-load error (default true). */
  reloadOnChunkError?: boolean;
  /** What to show once an error is caught (after any reload attempt). */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

const RELOAD_KEY = "sr_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 10_000;

/**
 * Catches errors from lazily-loaded routes. For chunk-load failures (a stale
 * tab hitting a filename that no longer exists after a new deploy) it performs
 * a single cooldown-guarded reload to pick up the fresh HTML + assets. Any
 * other error simply renders the fallback. Non-chunk errors never trigger a
 * reload, and the cooldown prevents reload loops.
 */
export default class ChunkErrorBoundary extends Component<Props, State> {
  // NOTE: this project has no @types/react installed, so React.Component is
  // untyped (any) and does not surface props/state. Declare them explicitly so
  // this file stays type-safe without changing global typings.
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, ...ChunkErrorBoundary.maybeReload(error) };
  }

  private static maybeReload(error: unknown): Partial<State> {
    if (!isChunkLoadError(error)) return {};
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last > RELOAD_COOLDOWN_MS) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
      }
    } catch {
      // sessionStorage unavailable — fall through to the fallback UI.
    }
    return {};
  }

  componentDidCatch(error: unknown) {
    // Honour the per-boundary opt-out (used for the decorative backgrounds,
    // where a failed chunk should stay silent rather than reload the page).
    if (this.props.reloadOnChunkError === false && isChunkLoadError(error)) {
      try {
        // Undo the reload timestamp this boundary would otherwise have set.
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* ignore */
      }
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 gap-4" role="alert">
        <div className="bg-[#2563eb]/10 border border-[#2563eb33] text-[#60a5fa] p-3 rounded-full">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-white text-base">This section didn&apos;t load</h3>
          <p className="text-xs text-slate-400 font-mono max-w-sm">
            The site may have just updated. Reloading usually fixes it.
          </p>
        </div>
        <button
          onClick={this.handleReload}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>
    );
  }
}
