"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { getToken, isLoaded } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    employee_id: "",
    role_name: "",
    department_id: "",
    designation: "",
    date_of_birth: "",
    joining_date: ""
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    const fetchData = async () => {
      try {
        const token = await getToken();
        
        // Fetch departments
        const deptRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/departments/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (deptRes.ok) setDepartments(await deptRes.json());
        
        // Fetch profile
        const profRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profile/sync`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profile = await profRes.json();
          setFormData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            email: profile.email || "",
            employee_id: profile.employee_id || "",
            role_name: profile.roles?.[0] || "",
            department_id: profile.department_id?.toString() || "",
            designation: profile.designation || "",
            date_of_birth: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
            joining_date: profile.joining_date ? profile.joining_date.split("T")[0] : ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isLoaded, getToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = await getToken();
      
      const payload: any = {
        step: 7, // Not used for validation anymore, just arbitrary
        first_name: formData.first_name,
        last_name: formData.last_name,
        employee_id: formData.employee_id,
        department_id: formData.department_id ? Number(formData.department_id) : null,
        designation: formData.designation,
      };
      
      if (formData.date_of_birth) payload.date_of_birth = new Date(formData.date_of_birth).toISOString();
      if (formData.joining_date) payload.joining_date = new Date(formData.joining_date).toISOString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profile/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Profile updated successfully.");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("We couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-ink mb-2">Account Settings</h1>
        <p className="text-slate-500">Manage your profile and personal information.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Personal Information */}
        <section className="bg-white rounded-xl border border-hairline shadow-subtle p-6">
          <h2 className="text-lg font-semibold text-ink mb-6 pb-4 border-b border-hairline">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-xs text-slate-400 font-normal ml-2">(Managed by Maple Learning Solutions)</span></label>
              <input type="email" value={formData.email} disabled className="w-full px-4 py-2 rounded-md border border-hairline bg-slate-100 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
          </div>
        </section>
        
        {/* Work Information */}
        <section className="bg-white rounded-xl border border-hairline shadow-subtle p-6">
          <h2 className="text-lg font-semibold text-ink mb-6 pb-4 border-b border-hairline">Work Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
              <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} required className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select name="department_id" value={formData.department_id} onChange={handleChange} required className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green">
                <option value="" disabled>Select a department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Joining</label>
              <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2.5 bg-brand-green text-brand-teal-deep font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
