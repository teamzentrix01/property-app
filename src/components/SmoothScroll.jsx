"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }) {
  const progressBarRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Enable native smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    // Clean up any stale classes from previous implementation
    document.documentElement.classList.remove("scroll-motion-ready", "lenis");

    // Real-time glowing crimson scroll progress bar
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          const progress =
            totalScroll > 0
              ? Math.min(1, Math.max(0, window.scrollY / totalScroll))
              : 0;

          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${progress})`;
          }

          setShowBackToTop(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver for subtle scroll entrance animations
    // Note: All elements are 100% visible by default in CSS.
    // This only adds a subtle polish entrance as elements enter the viewport.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let observer = null;
    let timer = null;

    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("scroll-animated");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: "140px 0px 40px 0px",
          threshold: 0.05,
        }
      );

      const attachObserver = () => {
        const elements = document.querySelectorAll(
          "main > section, main > div > section, main article, .stagger-card-item"
        );
        elements.forEach((el) => {
          if (!el.classList.contains("scroll-animated")) {
            observer.observe(el);
          }
        });
      };

      attachObserver();
      timer = setTimeout(attachObserver, 200);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="scroll-progress-container" aria-hidden="true">
        <div ref={progressBarRef} className="scroll-progress-bar" />
      </div>
      {children}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#c41920] text-white shadow-xl hover:bg-[#a5141a] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#c41920] focus:ring-offset-2"
          aria-label="Back to top"
          title="Back to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </>
  );
}

