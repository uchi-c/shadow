import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowUpRight, Keyboard, Layers } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChatConcierge from "./components/ChatConcierge";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Footer from "./components/Footer";
import ChunkErrorBoundary from "./components/ChunkErrorBoundary";
import useSEO from "./lib/useSEO";

// Code-split the heavier, navigation-gated views so they are not in the initial
// bundle. AdminPanel in particular drags in @supabase/supabase-js, which the
// public site never needs on first paint.
const Services = lazy(() => import("./components/Services"));
const About = lazy(() => import("./components/About"));
const CaseStudies = lazy(() => import("./components/CaseStudies"));
const SecurityTools = lazy(() => import("./components/SecurityTools"));
const Products = lazy(() => import("./components/Products"));
const Academy = lazy(() => import("./components/Academy"));
const QuoteForm = lazy(() => import("./components/QuoteForm"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));

// Minimal, theme-matched fallback while a split chunk loads.
function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="Loading">
      <div className="w-8 h-8 rounded-full border-2 border-[#2563eb33] border-t-[#60a5fa] animate-spin"></div>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedService, setSelectedService] = useState("");
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Apply search engine optimization based on active section
  useSEO(activeSection);

  // Scroll to top on every view transition to emulate standard page loading
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setPrefilledMessage("");
    handleNavigate("quote");
  };

  // Navigate to the quote form pre-tagged with the intent that sent the visitor
  // there (a product waitlist, Academy interest, a tool's recommendation, …), so
  // leads arrive with clear context for the team.
  const handleRequestQuote = (serviceId: string, message = "") => {
    setSelectedService(serviceId);
    setPrefilledMessage(message);
    handleNavigate("quote");
  };

  return (
    <div className="bg-[#070a0f] min-h-screen text-slate-200 selection:bg-[#2563eb]/30 selection:text-white leading-normal relative isolate overflow-x-hidden flex flex-col justify-between">

      {/* Static background: a subtle top-down gradient, no animation loop. */}
      <div
        className="fixed inset-0 -z-10 h-full w-full pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.12),transparent)]"
        aria-hidden="true"
      ></div>

      {/* Skip Navigation Link for Screen Readers (WCAG AA accessibility) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#2563eb] focus:text-white focus:px-4 focus:py-2.5 focus:rounded-lg focus:outline-none focus:ring-4 focus:ring-[#3b82f6] font-mono text-xs uppercase"
      >
        Skip directly to main content area
      </a>

      {/* Header Navigation */}
      <Navbar 
        onNavigate={handleNavigate} 
        activeSection={activeSection} 
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Multi-Page Routed Area */}
      <main id="main-content" className="flex-grow pt-24 pb-16 outline-none" tabIndex={-1}>
        <ChunkErrorBoundary>
        <Suspense fallback={<ViewFallback />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full"
          >
            {activeSection === "home" && (
              <div className="space-y-16">
                {/* Hero Deck */}
                <Hero onNavigate={handleNavigate} />

                {/* Quick links */}
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                  <div className="bg-[#0f1720] border border-white/10 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">

                    <div
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#2563eb22] transition-colors"
                      tabIndex={0}
                      aria-label="Direct consultation shortcut: Click get secure to book a review."
                    >
                      <div className="text-[#60a5fa] text-xs font-semibold uppercase tracking-wide flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Direct Consultation</span>
                      </div>
                      <h2 className="font-display font-bold text-white text-sm">Talk to our team</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Reach the Shadow Root team directly for a consultation on your institution&apos;s security or workflow needs.
                      </p>
                      <button
                        onClick={() => handleNavigate("quote")}
                        className="text-xs font-semibold text-[#60a5fa] hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-1"
                        aria-label="Navigate to contact and quote form"
                      >
                        <span>Request support</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#2563eb22] transition-colors"
                      tabIndex={0}
                      aria-label="Services summary shortcut."
                    >
                      <div className="text-teal-400 text-xs font-semibold uppercase tracking-wide flex items-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span>Capabilities</span>
                      </div>
                      <h2 className="font-display font-bold text-white text-sm">Secure systems, built right</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Hardened React, Next.js, and Express applications built with input validation, security headers, and rate limiting from day one.
                      </p>
                      <button
                        onClick={() => handleNavigate("services")}
                        className="text-xs font-semibold text-teal-400 hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-1"
                        aria-label="Navigate to services view"
                      >
                        <span>Learn solutions</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#2563eb22] transition-colors"
                      tabIndex={0}
                      aria-label="Leadership and structure summary."
                    >
                      <div className="text-[#60a5fa] text-xs font-semibold uppercase tracking-wide flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#2563eb]" />
                        <span>Leadership & Story</span>
                      </div>
                      <h2 className="font-display font-bold text-white text-sm">Founder-Led, Institution-Ready</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Read about Founder &amp; Lead Strategist Uchi Chinyama and how Shadow Root is structured for disciplined growth.
                      </p>
                      <button
                        onClick={() => handleNavigate("about")}
                        className="text-xs font-semibold text-[#60a5fa] hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-1"
                        aria-label="Navigate to about and leadership page"
                      >
                        <span>Meet our team</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Accessibility notice */}
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                  <div className="border border-white/10 bg-[#0f1720]/30 rounded-xl p-4 flex items-center space-x-3 text-slate-400 text-xs font-sans">
                    <Keyboard className="w-5 h-5 text-[#2563eb] shrink-0" />
                    <p>
                      This site follows WCAG AA accessibility guidelines, including skip links and full keyboard navigation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "services" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <Services onSelectService={handleSelectService} />
              </div>
            )}

            {activeSection === "about" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <About />
              </div>
            )}

            {activeSection === "case" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <CaseStudies />
              </div>
            )}

            {activeSection === "tools" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <SecurityTools onNavigate={handleNavigate} onQuote={handleRequestQuote} />
              </div>
            )}

            {activeSection === "products" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <Products onNavigate={handleNavigate} onQuote={handleRequestQuote} />
              </div>
            )}

            {activeSection === "academy" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <Academy onNavigate={handleNavigate} onQuote={handleRequestQuote} />
              </div>
            )}

            {activeSection === "quote" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <QuoteForm prefilledService={selectedService} prefilledMessage={prefilledMessage} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </Suspense>
        </ChunkErrorBoundary>
      </main>

      {/* Floating quick-action widgets, grouped in their own landmark so they
          aren't left dangling outside main/nav/footer for assistive tech. */}
      <aside aria-label="Quick contact actions">
        {/* Conversational concierge simulation with screen reader overrides */}
        <ChatConcierge />

        {/* Floating click-to-WhatsApp direct rapid incident escalation channel */}
        <FloatingWhatsApp />
      </aside>

      {/* Secured supersonic leader administrative telemetry dashboard */}
      {isAdminOpen && (
        <ChunkErrorBoundary reloadOnChunkError={false} fallback={null}>
          <Suspense fallback={null}>
            <AdminPanel
              isOpen={isAdminOpen}
              onClose={() => setIsAdminOpen(false)}
              aria-label="Administrative telemetry and leads log"
            />
          </Suspense>
        </ChunkErrorBoundary>
      )}

      {/* High contrast structured footer navigation */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
