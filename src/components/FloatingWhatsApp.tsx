import React, { useState } from "react";
import { MessageCircle, ShieldAlert, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import useViewportReachability from "../lib/useViewportReachability";

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const { scale, bottomOffset, leftOffset, isMobile } = useViewportReachability();
  
  // CEO Uchi Chinyama's secure direct messaging link
  const phoneNumber = "260979501830";
  const defaultMessage = "Hello Uchi, I visited the Shadow Root Security Technologies portal and would like to request an expert consultation or cybersecurity breach audit for my systems.";
  const clickToWhatsAppUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <motion.div 
      className="fixed z-45 font-sans origin-bottom-left"
      animate={{
        bottom: bottomOffset,
        left: leftOffset,
        scale: scale,
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 22
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className={`absolute bottom-16 left-0 bg-[#0a0515]/95 border border-emerald-500/40 text-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] pointer-events-none ${
              isMobile ? "w-52 p-2.5" : "w-60 p-3"
            }`}
          >
            <div className="flex items-start space-x-2.5">
              <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-emerald-400 font-mono tracking-wider uppercase">
                  Direct Escalate to CEO
                </p>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Connect with Uchi Chinyama directly on WhatsApp for real-time incident responses.
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-emerald-400/80">
              <span>Standard Encryption</span>
              <span className="flex items-center">Open Chat <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" /></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={clickToWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className={`relative bg-slate-950 hover:bg-[#071d11] text-white rounded-full border border-emerald-500/70 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] transition-all group ${
          isMobile ? "p-3" : "p-4"
        }`}
        aria-label="Direct escalation chat with Cyber CEO Uchi Chinyama on WhatsApp"
      >
        {/* Pulse ring indicating direct live communication channel */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-pulse-ring pointer-events-none"></div>
        
        {/* Green message alert dot */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <MessageCircle 
          className={`text-emerald-400 group-hover:rotate-6 transition-all ${
            isMobile ? "w-5.5 h-5.5" : "w-6 h-6"
          }`} 
          strokeWidth={2.2} 
        />
      </motion.a>
    </motion.div>
  );
}
