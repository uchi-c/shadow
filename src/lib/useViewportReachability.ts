import { useState, useEffect } from "react";

export interface ReachabilityMetrics {
  width: number;
  isMobile: boolean;
  scale: number;
  bottomOffset: string | number;
  leftOffset: string | number;
  isScrolling: boolean;
}

export default function useViewportReachability(): ReachabilityMetrics {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [scrollY, setScrollY] = useState(typeof window !== "undefined" ? window.scrollY : 0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let resizeTimer: number;
    const handleResize = () => {
      // Use requestAnimationFrame for high-performance responsive tracking
      cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
      });
    };

    let scrollTimer: number | null = null;
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);

      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
      
      scrollTimer = window.setTimeout(() => {
        setIsScrolling(false);
      }, 800); // Reset scroll resting state after 800ms
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
      }
    };
  }, []);

  const isMobile = width < 640;

// Ergonomic calculations to maximize reachability
  let scale = 1.0;
  let bottomOffset: string | number = 24; // Default container bottom offset px
  let leftOffset: string | number = 24;   // Default container left offset px

  if (isMobile) {
    // Base scale on mobile is 0.90 to preserve design proportion
    scale = 0.90;
    
    // When actively scrolling, we gently scale the reachability anchor slightly upwards
    // and pull it slightly inward (to the high-comfort thumb sweep zone)
    // Using dvb (dynamic viewport block) and dvi (dynamic viewport inline) coordinates
    // targeting the lower 15% ergonomically.
    if (isScrolling) {
      scale = 0.98;
      bottomOffset = "clamp(16px, 7.5dvb, 80px)"; // Kept well within lower 15% region
      leftOffset = "clamp(16px, 6.5dvi, 64px)";
    } else {
      bottomOffset = "clamp(14px, 5.5dvb, 64px)"; // Kept well within lower ~10% region
      leftOffset = "clamp(14px, 5.5dvi, 48px)";
    }
  }

  return {
    width,
    isMobile,
    scale,
    bottomOffset,
    leftOffset,
    isScrolling,
  };
}
