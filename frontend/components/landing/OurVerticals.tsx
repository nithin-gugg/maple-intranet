"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/immutability, @next/next/no-img-element */

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, ArrowRight as ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const verticals = [
  {
    id: "maple-learning-solutions",
    label: "VERTICAL 01",
    title: "Maple Learning Solutions",
    description: "AI-powered eLearning company in India & UAE, building custom learning content and digital training programs for global workforces.",
    image: "/maple.webp",
    href: "/verticals/maple-learning-solutions"
  },
  {
    id: "lxdguild",
    label: "VERTICAL 02",
    title: "LXDGUILD & Academy",
    description: "India's largest L&D community with 8000+ followers, connecting learning experience designers and running academy programs.",
    image: "/lxdguild.webp",
    href: "/verticals/lxdguild"
  },
  {
    id: "maple-web-works",
    label: "VERTICAL 03",
    title: "Maple Web Works",
    description: "Modern, high-performance web design and development for brands that need a fast, polished digital presence.",
    image: "/mapleweb.webp",
    href: "/verticals/maple-web-works"
  }
];

export function OurVerticals() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const DURATION = 7000;
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const requestRef = useRef<number | undefined>(undefined);
  
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

  const updateProgress = useCallback((time: number) => {
    if (lastTimeRef.current === undefined) {
      lastTimeRef.current = time;
    }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Pause if user prefers reduced motion, hovers, or tab is hidden
    const shouldPause = isPaused || document.visibilityState === "hidden" || prefersReducedMotion;

    if (!shouldPause) {
      progressRef.current += (deltaTime / DURATION) * 100;
      
      if (progressRef.current >= 100) {
        setActiveIndex((prev) => (prev + 1) % verticals.length);
        progressRef.current = 0;
      }
      setProgress(progressRef.current);
    }
    
    requestRef.current = requestAnimationFrame(updateProgress);
  }, [isPaused, prefersReducedMotion]);

  useEffect(() => {
    lastTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateProgress]);

  const changeSlide = (index: number) => {
    setActiveIndex(index);
    progressRef.current = 0;
    setProgress(0);
  };

  const handleNext = () => changeSlide((activeIndex + 1) % verticals.length);
  const handlePrev = () => changeSlide((activeIndex - 1 + verticals.length) % verticals.length);

  const activeVertical = verticals[activeIndex];

  return (
    <section className="py-16 text-white border-t border-[#37474f]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
            <h2 className="text-3xl font-bold tracking-tight text-black uppercase">Our Verticals</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrev} 
              aria-label="Previous vertical"
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-brand-green hover:text-black transition-colors duration-200 shadow-sm"
              suppressHydrationWarning
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext} 
              aria-label="Next vertical"
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-brand-green hover:text-black transition-colors duration-200 shadow-sm"
              suppressHydrationWarning
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Card */}
        <div 
          className="bg-[#263238] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* Image Section */}
            <div className="w-full md:w-[55%] aspect-video md:aspect-auto relative overflow-hidden bg-[#1f2937]">
              {verticals.map((vertical, index) => (
                <div 
                  key={vertical.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-in-out origin-center",
                    activeIndex === index 
                      ? "opacity-100 scale-100 z-10" 
                      : "opacity-0 scale-105 z-0 pointer-events-none"
                  )}
                >
                  <img 
                    src={vertical.image} 
                    alt={`${vertical.label} vertical representation`} 
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle gradient overlay to blend with the dark card */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#263238] opacity-0 md:opacity-100"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#263238] to-transparent opacity-100 md:opacity-0"></div>
                </div>
              ))}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-[45%] py-12 px-8 lg:py-16 lg:px-12 flex flex-col justify-center relative min-h-[500px]">
              {verticals.map((vertical, index) => (
                <div 
                  key={vertical.id}
                  className={cn(
                    "absolute inset-0 py-12 px-8 lg:py-16 lg:px-12 flex flex-col justify-center transition-all duration-500 ease-in-out",
                    activeIndex === index 
                      ? "opacity-100 translate-x-0 z-10" 
                      : "opacity-0 translate-x-8 z-0 pointer-events-none"
                  )}
                >
                  <div className="inline-block px-3 py-1 mb-6 rounded-full bg-brand-green/20 border border-brand-green/30 text-brand-green text-xs font-bold tracking-widest uppercase w-max">
                    {vertical.label}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
                    {vertical.title}
                  </h3>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    {vertical.description}
                  </p>
                  <div className="mt-auto">
                    <Link 
                      href={vertical.href}
                      className="inline-flex items-center gap-2 bg-brand-green text-black px-6 py-2.5 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-brand-green/10 w-max"
                    >
                      Know More <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Progress */}
        
      </div>
    </section>
  );
}
