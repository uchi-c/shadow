import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, Phone, ArrowUpRight, CheckCircle, Keyboard, PlayCircle, Layers } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import CaseStudies from "./components/CaseStudies";
import QuoteForm from "./components/QuoteForm";
import ChatConcierge from "./components/ChatConcierge";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import VideoPresenter from "./components/VideoPresenter";
import useSEO from "./lib/useSEO";

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
    <div className="bg-[#05020a] min-h-screen text-slate-200 selection:bg-[#6c00ff]/30 selection:text-white leading-normal relative overflow-x-hidden flex flex-col justify-between">
      
      {/* Background Ambient Cosmic Gradients */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#6C00FF] rounded-full mix-blend-screen filter blur-[120px] opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6C00FF] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      {/* Skip Navigation Link for Screen Readers (WCAG AA accessibility) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#6C00FF] focus:text-white focus:px-4 focus:py-2.5 focus:rounded-lg focus:outline-none focus:ring-4 focus:ring-[#9E3AFF] font-mono text-xs uppercase"
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

                {/* Interactive accessible Video Presentation Deck */}
                <div id="mission-video" className="max-w-7xl mx-auto px-4 md:px-10 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#A370FF] tracking-widest uppercase flex items-center space-x-2">
                        <PlayCircle className="w-4 h-4 text-[#6C00FF]" />
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
                    <VideoPresenter />
                  </div>
                </div>

                {/* Cyber Matrix Quick Stats & Portal Preview links */}
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                  <div className="bg-gradient-to-r from-[#120826] to-[#0a0515] border border-[#6C00FF33] rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    
                    <div 
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#6C00FF22] transition-colors"
                      tabIndex={0}
                      aria-label="Direct consultation shortcut: Click get secure to book a review."
                    >
                      <div className="text-[#A370FF] font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Direct On-site Help</span>
                      </div>
                      <h4 className="font-display font-bold text-white text-sm">Need active incident oversight?</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Uchi Chinyama takes direct WhatsApp consultation inquiries for scaling start-ups and donor NGOs.
                      </p>
                      <button 
                        onClick={() => handleNavigate("quote")}
                        className="text-xs font-mono text-[#A370FF] hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#6C00FF] rounded px-1"
                        aria-label="Navigate to contact and quote form"
                      >
                        <span>Request support</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div 
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#6C00FF22] transition-colors"
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
                        className="text-xs font-mono text-teal-400 hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#6C00FF] rounded px-1"
                        aria-label="Navigate to services view"
                      >
                        <span>Learn solutions</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div 
                      className="space-y-3 p-4 rounded-xl border border-transparent hover:border-[#6C00FF22] transition-colors"
                      tabIndex={0}
                      aria-label="Security education outreach summary."
                    >
                      <div className="text-[#A370FF] font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#6C00FF]" />
                        <span>Leadership & Story</span>
                      </div>
                      <h4 className="font-display font-bold text-white text-sm">Youth-Led Collective</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Read about CEO Uchi Chinyama and how our Lusaka command hub expands.
                      </p>
                      <button 
                        onClick={() => handleNavigate("about")}
                        className="text-xs font-mono text-[#A370FF] hover:text-white flex items-center space-x-1 pt-1.5 focus:outline-none focus:ring-1 focus:ring-[#6C00FF] rounded px-1"
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
                  <div className="border border-[#6C00FF1a] bg-[#120826]/30 rounded-xl p-4 flex items-center space-x-3 text-slate-400 text-xs font-sans">
                    <Keyboard className="w-5 h-5 text-[#6C00FF] shrink-0" />
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

            {activeSection === "quote" && (
              <div className="max-w-7xl mx-auto px-4 md:px-10">
                <QuoteForm prefilledService={selectedService} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Conversational concierge simulation with screen reader overrides */}
      <ChatConcierge />

      {/* Floating click-to-WhatsApp direct rapid incident escalation channel */}
      <FloatingWhatsApp />

      {/* Secured supersonic leader administrative telemetry dashboard */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        aria-label="Administrative telemetry and leads log"
      />

      {/* High contrast structured footer navigation */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
