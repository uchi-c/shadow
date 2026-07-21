import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export default function Hover3DLogo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values to track absolute coordinate inputs
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for smooth fluid 3D tilt adjustments
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    damping: 20,
    stiffness: 150,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    damping: 20,
    stiffness: 150,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates: center is (0,0), range from -0.5 to 0.5
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center cursor-pointer group select-none"
      style={{ perspective: "1000px" }}
      role="img"
      aria-label="Shadow Root Security Technologies Interactive 3D Cyber Shield Logo and digital electronic roots"
      tabIndex={0}
    >
      {/* Dynamic 3D Transform Wrapper */}
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full flex items-center justify-center transition-all duration-300"
      >
        {/* Background Ambient Cyber Glow */}
        <div className="absolute inset-4 bg-[#2563eb]/10 rounded-full filter blur-xl group-hover:bg-[#2563eb]/25 transition-all duration-500"></div>

        {/* Outer Tech Ring with CSS rotational animation */}
        <div className="absolute inset-0 rounded-full border border-[#2563eb]/30 border-dashed animate-[spin_50s_linear_infinite] pointer-events-none"></div>
        <div className="absolute inset-8 rounded-full border border-teal-500/15 border-double animate-[spin_25s_linear_infinite_reverse] pointer-events-none"></div>

        {/* Main Shield Hologram Card */}
        <div 
          className="relative bg-gradient-to-b from-[#0f1720]/90 to-[#0b0f14]/95 border border-[#2563eb]/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] group-hover:border-teal-500/50 w-56 h-56 md:w-72 md:h-72 transition-colors duration-500"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Internal Vector SVG Trace of the Authentic Logo (Image 3) */}
          <svg
            viewBox="0 0 200 240"
            className="w-40 h-40 md:w-48 md:h-48 drop-shadow-[0_0_15px_#2563ebCC]"
            aria-hidden="true"
          >
            {/* The Hexagonal Shield Structure */}
            <path
              d="M 100 20 L 170 50 L 170 130 C 170 180 135 210 100 220 C 65 210 30 180 30 130 L 30 50 Z"
              fill="none"
              stroke="#2563eb"
              strokeWidth="8"
              strokeLinejoin="round"
              className="group-hover:stroke-teal-400 transition-colors duration-500"
            />
            
            {/* Hardened Inner Shield Segment */}
            <path
              d="M 100 35 L 155 60 L 155 125 C 155 165 125 190 100 200 C 75 190 45 165 45 125 L 45 60 Z"
              fill="#0f1720"
              stroke="#60a5fa"
              strokeWidth="4"
              strokeLinejoin="round"
              className="opacity-80"
            />

            {/* Electronic Circuit Roots branching down */}
            {/* Center trunk */}
            <line x1="100" y1="65" x2="100" y2="150" stroke="#00F0FF" strokeWidth="4" className="animate-pulse" />
            <circle cx="100" cy="65" r="4.5" fill="#00F0FF" />

            {/* Left root branch 1 */}
            <path
              d="M 100 100 L 75 120 L 75 165 L 55 185"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Left node terminal connector */}
            <circle cx="55" cy="185" r="5" fill="#00F0FF" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="55" cy="185" r="3.5" fill="#00F0FF" />

            {/* Left branch 2 (closer to center) */}
            <path
              d="M 100 125 L 85 140 L 85 185"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="85" cy="185" r="3.5" fill="#60a5fa" />

            {/* Right root branch 1 */}
            <path
              d="M 100 100 L 125 120 L 125 165 L 145 185"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right node terminal connector */}
            <circle cx="145" cy="185" r="5" fill="#00F0FF" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="145" cy="185" r="3.5" fill="#00F0FF" />

            {/* Right branch 2 (closer to center) */}
            <path
              d="M 100 125 L 115 140 L 115 185"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="115" cy="185" r="3.5" fill="#60a5fa" />

            {/* Center trunk root end */}
            <path
              d="M 100 150 L 100 195"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="195" r="4.5" fill="#00F0FF" />
          </svg>

          {/* Interactive Floating Label with standard depth */}
          <div 
            className="mt-4 text-center select-none"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="text-white font-display font-black tracking-widest text-xs uppercase group-hover:text-teal-400 transition-colors">
              SHADOW ROOT
            </div>
            <div className="text-[9px] font-mono tracking-widest text-[#60a5fa] uppercase mt-1">
              SECURITY TECHNOLOGIES
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
