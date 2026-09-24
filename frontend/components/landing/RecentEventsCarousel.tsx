"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight } from "lucide-react";
import AuroraBackground from "../ui/aurora-background";

interface Event {
  title: string;
  date: string;
  desc: string;
  img: string;
}

interface RecentEventsCarouselProps {
  events: Event[];
}

export function RecentEventsCarousel({ events }: RecentEventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPlaying]);

  return (
    <AuroraBackground>
    <section className="py-8 md:py-12 px-0 overflow-hidden relative min-h-screen flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-row justify-between items-center mb-6 md:mb-8 w-full">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-xl truncate mr-4">
            Recent Events
          </h2>
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0 relative z-30">
            <button 
              suppressHydrationWarning
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
            </button>
            <button 
              suppressHydrationWarning
              onClick={() => { prevSlide(); }}
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Previous event"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              suppressHydrationWarning
              onClick={() => { nextSlide(); }}
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Next event"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Track */}
      <div 
        className="relative w-full h-[400px] md:h-[450px]"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
        onMouseLeave={() => resetTimer()}
      >
        {events.map((event, index) => {
          let offset = index - currentIndex;
          if (offset < -events.length / 2) offset += events.length;
          if (offset > events.length / 2) offset -= events.length;

          // Base styles for hidden items
          let left = "50%";
          let transform = "translateX(-50%) scale(0.8)";
          let opacity = 0;
          let zIndex = 0;
          let pointerEvents = "none";

          if (offset === 0) {
            left = "50%";
            transform = "translateX(-50%) scale(1)";
            opacity = 1;
            zIndex = 20;
            pointerEvents = "auto";
          } else if (offset === -1) {
            left = "0%";
            transform = "translateX(-65%) scale(0.85)";
            opacity = 0.6;
            zIndex = 10;
            pointerEvents = "auto";
          } else if (offset === 1) {
            left = "100%";
            transform = "translateX(-35%) scale(0.85)";
            opacity = 0.6;
            zIndex = 10;
            pointerEvents = "auto";
          }

          return (
            <div 
              key={index}
              onClick={() => {
                if (offset === -1) { prevSlide(); }
                if (offset === 1) { nextSlide(); }
              }}
              className="absolute top-0 w-[85vw] md:w-[55vw] max-w-[850px] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                left,
                transform,
                opacity,
                zIndex,
                pointerEvents: pointerEvents as any,
              }}
            >
              <div className={`w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl group border border-white/10 ${offset !== 0 ? 'cursor-pointer' : ''}`}>
                <img 
                  src={event.img} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Neutral Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end w-full md:w-3/4">
                  <span className="inline-block text-white/80 font-bold tracking-wider text-xs md:text-sm mb-2 uppercase">
                    {event.date}
                  </span>
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-lg mb-6 line-clamp-3 max-w-2xl font-light">
                    {event.desc}
                  </p>
                  
                  <div>
                    {/* <button className="flex items-center text-white font-semibold group-hover:text-brand-green transition-colors text-lg">
                      View Event <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </section>
    </AuroraBackground>
  );
}
