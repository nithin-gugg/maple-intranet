import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OnboardingComplete() {
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 py-12">
      <div className="h-20 w-20 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      
      <h1 className="text-4xl font-heading font-bold text-ink mb-4">
        You're all set!
      </h1>
      <p className="text-lg text-slate-500 mb-8 max-w-md">
        Your Maple profile is ready. Welcome to the Maple Intranet.
      </p>
      
      <a 
        href="/dashboard"
        className="inline-flex items-center justify-center px-8 py-3 bg-brand-teal-deep text-white font-medium rounded-lg hover:bg-brand-teal transition-colors shadow-sm"
      >
        Go to Dashboard
        <ArrowRight className="ml-2 h-5 w-5" />
      </a>
    </div>
  );
}
