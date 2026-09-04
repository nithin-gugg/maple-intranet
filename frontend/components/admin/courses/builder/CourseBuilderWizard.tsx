"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

// Placeholder imports for steps
import CourseDetailsStep from "./steps/CourseDetailsStep";
import CourseCurriculumStep from "./steps/CourseCurriculumStep";
import CourseSettingsStep from "./steps/CourseSettingsStep";
import CourseCompletionStep from "./steps/CourseCompletionStep";
import CourseReviewStep from "./steps/CourseReviewStep";

const STEPS = [
  { id: 1, name: "Details" },
  { id: 2, name: "Curriculum" },
  { id: 3, name: "Settings" },
  { id: 4, name: "Completion" },
  { id: 5, name: "Review & Publish" },
];

export default function CourseBuilderWizard({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/native-courses/courses/${courseId}/hierarchy`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load course", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center p-8 text-red-500">Course not found.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-8 bg-surface">
      {/* Header & Stepper */}
      <div className="bg-canvas border-b border-hairline px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="text-slate-500 hover:text-ink transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-heading font-semibold text-ink">Create Course</h1>
              <p className="text-sm text-slate-500">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/courses")}>Save Draft</Button>
            {currentStep === STEPS.length ? (
              <Button className="bg-brand-green hover:bg-brand-green/90 text-white">Publish Course</Button>
            ) : (
              <Button onClick={handleNext} className="bg-brand-green hover:bg-brand-green/90 text-white">Next Step</Button>
            )}
          </div>
        </div>

        {/* Stepper UI */}
        <div className="flex items-center justify-between relative max-w-4xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-canvas px-4">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive ? "bg-brand-green text-white ring-4 ring-brand-green/20" : 
                    isCompleted ? "bg-brand-green text-white" : 
                    "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </button>
                <span className={`text-xs font-medium ${isActive ? "text-brand-green" : isCompleted ? "text-ink" : "text-slate-400"}`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-5xl mx-auto h-full">
          {currentStep === 1 && <CourseDetailsStep course={course} onUpdate={fetchCourse} onNext={handleNext} />}
          {currentStep === 2 && <CourseCurriculumStep course={course} onUpdate={fetchCourse} />}
          {currentStep === 3 && <CourseSettingsStep course={course} onUpdate={fetchCourse} />}
          {currentStep === 4 && <CourseCompletionStep course={course} onUpdate={fetchCourse} />}
          {currentStep === 5 && <CourseReviewStep course={course} onUpdate={fetchCourse} />}
        </div>
      </div>
    </div>
  );
}
