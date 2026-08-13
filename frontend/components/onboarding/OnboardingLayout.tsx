import React from "react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  // We don't show progress for step 7 (Success screen)
  const showProgress = currentStep > 0 && currentStep <= totalSteps;
  const progressPercentage = showProgress ? (currentStep / totalSteps) * 100 : 100;

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-12 shrink-0 border-b border-hairline bg-canvas">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-brand-green flex items-center justify-center">
            <span className="text-primary font-bold">M</span>
          </div>
          <span className="text-xl font-bold font-heading text-ink tracking-tight">Maple</span>
        </div>
      </header>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full h-1 bg-surface-hover">
          <div 
            className="h-full bg-brand-green transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>
    </div>
  );
}
