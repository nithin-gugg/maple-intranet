"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Cpu, ArrowRight, ExternalLink } from "lucide-react";
import { NewsCarouselSkeleton } from "./NewsCarouselSkeleton";
import Image from "next/image";

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
}

export function AITrendingNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/news/ai?limit=8`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.status === "success" && data.articles) {
        setArticles(data.articles);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("News fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  }, [articles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  }, [articles.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isHovered && articles.length > 1) {
      timerRef.current = setInterval(nextSlide, 6000);
    }
  }, [isHovered, articles.length, nextSlide]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer, currentIndex]);

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) {
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-diffHours, 'hour');
      }
      if (diffDays < 7) {
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-diffDays, 'day');
      }
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    } catch {
      return "Recently";
    }
  };

  if (loading) return <NewsCarouselSkeleton />;

  if (error || articles.length === 0) {
    return (
      <section className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-5 font-semibold text-ink flex items-center gap-2">
            <Cpu className="h-5 w-5 text-brand-teal" />
            AI & Technology Trends
          </h2>
        </div>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
            <Cpu className="h-8 w-8 text-brand-teal/50" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No latest news available</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Our technology feed is temporarily unavailable or refreshing. Please check back later for the latest updates.
          </p>
        </div>
      </section>
    );
  }

  const article = articles[currentIndex];

  return (
    <section 
      className="bg-canvas rounded-xl border border-hairline p-6 shadow-sm flex flex-col relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-6 z-10">
        <h2 className="text-heading-5 font-semibold text-ink flex items-center gap-2">
          <Cpu className="h-5 w-5 text-brand-teal" />
          AI & Technology Trends
        </h2>
      </div>

      <div className="flex-1 min-h-[300px] flex flex-col lg:flex-row gap-6 lg:gap-8 z-10">
        {/* Image Container */}
        <div className="w-full lg:w-2/5 shrink-0 relative group rounded-xl overflow-hidden bg-surface flex items-center justify-center h-48 lg:h-auto min-h-[200px]">
          {article.image && !imageErrors[currentIndex] ? (
            <img 
              src={article.image} 
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageErrors(prev => ({ ...prev, [currentIndex]: true }))}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-teal-deep to-brand-green-dark p-6 text-center">
              <Cpu className="h-12 w-12 text-white/50 mb-3" />
              <div className="text-white/80 font-semibold uppercase tracking-widest text-xs">AI & Technology</div>
            </div>
          )}
          {/* Overlay gradient for dark mode aesthetics */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden pointer-events-none"></div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div>
            <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider text-brand-teal bg-brand-teal/10 mb-3">
              Trending
            </span>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-xl lg:text-2xl font-bold text-ink group-hover:text-brand-teal transition-colors line-clamp-2 leading-tight">
                {article.title}
              </h3>
            </a>
          </div>
          
          <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed">
            {article.description || "Click to read the full article on the publisher's website."}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-brand-teal-light">{article.source}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-brand-teal transition-colors"
            >
              Read Article
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-hairline z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={prevSlide}
            className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center hover:bg-surface hover:text-brand-teal transition-colors"
            aria-label="Previous article"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center hover:bg-surface hover:text-brand-teal transition-colors"
            aria-label="Next article"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-1.5">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to article ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-brand-teal" : "w-2 bg-surface hover:bg-brand-teal/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
