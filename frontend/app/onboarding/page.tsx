"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import NameStep from "@/components/onboarding/NameStep";
import WorkInfoStep from "@/components/onboarding/WorkInfoStep";
import EmployeeIdStep from "@/components/onboarding/EmployeeIdStep";
import PersonalDetailsStep from "@/components/onboarding/PersonalDetailsStep";
import ProfileReviewStep from "@/components/onboarding/ProfileReviewStep";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";

export type OnboardingData = {
  first_name: string;
  last_name: string;
  department_id: number | null;
  department_name: string;
  designation: string;
  employee_id: string;
  date_of_birth: string;
  joining_date: string;
};

export default function OnboardingPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 means loading/init
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    first_name: "",
    last_name: "",
    department_id: null,
    department_name: "",
    designation: "",
    employee_id: "",
    date_of_birth: "",
    joining_date: "",
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const initOnboarding = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profile/sync`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const profile = await res.json();
          if (profile.onboarding_completed) {
            router.push("/dashboard");
            return;
          }
          
          setData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            department_id: profile.department_id || null,
            department_name: "", // Will be set in WorkInfoStep
            designation: profile.designation || "",
            employee_id: profile.employee_id || "",
            date_of_birth: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
            joining_date: profile.joining_date ? profile.joining_date.split("T")[0] : "",
          });
          setCurrentStep(profile.onboarding_step || 1);
        }
      } catch (e) {
        console.error("Failed to sync profile", e);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initOnboarding();
  }, [isLoaded, isSignedIn, getToken, router]);

  const saveProgress = async (nextStep: number, partialData: Partial<OnboardingData>) => {
    setIsSaving(true);
    try {
      const token = await getToken();
      
      const payload: any = { step: nextStep };
      if (partialData.first_name !== undefined) payload.first_name = partialData.first_name;
      if (partialData.last_name !== undefined) payload.last_name = partialData.last_name;
      if (partialData.department_id !== undefined) payload.department_id = partialData.department_id;
      if (partialData.designation !== undefined) payload.designation = partialData.designation;
      if (partialData.employee_id !== undefined) payload.employee_id = partialData.employee_id;
      
      if (partialData.date_of_birth) payload.date_of_birth = new Date(partialData.date_of_birth).toISOString();
      if (partialData.joining_date) payload.joining_date = new Date(partialData.joining_date).toISOString();

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profile/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      setData(prev => ({ ...prev, ...partialData }));
      setCurrentStep(nextStep);
    } catch (e) {
      console.error("Failed to save progress", e);
      alert("We couldn't save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profile/onboarding/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (user) {
        await user.reload();
      }
      setCurrentStep(7); // Show success screen
    } catch (e) {
      console.error("Failed to complete onboarding", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitializing || currentStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={() => saveProgress(2, {})} isSaving={isSaving} />;
      case 2:
        return <NameStep data={data} onNext={(d) => saveProgress(3, d)} isSaving={isSaving} />;
      case 3:
        return <WorkInfoStep data={data} onNext={(d) => saveProgress(4, d)} onBack={() => setCurrentStep(2)} isSaving={isSaving} tokenGetter={getToken} />;
      case 4:
        return <EmployeeIdStep data={data} onNext={(d) => saveProgress(5, d)} onBack={() => setCurrentStep(3)} isSaving={isSaving} />;
      case 5:
        return <PersonalDetailsStep data={data} onNext={(d) => saveProgress(6, d)} onBack={() => setCurrentStep(4)} isSaving={isSaving} />;
      case 6:
        return <ProfileReviewStep data={data} onComplete={completeOnboarding} onEditStep={setCurrentStep} isSaving={isSaving} />;
      case 7:
        return <OnboardingComplete />;
      default:
        return <WelcomeStep onNext={() => saveProgress(2, {})} isSaving={isSaving} />;
    }
  };

  const totalSteps = 6;

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={totalSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
}
