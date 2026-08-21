"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight, HeartPulse, CalendarDays, Stethoscope,
  FileBox, User, Building, Heart, GraduationCap,
  BookOpen, Folder, BriefcaseMedical, CheckCircle2,
  Search, MapPin, SearchCode, Megaphone, ThumbsUp, Smile,
  HelpCircle, BarChart, Mail, CreditCard, Star
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AITrendingNews } from "@/components/home/AITrendingNews";
import { useUser } from "@clerk/nextjs";

const CalendarWidget = dynamic(() => import("@/components/CalendarWidget"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-canvas animate-pulse rounded-xl" />
});

export function LandingPage({ isPublic = false, isLoggedIn = false }: { isPublic?: boolean, isLoggedIn?: boolean }) {
  const { user } = useUser();
  const firstName = user?.firstName || "Guest";

  const [directoryStaff, setDirectoryStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/employees`);
        const data = await res.json();
        setDirectoryStaff(data || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchEmployees();
  }, []);

  const resources = [
    { name: "Benefits", icon: HeartPulse },
    { name: "Payroll", icon: FileBox },
    { name: "Time Off", icon: CalendarDays },
    { name: "Policies & Procedures", icon: BookOpen },
    { name: "Learning & Training", icon: GraduationCap },
    { name: "IT Help Desk", icon: SearchCode },
    { name: "Forms & Resources", icon: Folder },
    { name: "Health & Wellness", icon: Heart },
    { name: "Employee Directory", icon: User },
  ];

  const heroLinks = [
    { name: "Helpdesk", icon: SearchCode, color: "bg-green-600" },
    { name: "Directory", icon: User, color: "bg-slate-600" },
    { name: "Expenses", icon: CalendarDays, color: "bg-slate-500" },
    { name: "Reports", icon: BarChart, color: "bg-yellow-500" },
    { name: "Newsletter", icon: Mail, color: "bg-slate-500" },
    { name: "Benefits", icon: HeartPulse, color: "bg-red-400" },
    { name: "FAQs", icon: HelpCircle, color: "bg-orange-500" },
    { name: "Training", icon: Star, color: "bg-green-500" },
  ];

  const staff = [
    { name: "Luis Ponce", role: "Customer Success", dept: "Customer Success", location: "Vancouver", phone: "650-414-3605", email: "luis@maple.com", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop" },
    { name: "Mariam Black", role: "Accounting Manager", dept: "Operations", location: "Not available", phone: "650-414-3605", email: "mblack@maple.com", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
    { name: "John Smith", role: "Support", dept: "Support", location: "Not available", phone: "650-414-3605", email: "js@maple.com", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" },
    { name: "Sabina Saatgareeva", role: "Product Marketing Manager", dept: "Marketing", location: "HQ", phone: "650-414-3605", email: "sabina@maple.com", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* HERO SECTION */}
      <section className="relative bg-[#001e2b] text-white pt-20 pb-20 overflow-hidden z-0">
        {/* Geometric Background Patterns */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Top Left Geometry */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-90">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-green/80 rounded-b-full mix-blend-screen"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-teal-600/60 rounded-tl-full mix-blend-screen"></div>
            <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-[#001e2b] rounded-full border-[16px] border-brand-green/80"></div>
          </div>
          {/* Bottom Right Geometry */}
          <div className="absolute -bottom-48 -right-48 w-[700px] h-[700px] opacity-90">
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-teal-600/40 rounded-l-full mix-blend-screen"></div>
            <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-brand-green/80 rounded-full mix-blend-screen"></div>
            <div className="absolute top-1/2 right-1/2 w-24 h-24 bg-[#001e2b] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-500/80 rounded-tr-full mix-blend-screen"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-10 mt-10">
            Welcome, {firstName}!
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search Forms & Templates"
              className="w-full bg-white text-slate-900 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-green shadow-lg"
              suppressHydrationWarning
            />
          </div>

          {/* Circular Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {heroLinks.map((link, i) => (
              <button key={i} suppressHydrationWarning className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg backdrop-blur-sm">
                  <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN GRID: NEWS & RESOURCES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: News */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2">
              <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">News & Updates</h2>
            </div>

            {/* The actual AI Trending News Widget */}
            <div className="mt-6">
              <AITrendingNews />
            </div>

            {/* Calendar Widget */}
            <div className="mt-8">
              <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2 mb-6">
                <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Company Calendar</h2>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[400px] overflow-auto">
                <CalendarWidget />
              </div>
            </div>
          </div>

          {/* Right Column: Resources */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2">
              <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Resources</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {resources.map((res, i) => (
                <button key={i} className="flex flex-col items-center justify-center p-4 bg-slate-800 text-white rounded-xl hover:bg-brand-green hover:text-black transition-all duration-200 shadow-sm group">
                  <res.icon className="h-8 w-8 mb-3 opacity-80 group-hover:opacity-100" />
                  <span className="text-xs font-semibold text-center leading-tight">{res.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STAFF DIRECTORY SECTION */}
      <section className="bg-white border-y border-slate-200 py-16 mb-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center justify-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight uppercase mb-4">Staff Directory</h2>
            <div className="w-24 h-1.5 bg-brand-green rounded-full"></div>
          </div>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto space-y-4 mb-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-4 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            </div>
            <div className="flex gap-4">
              <select className="bg-slate-800 text-white rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none appearance-none cursor-pointer hover:bg-slate-700">
                <option>Location</option>
                <option>Vancouver</option>
                <option>HQ</option>
              </select>
              <select className="bg-slate-800 text-white rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none appearance-none cursor-pointer hover:bg-slate-700">
                <option>Department</option>
                <option>Marketing</option>
                <option>Operations</option>
              </select>
            </div>
          </div>

          {/* Staff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {loadingStaff ? (
              <div className="col-span-full py-12 text-center text-slate-500">Loading directory...</div>
            ) : directoryStaff.slice(0, 4).map((emp, i) => {
              const name = `${emp.user?.first_name || ""} ${emp.user?.last_name || ""}`.trim() || "Unknown";
              const role = emp.designation || "Employee";
              const dept = emp.department?.name || "No Department";
              const location = emp.location || "Headquarters";
              const img = emp.user?.profile_image_url || `https://ui-avatars.com/api/?name=${emp.user?.first_name}+${emp.user?.last_name}&background=random`;

              return (
                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="flex items-center gap-4 mb-6">
                    {img ? (
                      <img src={img} alt={name} className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-800 text-brand-green flex items-center justify-center font-bold text-xl">
                        {name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{name}</h4>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">{role}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-slate-400">Department</span>
                        <span className="font-medium text-slate-700 line-clamp-1">{dept}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-slate-400">Office Location</span>
                        <span className="font-medium text-slate-700 line-clamp-1">{location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SHOUT-OUTS & QUICK POLL */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Shout-outs */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2 mb-6">
              <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Shout-Outs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shout Out Card 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <p className="text-sm text-slate-600 mb-4">
                  <span className="font-bold text-slate-900">Sabina Saatgareeva</span> recognized <span className="font-bold text-slate-900">Mariam Black</span> on Aug 07
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <img src={staff[3].img} className="w-8 h-8 rounded-full" alt="Sabina" />
                  <span className="text-xl">🎉</span>
                  <img src={staff[1].img} className="w-8 h-8 rounded-full" alt="Mariam" />
                </div>
                <p className="text-sm text-slate-700 italic">
                  "Thank you for stepping in to support the care team during an especially busy week. Your positivity and teamwork made a real difference!"
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green transition-colors">
                    <ThumbsUp className="w-4 h-4" /> (0)
                  </button>
                </div>
              </div>

              {/* Shout Out Card 2 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <p className="text-sm text-slate-600 mb-4">
                  <span className="font-bold text-slate-900">Sabina Saatgareeva</span> recognized <span className="font-bold text-slate-900">John Smith</span> on Sep 29
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <img src={staff[3].img} className="w-8 h-8 rounded-full" alt="Sabina" />
                  <span className="text-xl">🤩</span>
                  <img src={staff[2].img} className="w-8 h-8 rounded-full" alt="John" />
                </div>
                <p className="text-sm text-slate-700 italic">
                  "John went above and beyond to help a patient and their family navigate their care options. Thank you for putting patients first!"
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green transition-colors">
                    <ThumbsUp className="w-4 h-4" /> (0)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-brand-green hover:text-slate-900 transition-colors">
                Give Praise
              </button>
            </div>
          </div>

          {/* Quick Poll */}
          <div>
            <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2 mb-6">
              <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Quick Poll</h2>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-800 p-4 text-right">
                <span className="text-xs font-medium text-slate-300">0 votes • 3 days left</span>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-slate-900 mb-6">How satisfied are you with our intranet?</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😍 Very satisfied</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😊 Satisfied</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😐 Neutral</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😠 Dissatisfied</span>
                  </label>
                </div>
                <div className="mt-8 flex justify-end">
                  <button className="bg-slate-900 text-white px-8 py-2 rounded-full text-sm font-semibold hover:bg-brand-green hover:text-slate-900 transition-colors">
                    Vote
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-slate-400 py-8 border-t border-brand-green/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm mb-4 md:mb-0">
            &copy; 2026 Maple Learning Solutions
          </div>
          <div className="text-sm">
            Intranet contact: <a href="mailto:support@maple.com" className="text-brand-green hover:underline">support@maple.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
