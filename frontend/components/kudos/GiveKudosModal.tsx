"use client";

import { useState, useEffect } from "react";
import { X, Search, Star, Loader2, Gift } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GiveKudosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GiveKudosModal({ isOpen, onClose, onSuccess }: GiveKudosModalProps) {
  const { getToken } = useAuth();
  
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [reasons, setReasons] = useState<any[]>([]);
  const [presents, setPresents] = useState<any[]>([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [selectedPresent, setSelectedPresent] = useState<number | null>(null);
  const [stars, setStars] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
      fetchPresents();
      setStep(1);
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isOpen) {
        fetchEmployees(search);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, isOpen]);

  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedReason(null);
    setSelectedPresent(null);
    setStars(0);
    setMessage("");
    setSearch("");
  };

  const fetchReasons = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/kudos/reasons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setReasons(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPresents = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/kudos/presents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPresents(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployees = async (query: string) => {
    setSearching(true);
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/employees/${query ? `?search=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedReason || stars < 1 || stars > 5 || !message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/kudos/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipient_id: selectedEmployee.id,
          reason_id: selectedReason,
          present_id: selectedPresent,
          stars,
          message
        })
      });

      if (res.ok) {
        toast.success(`🎉 Kudos sent successfully to ${selectedEmployee.user?.first_name || 'your teammate'}!`);
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Failed to send Kudos");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-900">Give Kudos</h2>
          <button suppressHydrationWarning onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Who would you like to appreciate?</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Search teammates by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
                />
              </div>

              <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
                {searching ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-brand-green" /></div>
                ) : employees.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No teammates found</p>
                ) : (
                  employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={cn(
                        "w-full flex items-center p-3 rounded-xl transition-all border",
                        selectedEmployee?.id === emp.id 
                          ? "border-brand-green bg-brand-green/5 shadow-sm" 
                          : "border-transparent hover:bg-slate-50"
                      )}
                    >
                      <img src={emp.user?.profile_image_url || `https://ui-avatars.com/api/?name=${emp.user?.first_name}+${emp.user?.last_name}`} alt={emp.user?.first_name} className="w-10 h-10 rounded-full mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{emp.user?.first_name} {emp.user?.last_name}</p>
                        <p className="text-xs text-slate-500">{emp.designation || 'Employee'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  suppressHydrationWarning
                  disabled={!selectedEmployee}
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-brand-green hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <img src={selectedEmployee?.user?.profile_image_url || `https://ui-avatars.com/api/?name=${selectedEmployee?.user?.first_name}+${selectedEmployee?.user?.last_name}`} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Appreciating</p>
                  <p className="text-xs text-slate-500">{selectedEmployee?.user?.first_name} {selectedEmployee?.user?.last_name}</p>
                </div>
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-brand-teal hover:underline font-medium">Change</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">Why are you giving Kudos?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {reasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-sm text-center gap-1",
                        selectedReason === reason.id 
                          ? "border-brand-green bg-brand-green/10 text-brand-teal-deep font-semibold" 
                          : "border-slate-200 hover:border-brand-green/50 hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      <span className="text-xl">{reason.icon}</span>
                      <span>{reason.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Write a message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell them what they did that deserves recognition..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green min-h-[100px] resize-none text-sm"
                  maxLength={1000}
                />
                <div className="text-right text-xs text-slate-400 mt-1">{message.length}/1000</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Give Stars</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setStars(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          stars >= star ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-brand-teal" /> Optional Present
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button
                    onClick={() => setSelectedPresent(null)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-full border text-sm transition-all whitespace-nowrap",
                      selectedPresent === null 
                        ? "border-slate-800 bg-slate-800 text-white" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    No Present
                  </button>
                  {presents.map((present) => (
                    <button
                      key={present.id}
                      onClick={() => setSelectedPresent(present.id)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full border text-sm transition-all whitespace-nowrap",
                        selectedPresent === present.id 
                          ? "border-brand-teal bg-brand-teal text-white" 
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {present.icon} {present.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {step === 2 && (
          <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason || stars < 1 || stars > 5 || !message.trim()}
              className="px-6 py-2 bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-[#00c575] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Kudos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
