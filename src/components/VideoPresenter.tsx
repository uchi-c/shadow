import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, FileText, CheckCircle2 } from "lucide-react";

export default function VideoPresenter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Simulated fallback plexus canvas animation if video source blocks or fails
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || 600);
    let height = (canvas.height = canvas.offsetHeight || 340);

    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(10, 5, 21, 0.4)";
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      ctx.strokeStyle = "rgba(108, 0, 255, 0.15)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0 ? "#00F0FF" : "#6c00ff";
        ctx.shadowColor = "#00F0FF";
        ctx.shadowBlur = i % 8 === 0 ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update native elements on control triggers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback simulated plays
        setIsPlaying(true);
      });
    }
  };

  const handleMuteUnmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().then(() => {
      setIsPlaying(true);
    });
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime;
    const dur = video.duration || 1;
    setProgress((current / dur) * 100);
  };

  const handleMetadataLoaded = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const seekPercentage = parseFloat(e.target.value);
    const time = (seekPercentage / 100) * (video.duration || 1);
    video.currentTime = time;
    setProgress(seekPercentage);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error", err);
      });
    }
  };

  // Keyboard navigation shortcuts (Space to play, M to mute)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      handlePlayPause();
    } else if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      handleMuteUnmute();
    } else if (e.key.toLowerCase() === "f") {
      e.preventDefault();
      handleFullscreen();
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto font-sans">
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Shadow Root Corporate Presentation Video Player. Interactive hotkeys: Space to play, M to toggle mute, F for fullscreen mode"
        className="relative aspect-video rounded-2xl overflow-hidden border border-[#6C00FF55] bg-[#05020a] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C00FF]"
      >
        {/* Dynamic Plexus fallback background or layered ambient cyber glow */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* The Native HTML5 Video Element with backup source */}
        <video
          ref={videoRef}
          src="https://assets.mixkit.co/videos/preview/mixkit-cyber-security-hologram-effect-of-a-server-room-and-a-padlock-43283-large.mp4"
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleMetadataLoaded}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-40 transition-opacity duration-300 ${
            videoError ? "opacity-0" : "group-hover:opacity-60"
          }`}
        />

        {/* Standard Overlay Graphics: Video Text "Building Digital Trust for the Next Era of Institutions" */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 pointer-events-none z-10">
          
          {/* Logo Brand Watermark */}
          <div className="flex items-center space-x-3 text-white self-start">
            <div className="bg-[#6C00FF] p-2 rounded-lg flex items-center justify-center border border-[#6C00FF] shadow-[0_0_10px_#6C00FF]">
              <svg viewBox="0 0 100 100" className="w-4 h-4" fill="currentColor">
                <path d="M50 10 L85 25 L85 65 C85 85 50 95 50 95 C50 95 15 85 15 65 L15 25 Z" />
              </svg>
            </div>
            <div className="font-display font-bold text-xs tracking-widest uppercase">
              SHADOW ROOT <span className="text-[#A370FF]">TECHNOLOGIES</span>
            </div>
          </div>

          {/* Main Overlay Slogan from actual uploaded video */}
          <div className="my-auto max-w-xl md:pl-6 leading-tight select-none">
            <h2 className="font-display font-black text-white text-3xl md:text-4xl lg:text-5xl tracking-tight text-glow-purple drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-[1.15]">
              Building Digital Trust for the <br />
              <span className="text-[#A370FF] relative inline-block">
                Next Era of Institutions.
                <span className="absolute bottom-1 left-0 w-full h-1 bg-[#6C00FF]"></span>
              </span>
            </h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-mono tracking-widest uppercase mt-4 block">
              ZAMBIAN INNOVATION • DEFENSE SECURITY SYSTEMS
            </p>
          </div>

          {/* Operational Watermark Label */}
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>OFFICIAL MISSION OVERVIEW</span>
            <span>LUSAKA MAIN OFFICE</span>
          </div>

        </div>

        {/* Custom Video Control Rail overlay (visible on focus/hover) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent p-4 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 z-20">
          
          {/* Progress Seek Slider */}
          <div className="flex items-center space-x-3 w-full font-sans">
            <input
              type="range"
              min="0"
              max="105"
              value={progress}
              onChange={handleVideoSeek}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#6C00FF] focus:outline-none"
              aria-label="Seek video duration progress bar"
            />
          </div>

          {/* Core Controls Row */}
          <div className="flex items-center justify-between text-white font-mono text-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="hover:text-[#6C00FF] transition-all p-1"
                aria-label={isPlaying ? "Pause corporate video presentation" : "Play corporate video presentation"}
              >
                {isPlaying ? <Pause className="w-5 h-5 shrink-0" /> : <Play className="w-5 h-5 shrink-0" />}
              </button>

              <button
                onClick={handleRestart}
                className="hover:text-[#6C00FF] transition-all p-1"
                aria-label="Restart video playback"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={handleMuteUnmute}
                className="hover:text-[#6C00FF] transition-all p-1"
                aria-label={isMuted ? "Unmute video presentation audio" : "Mute video presentation audio"}
              >
                {isMuted ? <VolumeX className="w-5 h-5 shrink-0 text-red-400" /> : <Volume2 className="w-5 h-5 shrink-0" />}
              </button>

              <span className="text-[10px] text-slate-400">
                {isPlaying ? "PLAYING LOOP" : "PAUSED"}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Show Transcript Toggle */}
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`flex items-center space-x-1 px-2.5 py-1 text-[10px] rounded border transition-all ${
                  showTranscript
                    ? "bg-[#6C00FF]/30 border-[#6C00FF] text-[#A370FF]"
                    : "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
                aria-pressed={showTranscript}
                aria-label="Toggle visual transcript of the corporate slide presentation"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Transcript / CC</span>
              </button>

              <button
                onClick={handleFullscreen}
                className="hover:text-[#6C00FF] transition-all p-1"
                aria-label="Toggle full-screen presentation mode"
              >
                <Maximize className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Under-player Transcript Overlay for WCAG AA compliance (Accessibility) */}
      {showTranscript && (
        <div 
          className="bg-[#120826]/75 border border-[#6C00FF33] rounded-xl p-5 text-slate-200 text-xs leading-relaxed max-w-4xl"
          aria-live="polite"
        >
          <div className="flex items-center space-x-2 text-white font-mono font-bold text-xs uppercase mb-3 border-b border-white/5 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ACCESSIBLE AUDIO-VISUAL TRANSCRIPT REPORT (WCAG AA compliant)</span>
          </div>
          <div className="space-y-2 font-sans pl-1">
            <p>
              <strong>[Visual Scene]:</strong> High-tech geometric network plexus lines connecting across a dark cosmic blue map of Southern African server routes. A silver and violet digital shield symbol, of Shadow Root Security Technologies, glows brightly.
            </p>
            <p>
              <strong>[Intro text reads]:</strong> <em>&quot;Building Digital Trust for the Next Era of Institutions.&quot;</em>
            </p>
            <p>
              <strong>[Presenter Voiceover Synthesis (simulated text description)]:</strong> &quot;Welcome to Shadow Root Security Technologies. Based in Lusaka, Zambia, our team specializes in hardening the defense architecture of companies, schools, and civic non-governmental organizations. We engineer robust defenses, custom full-stack solutions, and launch secure AI chatbot integrations under strict access parameters. Trust begins where risk ends.&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
