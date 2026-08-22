"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, ArrowRight as ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const verticals = [
  {
    id: "education",
    label: "EDUCATION",
    title: "Innovative Learning for a Better Tomorrow",
    description: "We partner with educational institutions and corporate academies to deliver engaging, scalable, and impactful learning experiences through cutting-edge eLearning solutions, LMS platforms, and immersive technologies.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    href: "/verticals/education"
  },
  {
    id: "finance",
    label: "FINANCE",
    title: "Secure & Scalable Financial Solutions",
    description: "Empowering financial institutions with robust, compliant, and scalable digital solutions that streamline operations, enhance customer experience, and ensure regulatory adherence.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    href: "/verticals/finance"
  },
  {
    id: "manufacturing",
    label: "MANUFACTURING",
    title: "Driving Industry 4.0 Transformation",
    description: "Accelerate your manufacturing capabilities with our advanced digital solutions, IoT integrations, and supply chain optimizations designed to maximize efficiency and minimize downtime.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    href: "/verticals/manufacturing"
  },
  {
    id: "healthcare",
    label: "HEALTHCARE",
    title: "Next-Generation Digital Healthcare",
    description: "Transform patient care and hospital management with our secure, compliant digital healthcare platforms, telemedicine solutions, and data-driven insights.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    href: "/verticals/healthcare"
  },
  {
    id: "public-sector",
    label: "PUBLIC SECTOR",
    title: "Empowering Modern E-Governance",
    description: "Delivering secure, scalable, and accessible digital platforms for government agencies to enhance citizen engagement, streamline public services, and ensure data integrity.",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    href: "/verticals/public-sector"
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
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext} 
              aria-label="Next vertical"
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-brand-green hover:text-black transition-colors duration-200 shadow-sm"
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
