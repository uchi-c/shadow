import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Phone, ArrowUpRight, CheckCircle, Keyboard, PlayCircle, Layers } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChatConcierge from "./components/ChatConcierge";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Footer from "./components/Footer";
import useSEO from "./lib/useSEO";

// Code-split the heavier, navigation-gated views so they are not in the initial
// bundle. AdminPanel in particular drags in @supabase/supabase-js, which the
// public site never needs on first paint. Strands pulls in `ogl` (WebGL), so it
// is also split out and lazy-mounted to keep the initial bundle within budget.
const Strands = lazy(() => import("./components/Strands"));
const FaultyTerminal = lazy(() => import("./components/FaultyTerminal"));
const Services = lazy(() => import("./components/Services"));
const About = lazy(() => import("./components/About"));
const CaseStudies = lazy(() => import("./components/CaseStudies"));
const SecurityTools = lazy(() => import("./components/SecurityTools"));
const QuoteForm = lazy(() => import("./components/QuoteForm"));
const VideoPresenter = lazy(() => import("./components/VideoPresenter"));
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
    handleNavigate("quote");
  };

  return (
    <div className="bg-[#070a0f] min-h-screen text-slate-200 selection:bg-[#2563eb]/30 selection:text-white leading-normal relative isolate overflow-x-hidden flex flex-col justify-between">
      
      {/* Animated Strands backdrop (React Bits, WebGL) — fixed behind all content.
          Lazy-mounted so `ogl` stays out of the initial bundle; the component
          itself renders a single static frame under prefers-reduced-motion. */}
      <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none" aria-hidden="true">
        <Suspense fallback={null}>
          <Strands
            colors={["#22C55E", "#2563EB", "#06B6D4"]}
            count={3}
            speed={0.45}
            glow={2.4}
            intensity={0.55}
            opacity={0.85}
            scale={1.5}
          />
        </Suspense>
      </div>

      {/* Background Ambient Cosmic Gradients */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[#2563eb] rounded-full mix-blend-screen filter blur-[120px] opacity-15 pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#2563eb] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none -z-10"></div>

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
              <div className="space-y-24">
                {/* Hero Deck */}
                <Hero onNavigate={handleNavigate} />

                {/* Faulty-terminal signal band (React Bits, WebGL) — a decorative
                    "live threat surface" strip. Lazy-mounted; degrades gracefully. */}
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                  <div className="relative h-[300px] md:h-[340px] rounded-2xl overflow-hidden border border-[#22C55E]/25 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
                    <div className="absolute inset-0">
                      <Suspense fallback={null}>
                        <FaultyTerminal
                          tint="#22C55E"
                          brightness={0.62}
                          scale={1.6}
                          gridMul={[2, 1]}
                          digitSize={1.2}
                          scanlineIntensity={0.5}
                          glitchAmount={1}
                          flickerAmount={0.8}
                          curvature={0.12}
                          mouseReact
                          mouseStrength={0.4}
                          pageLoadAnimation
                        />
                      </Suspense>
                    </div>
                    {/* Scrim for legibility of the overlaid copy */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a0f] via-[#070a0f]/50 to-[#070a0f]/10 pointer-events-none"></div>
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                      <div className="text-[10px] font-mono text-[#22C55E] tracking-widest uppercase flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Live Threat Surface</span>
                      </div>
                      <h3 className="font-display font-medium text-xl md:text-3xl text-white mt-1.5 max-w-xl">
                        We watch the shadows, so you don&apos;t have to.
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Interactive accessible Video Presentation Deck */}
                <div id="mission-video" className="max-w-7xl mx-auto px-4 md:px-10 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#60a5fa] tracking-widest uppercase flex items-center space-x-2">
                        <PlayCircle className="w-4 h-4 text-[#2563eb]" />
                        <span>Interactive Broadcast</span>
                      </div>
                      <h3 className="font-display font-medium text-xl md:text-3xl text-white">
                        Official Slide Presentation & Mission Loop
                      </h3>
                    </div>
                    <p className="text-slate-400 text-xs max-w-sm font-sans leading-relaxed">
                      Press play to review the visual slides summarizing how Shadow Root drives cyber defense across civic and nonprofit sectors in Zambia.
                    </p>
                  </div>
                  
                  <div className="py-4">
                    <Suspense fallback={<ViewFallback />}>
                      <VideoPresenter />
                    </Suspense>
                  </div>
                </div>

                {/* Cyber Matrix Quick Stats & Portal Preview links */}
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                  <div className="bg-gradient-to-r from-[#0f1720] to-[#0b0f14] border border-[#2563eb33] rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    
                    <div 
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#2563eb22] transition-colors"
                      tabIndex={0}
                      aria-label="Direct consultation shortcut: Click get secure to book a review."
                    >
                      <div className="text-[#60a5fa] font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Direct On-site Help</span>
                      </div>
                      <h4 className="font-display font-bold text-white text-sm">Need active incident oversight?</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Uchi Chinyama takes direct WhatsApp consultation inquiries for scaling start-ups and donor NGOs.
                      </p>
                      <button 
                        onClick={() => handleNavigate("quote")}
                        className="text-xs font-mono text-[#60a5fa] hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-1"
                        aria-label="Navigate to contact and quote form"
                      >
                        <span>Request support</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div 
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#2563eb22] transition-colors"
                      tabIndex={0}
                      aria-label="Defensive capabilities summary shortcut. Review our custom phishing parameters."
                    >
                      <div className="text-teal-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span>TACTICAL CODING</span>
                      </div>
                      <h4 className="font-display font-bold text-white text-sm">Pragmatic Defense Systems</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        We build hardened and escrowed React, Next, and Express portals under zero-trust database principles.
                      </p>
                      <button 
                        onClick={() => handleNavigate("services")}
                        className="text-xs font-mono text-teal-400 hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-1"
                        aria-label="Navigate to services view"
                      >
                        <span>Learn solutions</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div 
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#2563eb22] transition-colors"
                      tabIndex={0}
                      aria-label="Security education outreach summary."
                    >
                      <div className="text-[#60a5fa] font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#2563eb]" />
                        <span>Leadership & Story</span>
                      </div>
                      <h4 className="font-display font-bold text-white text-sm">Youth-Led Collective</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Read about CEO Uchi Chinyama and how our Lusaka command hub expands.
                      </p>
                      <button 
                        onClick={() => handleNavigate("about")}
                        className="text-xs font-mono text-[#60a5fa] hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb] rounded px-1"
                        aria-label="Navigate to about and leadership page"
                      >
                        <span>Meet our team</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Secondary Assistive Accessibility hotkey instructions overlay */}
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                  <div className="border border-[#2563eb1a] bg-[#0f1720]/30 rounded-xl p-4 flex items-center space-x-3 text-slate-400 text-xs font-sans">
                    <Keyboard className="w-5 h-5 text-[#2563eb] shrink-0" />
                    <p>
                      <strong>Accessibility Notice:</strong> This defensive portal conforms strictly to WCAG AA benchmarks. You can jump directly to interactive components, skip blocks, and use keyboard standard shortcuts for direct element control.
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
                <SecurityTools />
              </div>
            )}

            {activeSection === "quote" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <QuoteForm prefilledService={selectedService} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </Suspense>
      </main>

      {/* Conversational concierge simulation with screen reader overrides */}
      <ChatConcierge />

      {/* Floating click-to-WhatsApp direct rapid incident escalation channel */}
      <FloatingWhatsApp />

      {/* Secured supersonic leader administrative telemetry dashboard */}
      {isAdminOpen && (
        <Suspense fallback={null}>
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            aria-label="Administrative telemetry and leads log"
          />
        </Suspense>
      )}

      {/* High contrast structured footer navigation */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
