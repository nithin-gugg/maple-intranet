import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  onNext: () => void;
  isSaving: boolean;
}

export default function WelcomeStep({ onNext, isSaving }: Props) {
  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-heading font-bold text-ink mb-4">
        Welcome to Maple 👋
      </h1>
      <p className="text-lg text-slate-500 mb-8">
        Let's get your profile set up. It will only take a minute.
      </p>
      
      <button 
        onClick={onNext}
        disabled={isSaving}
        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-brand-green text-brand-teal-deep font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-70"
      >
        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        Get Started
        {!isSaving && <ArrowRight className="ml-2 h-5 w-5" />}
      </button>
    </div>
  );
}
