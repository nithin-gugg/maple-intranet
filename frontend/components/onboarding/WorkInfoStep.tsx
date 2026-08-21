import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isSaving: boolean;
  tokenGetter: () => Promise<string | null>;
}

export default function WorkInfoStep({ data, onNext, onBack, isSaving, tokenGetter }: Props) {
  const [departmentId, setDepartmentId] = useState<number | "">(data.department_id || "");
  const [departmentName, setDepartmentName] = useState(data.department_name || "");
  const [designation, setDesignation] = useState(data.designation || "");
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = await tokenGetter();
        // Fallback to internal api if needed, assuming /api/v1/departments exists and is public/protected
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/departments/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setDepartments(json);
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setIsLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, [tokenGetter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (departmentId !== "" && designation.trim()) {
      const selectedDept = departments.find(d => d.id === Number(departmentId));
      onNext({ 
        department_id: Number(departmentId), 
        department_name: selectedDept ? selectedDept.name : "",
        designation 
      });
    }
  };

  const isValid = departmentId !== "" && designation.trim().length > 0;

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} disabled={isSaving} className="self-start text-slate-400 hover:text-ink mb-6 transition-colors flex items-center text-sm font-medium">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      <h2 className="text-3xl font-heading font-bold text-ink mb-3">
        Tell us about your role
      </h2>
      <p className="text-slate-500 mb-8">
        This helps us set up your workspace correctly.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
              Department
            </label>
            <div className="relative">
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isLoadingDepts}
                className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all appearance-none"
              >
                <option value="" disabled>Select a department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {isLoadingDepts && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-slate-700 mb-1">
              Designation / Title
            </label>
            <input
              id="designation"
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              placeholder="e.g. Software Engineer"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={!isValid || isSaving || isLoadingDepts}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-brand-teal-deep text-white font-medium rounded-lg hover:bg-brand-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Continue
          {!isSaving && <ArrowRight className="ml-2 h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
