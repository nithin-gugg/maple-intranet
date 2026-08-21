"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/employees`);
        const data = await res.json();
        setEmployees(data || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const name = `${emp.user?.first_name || ""} ${emp.user?.last_name || ""}`.trim();
    const dept = emp.department?.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           dept.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-lg font-heading tracking-tight text-ink">Employee Directory</h1>
        <p className="mt-2 text-subtitle text-slate-500">Find and connect with your colleagues across the organization.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-canvas p-4 rounded-lg border border-hairline shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, role, or department..."
            className="h-11 w-full rounded-md border border-input bg-surface pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline-strong rounded-md hover:bg-surface-soft transition-colors text-sm font-medium">
            <Filter className="h-4 w-4" />
            Department
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-hairline-strong rounded-md hover:bg-surface-soft transition-colors text-sm font-medium">
            <Filter className="h-4 w-4" />
            Location
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading directory...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">No employees found.</div>
        ) : filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-canvas rounded-lg border border-hairline overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6 flex flex-col items-center text-center relative">
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-brand-green border-2 border-white"></div>
              
              <img
                src={employee.user?.profile_image_url || `https://ui-avatars.com/api/?name=${employee.user?.first_name}+${employee.user?.last_name}&background=random`}
                alt={employee.user?.first_name}
                className="h-24 w-24 rounded-full object-cover border-4 border-surface shadow-sm mb-4"
              />
              <h3 className="text-heading-5 text-ink">{employee.user?.first_name} {employee.user?.last_name}</h3>
              <p className="text-brand-green-dark text-sm font-medium mt-1">{employee.designation || "Employee"}</p>
              
              <div className="mt-4 w-full pt-4 border-t border-hairline-soft flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span>{employee.department?.name || "No Department"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{employee.location || "Headquarters"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 truncate">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{employee.user?.email}</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-soft p-3 text-center border-t border-hairline">
              <button className="text-brand-green-dark text-sm font-medium hover:underline">
                View Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
