"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight, HeartPulse, CalendarDays, Stethoscope,
  FileBox, User, Building, Heart, GraduationCap,
  BookOpen, Folder, BriefcaseMedical, CheckCircle2,
  Search, MapPin, SearchCode, Megaphone, ThumbsUp, Smile,
  HelpCircle, BarChart, Mail, CreditCard, Star, Target, Rocket
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AITrendingNews } from "@/components/home/AITrendingNews";
import { useUser } from "@clerk/nextjs";
import { Smartphone, CheckSquare, FileText, PlayCircle, Activity, Layout, ChevronUp } from "lucide-react";
import { DockNav, type DockNavItem } from "@/components/ui/dock-nav";
import AuroraBackground from "@/components/ui/aurora-background";
import { OurVerticals } from "@/components/landing/OurVerticals";

const HeroCarousel = () => {
  const images = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2000&q=80"
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={src} alt="Hero background" className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2530]/90 via-[#1a2530]/50 to-[#1f2937]/90" />
    </div>
  );
};

const CalendarWidget = dynamic(() => import("@/components/CalendarWidget"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-canvas animate-pulse rounded-xl" />
});

const DEFAULT_DOCK_ITEMS: DockNavItem[] = [
  {
    label: "Hubstaff",
    iconSrc: "/1.webp",
    alt: "Hubstaff app icon",
  },
  {
    label: "MapleBot",
    iconSrc: "/2.webp",
    alt: "MapleBot app icon",
  },  
  {
    label: "Documents",
    iconSrc: "/3.webp",
    alt: "Slack app icon",
  },
  {
    label: "Confluence",
    iconSrc: "/4.webp",
    alt: "Loom app icon",
  },
  {
    label: "Courses",
    iconSrc: "/5.webp",
    alt: "Courses app icon",
  },
  {
    label: "Trello",
    iconSrc: "/6.webp",
    alt: "Trello app icon",
  },
  {
    label: "Calendar",
    iconSrc: "/7.webp",
    alt: "Calendar app icon",
  },
  {
    label: "GMail",
    iconSrc: "/8.webp",
    alt: "Gmail app icon",
  }
];

