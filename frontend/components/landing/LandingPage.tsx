"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Target, Eye, BookOpen, FileText, ChevronRight, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const CalendarWidget = dynamic(() => import("@/components/CalendarWidget"), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-canvas animate-pulse rounded-xl" />
});

// Mock or fetched courses
const fetchCourses = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/learning/courses`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export function LandingPage({ isPublic = false, isLoggedIn = false }: { isPublic?: boolean, isLoggedIn?: boolean }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeVertical, setActiveVertical] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses().then(data => setCourses(data.slice(0, 3))); // Show top 3
  }, []);

  const verticals = [
    {
      title: "Maple Learning Solutions",
      description: "AI-powered eLearning company in India & UAE, building custom learning content and digital training programs for global workforces.",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "LXDGUILD & Academy",
      description: "India's largest L&D community with 8000+ followers, connecting learning experience designers and running academy programs.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Maple Web Works",
      description: "Modern, high-performance web design and development for brands that need a fast, polished digital presence.",
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const faqs = [
    { q: "How do I enroll in a course?", a: "You can visit the Learning Hub from your dashboard and click 'Get Started' on any available course." },
    { q: "Where can I find HR policies?", a: "All company policies are securely stored in the Documents section." },
    { q: "How is my progress tracked?", a: "Your learning progress is automatically synced with our SCORM engine as you complete modules." }
  ];

  return (
    <div className="bg-surface-soft min-h-screen font-sans selection:bg-brand-teal selection:text-white">
      
      {/* SECTION 1: Hero */}
      <section className="relative overflow-hidden bg-brand-teal-deep text-white py-24 lg:py-32 px-6 lg:px-12 animate-in fade-in duration-700">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-teal rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-green font-medium text-sm mb-4">
            Welcome to
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-tight">
            Maple Learning Solutions
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A centralized space to share knowledge, streamline teamwork, and amplify learning excellence — built for every team, in every region.
          </p>
          
          {isPublic && (
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-brand-green text-brand-teal-deep font-semibold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto px-8 py-4 bg-brand-green text-brand-teal-deep font-semibold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200">
                    Get Started
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-medium rounded-lg transition-all duration-200">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-24">
        
        {/* SECTION 2: About Maple */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="space-y-6">
            <h2 className="text-brand-green font-semibold tracking-wider uppercase text-sm">About Maple</h2>
            <h3 className="text-4xl font-heading font-bold text-ink leading-tight">
              Learning solutions built around real performance.
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              As an eLearning development company with effective learning content designers, we are passionate about creating effective eLearning solutions that focus on improving the skills, behaviour and performance of your workforce and thereby delivering tangible results to your organisation.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-hairline relative h-80">
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop" alt="Team collaborating" className="object-cover w-full h-full" />
          </div>
        </section>

        {/* SECTION 3: Vision & Mission */}
        <section className="bg-white rounded-3xl p-8 lg:p-12 shadow-subtle border border-hairline animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="text-center mb-12">
            <h2 className="text-brand-green font-semibold tracking-wider uppercase text-sm mb-2">Discover Maple</h2>
            <h3 className="text-3xl font-heading font-bold text-ink">Vision & Mission</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-brand-teal" />
              </div>
              <h4 className="text-2xl font-bold text-ink">Our Vision</h4>
              <p className="text-slate-600">To empower organizations worldwide with innovative learning experiences, fostering skill growth, behavioural transformation, and measurable performance outcomes.</p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start"><ChevronRight className="h-5 w-5 text-brand-green shrink-0 mr-2" /> Transform workforce capability with modern learning.</li>
                <li className="flex items-start"><ChevronRight className="h-5 w-5 text-brand-green shrink-0 mr-2" /> Drive digital learning adoption globally.</li>
                <li className="flex items-start"><ChevronRight className="h-5 w-5 text-brand-green shrink-0 mr-2" /> Build future-ready talent through innovation.</li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-accent-orange" />
              </div>
              <h4 className="text-2xl font-bold text-ink">Our Mission</h4>
              <p className="text-slate-600">To deliver impactful eLearning solutions that enhance productivity, build strong capabilities, and enable sustainable growth in organizations of all sizes.</p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start"><ChevronRight className="h-5 w-5 text-brand-green shrink-0 mr-2" /> Deliver measurable learning outcomes.</li>
                <li className="flex items-start"><ChevronRight className="h-5 w-5 text-brand-green shrink-0 mr-2" /> Support continuous training and upskilling.</li>
                <li className="flex items-start"><ChevronRight className="h-5 w-5 text-brand-green shrink-0 mr-2" /> Create accessible and innovative learning ecosystems.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: Our Verticals */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-ink">Our Verticals</h2>
          </div>
          
          <div className="bg-canvas border border-hairline rounded-2xl overflow-hidden shadow-sm">
            <div className="flex overflow-x-auto border-b border-hairline">
              {verticals.map((v, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveVertical(i)}
                  className={`flex-1 py-4 px-6 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeVertical === i 
                      ? "bg-white text-brand-teal-deep border-b-2 border-brand-green" 
                      : "text-slate-500 hover:text-ink hover:bg-white/50"
                  }`}
                >
                  Vertical 0{i + 1}: {v.title.split(" ")[0]}
                </button>
              ))}
            </div>
            
            <div className="p-8 lg:p-12 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in zoom-in-95 duration-300" key={activeVertical}>
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-ink">{verticals[activeVertical].title}</h3>
                  <p className="text-lg text-slate-600">{verticals[activeVertical].description}</p>
                  <button className="inline-flex items-center text-brand-teal font-medium hover:text-brand-teal-deep transition-colors">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
                <div className="h-64 rounded-xl overflow-hidden bg-surface">
                  <img src={verticals[activeVertical].img} alt={verticals[activeVertical].title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Widgets Grid: Courses & Calendar */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* SECTION 5: Courses */}
          <section className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-hairline flex justify-between items-center bg-canvas">
              <h3 className="text-xl font-heading font-bold text-ink flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-teal" /> Featured Courses
              </h3>
              {!isPublic && <Link href="/learning" className="text-sm font-medium text-brand-green hover:underline">View All</Link>}
            </div>
            <div className="p-6 space-y-4 flex-1">
              {courses.length > 0 ? courses.map(course => (
                <div key={course.id} className="p-4 rounded-xl border border-hairline hover:border-brand-teal/30 bg-surface flex items-start gap-4 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-brand-teal/10 flex items-center justify-center mt-1">
                    <PlayCircle className="h-5 w-5 text-brand-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink line-clamp-1">{course.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{course.description || "Learn the essentials."}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                      <span className="flex items-center"><Clock className="mr-1 h-3 w-3" /> Self-paced</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-500 text-sm">No courses available.</div>
              )}
            </div>
          </section>

          {/* SECTION 6: Calendar Widget */}
          <section className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-hairline bg-canvas">
              <h3 className="text-xl font-heading font-bold text-ink">Company Schedule</h3>
            </div>
            <div className="p-4 flex-1 overflow-auto custom-calendar-wrapper">
               {/* Wrapper limits height and scrolls internally */}
               <CalendarWidget />
            </div>
          </section>
        </div>

        {/* SECTION 7: Documents Tabs (Placeholders) */}
        <section className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden">
          <div className="p-6 border-b border-hairline bg-canvas flex justify-between items-center">
             <h3 className="text-xl font-heading font-bold text-ink flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent-purple" /> Important Documents
              </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-xl border border-hairline bg-surface hover:shadow-subtle transition-shadow cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <FileText className="h-8 w-8 text-slate-400 group-hover:text-accent-purple transition-colors" />
                    <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-600 rounded">PDF</span>
                  </div>
                  <h4 className="font-semibold text-ink mb-1">Company Policy 0{i}</h4>
                  <p className="text-sm text-slate-500">Updated recently</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: FAQ's */}
        <section className="max-w-3xl mx-auto py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-ink">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-hairline bg-white rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="font-semibold text-ink">{faq.q}</span>
                  <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${activeFaq === i ? "rotate-90" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 text-slate-600 animate-in fade-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* SECTION 9: Footer */}
      <footer className="bg-brand-teal-deep text-slate-400 py-12 border-t border-brand-teal/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-brand-green flex items-center justify-center">
                <span className="text-brand-teal-deep font-bold">M</span>
              </div>
              <span className="text-xl font-bold font-heading text-white">Maple</span>
            </div>
            <p className="max-w-md">Empowering organizations worldwide with innovative learning experiences.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/learning" className="hover:text-white transition-colors">Learning Hub</Link></li>
              <li><Link href="/documents" className="hover:text-white transition-colors">Documents</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-8 border-t border-white/10 text-sm text-center md:text-left">
          &copy; 2026 Maple Learning Solutions. All rights reserved.
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-calendar-wrapper .fc {
          height: 400px !important;
        }
        .custom-calendar-wrapper .fc-toolbar-title {
          font-size: 1.1rem !important;
        }
      `}} />
    </div>
  );
}