export function LandingPage({ isPublic = false, isLoggedIn = false }: { isPublic?: boolean, isLoggedIn?: boolean }) {
  const { user } = useUser();
  const firstName = user?.firstName || "Guest";

  const [directoryStaff, setDirectoryStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [activeResourceTab, setActiveResourceTab] = useState("Company & News");

  const resourceTabs = ["Business Resources", "Employee Center", "Departments & Teams", "Company & News"];
  const topResourcesContent = [
    {
      title: "Apps & Tools",
      desc: "See all our enterprise applications and tools at a glance. These apps will help you be more productive and stay in the loop with your team and other business units.",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Staff Directory",
      desc: "Explore our comprehensive Staff Directory to easily find contact information, departments, and roles of all team members. Stay connected and collaborate effectively.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Forms & Templates",
      desc: "Access frequently used forms and templates including expense reports, leave requests, project proposals, and performance evaluations, to streamline your workflow and stay organized.",
      img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Policies & Procedures",
      desc: "Looking for a one-stop shop for all our policies and procedures? Here, you'll find things like the employee handbook, safety protocols, and compliance guidelines.",
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
    }
  ];

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

  const recentEvents = [
    {
      title: "4th Anniversary",
      date: "Oct 12, 2026",
      desc: "Celebrating four years of growth, innovation, and teamwork at Maple.",
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Independence Day",
      date: "Jul 4, 2026",
      desc: "Annual company picnic and celebrations.",
      img: "https://images.unsplash.com/photo-1531686264889-56fdcabd163f?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "New Space Opening",
      date: "May 20, 2026",
      desc: "Grand opening of our new collaborative hub and workspace.",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Tech Conference",
      date: "Mar 15, 2026",
      desc: "Showcasing our latest product updates at the annual tech expo.",
      img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Annual Retreat",
      date: "Jan 10, 2026",
      desc: "Company-wide strategic planning and team building in the mountains.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* HERO SECTION */}
      <section className="relative h-[650px] flex items-center justify-center text-white overflow-hidden z-0">
        <HeroCarousel />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-20">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
            Welcome to Maple<br/>Learning Solutions!
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            Stay connected with company news, upcoming events, helpful resources, and everything you need for a day.
          </p>
        </div>

        {/* Floating Bottom Widget */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-max max-w-[95%] hidden md:block">
          <DockNav items={DEFAULT_DOCK_ITEMS} className="bg-[#2c3e50]/80 backdrop-blur-md border border-white/10 rounded-full p-2 shadow-2xl" />
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
          <div className="lg:col-span-4 flex flex-col h-full space-y-8">
            <div>
              <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2">
                <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Resources</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-8">
                {resources.map((res, i) => (
                  <button suppressHydrationWarning key={i} className="flex flex-col items-center justify-center p-4 bg-slate-800 text-white rounded-xl hover:bg-brand-green hover:text-black transition-all duration-200 shadow-sm group">
                    <res.icon className="h-8 w-8 mb-3 opacity-80 group-hover:opacity-100" />
                    <span className="text-xs font-semibold text-center leading-tight">{res.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Announcements Widget */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2 mb-6">
                <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Announcements</h2>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-1 overflow-y-auto space-y-4 min-h-[300px]">
                {/* Placeholder Announcements */}
                <div className="p-4 bg-brand-green/10 rounded-lg border border-brand-green/20">
                  <span className="text-xs font-bold text-brand-green uppercase tracking-wide">Important</span>
                  <h3 className="font-bold text-slate-900 mt-1 mb-2">New Healthcare Benefits Enrollment</h3>
                  <p className="text-sm text-slate-600">Open enrollment for the new healthcare plans starts next Monday. Please review the updated documentation in the HR portal.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Notice</span>
                  <h3 className="font-bold text-slate-900 mt-1 mb-2">Scheduled IT Maintenance</h3>
                  <p className="text-sm text-slate-600">The main server will undergo maintenance this Saturday from 2:00 AM to 5:00 AM EST. Expect minor disruptions.</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Action Required</span>
                  <h3 className="font-bold text-slate-900 mt-1 mb-2">Quarterly Compliance Training</h3>
                  <p className="text-sm text-slate-600">Please complete your Q3 compliance training modules by the end of the month. Links are available in your email.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* ABOUT US SECTION */}
      <AuroraBackground className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-left">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-brand-green/20 border border-brand-green/30 text-brand-green text-sm font-semibold tracking-wide uppercase">
              Who We Are
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              About Us
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              At Maple Learning Solutions, we are dedicated to transforming the way organizations 
              approach learning and development. Our comprehensive intranet platform connects 
              your team with essential resources, company news, and seamless communication tools 
              to foster a culture of continuous growth and collaboration.
            </p>
            <button suppressHydrationWarning className="bg-brand-green text-black px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-brand-green/20">
              Know More
            </button>
          </div>
          <div className="flex-1 flex justify-center md:justify-end h-full">
            <div className="relative w-full max-w-[550px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-brand-green/10 z-10 mix-blend-overlay"></div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                alt="Our team collaborating" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* VISION & MISSION CARDS */}
        <div className="max-w-7xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Vision Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-10 hover:bg-white/10 transition-colors duration-300 group">
            <div className="w-14 h-14 bg-brand-green/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7 text-brand-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-slate-300 leading-relaxed">
              To be the premier digital workspace that empowers every employee to reach their 
              full potential, driving innovation and excellence across the entire organization 
              through seamless connectivity and shared knowledge.
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-10 hover:bg-white/10 transition-colors duration-300 group">
            <div className="w-14 h-14 bg-brand-green/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="w-7 h-7 text-brand-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-slate-300 leading-relaxed">
              We strive to provide a robust, intuitive, and engaging intranet platform that 
              simplifies access to critical resources, fosters transparent communication, 
              and cultivates a thriving, collaborative company culture.
            </p>
          </div>
        </div>
      

      {/* TOP RESOURCES SECTION */}
      
      <section className="py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center justify-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Top Resources</h2>
            <div className="w-16 h-1 bg-brand-green rounded-full"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 border-b border-white/10 mb-8 pb-4">
            {resourceTabs.map(tab => (
              <button suppressHydrationWarning
                key={tab}
                onClick={() => setActiveResourceTab(tab)}
                className={`px-2 py-2 text-sm font-semibold transition-colors ${activeResourceTab === tab ? 'text-white border-b-2 border-white' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topResourcesContent.map((resource, i) => (
              <Link key={i} href="/documents" className="bg-[#37474f] rounded-lg overflow-hidden hover:bg-[#455a64] transition-colors border border-white/5 flex flex-col h-full shadow-lg group">
                <div className="h-32 overflow-hidden bg-slate-800">
                  <img src={resource.img} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-lg mb-3">{resource.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{resource.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </AuroraBackground>

      {/* OUR VERTICALS SECTION */}
      <OurVerticals />

      {/* RECENT EVENTS GALLERY */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-6 mb-16">
        <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-2 mb-8">
          <div className="w-1.5 h-8 bg-brand-green rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Recent Events</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Top Row: 2 items, col-span-3 each */}
          {recentEvents.slice(0, 2).map((event, i) => (
            <div key={i} className="md:col-span-3 h-72 rounded-3xl overflow-hidden relative group cursor-pointer bg-[#0f1115] shadow-lg border border-slate-800">
              <img src={event.img} alt={event.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-100" />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
              
              <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col justify-end text-white z-10">
                <span className="inline-flex items-center justify-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold w-max mb-3 border border-white/20">{event.date}</span>
                <h3 className="font-bold text-2xl mb-2 group-hover:text-brand-green transition-colors">{event.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-2 max-w-sm">{event.desc}</p>
              </div>
            </div>
          ))}

          {/* Bottom Row: 3 items, col-span-2 each */}
          {recentEvents.slice(2, 5).map((event, i) => (
            <div key={i + 2} className="md:col-span-2 h-72 rounded-3xl overflow-hidden relative group cursor-pointer bg-[#0f1115] shadow-lg border border-slate-800">
              <img src={event.img} alt={event.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-100" />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
              
              <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col justify-end text-white z-10">
                <span className="inline-flex items-center justify-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold w-max mb-3 border border-white/20">{event.date}</span>
                <h3 className="font-bold text-lg mb-2 group-hover:text-brand-green transition-colors">{event.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{event.desc}</p>
              </div>
            </div>
          ))}
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
                suppressHydrationWarning
                type="text"
                placeholder="Search employees..."
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-4 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            </div>
            <div className="flex gap-4">
              <select suppressHydrationWarning className="bg-slate-800 text-white rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none appearance-none cursor-pointer hover:bg-slate-700">
                <option>Location</option>
                <option>Vancouver</option>
                <option>HQ</option>
              </select>
              <select suppressHydrationWarning className="bg-slate-800 text-white rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none appearance-none cursor-pointer hover:bg-slate-700">
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
                  <button suppressHydrationWarning className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green transition-colors">
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
                  <button suppressHydrationWarning className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green transition-colors">
                    <ThumbsUp className="w-4 h-4" /> (0)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button suppressHydrationWarning className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-brand-green hover:text-slate-900 transition-colors">
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
                    <input suppressHydrationWarning type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😍 Very satisfied</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input suppressHydrationWarning type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😊 Satisfied</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input suppressHydrationWarning type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😐 Neutral</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input suppressHydrationWarning type="radio" name="poll" className="w-4 h-4 text-brand-green border-slate-300 focus:ring-brand-green" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">😠 Dissatisfied</span>
                  </label>
                </div>
                <div className="mt-8 flex justify-end">
                  <button suppressHydrationWarning className="bg-slate-900 text-white px-8 py-2 rounded-full text-sm font-semibold hover:bg-brand-green hover:text-slate-900 transition-colors">
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
