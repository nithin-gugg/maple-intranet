"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/immutability, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-location-assign-relative-destination, react-hooks/static-components, react/no-unescaped-entities, @typescript-eslint/no-require-imports */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Bell, Settings as SettingsIcon, ChevronDown, HelpCircle, Share2, CheckCheck, Loader2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { startNavigationTour } from "@/components/onboarding/NavigationTour";

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = !!session;
  const user = session?.user;
  const token = session?.accessToken;
  const userId = session?.user?.id;
  const role = session?.user?.roles?.[0]; // Assuming roles is an array
  const isAdmin = session?.user?.roles?.includes("admin");

  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lastMessage } = useWebSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchNotifications();
    }
  }, [isSignedIn]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // First tone
      const osc1 = audioCtx.createOscillator();
      const gainNode1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gainNode1.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc1.connect(gainNode1);
      gainNode1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.5);

      // Second tone
      const osc2 = audioCtx.createOscillator();
      const gainNode2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      gainNode2.gain.setValueAtTime(0, audioCtx.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.15);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc2.connect(gainNode2);
      gainNode2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.1);
      osc2.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    if (lastMessage?.type === 'NEW_ANNOUNCEMENT') {
      const newNotification = {
        id: Date.now(),
        title: "New Announcement",
        message: lastMessage.data.title,
        type: "ANNOUNCEMENT",
        is_read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
      playNotificationSound();
      toast('New Announcement', {
        description: lastMessage.data.title,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/announcements'
        }
      });
    } else if (lastMessage?.type === 'NEW_KUDOS') {
      const newNotification = {
        id: Date.now(),
        title: lastMessage.data.title,
        message: lastMessage.data.message,
        type: "KUDOS",
        is_read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
      playNotificationSound();
      toast('🎉 ' + lastMessage.data.title, {
        description: lastMessage.data.message,
        duration: 8000,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/kudos'
        }
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notifications/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications([]);
        setIsNotificationsOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container") || window;

    const handleScroll = () => {
      const scrollY = (scrollContainer as HTMLElement).scrollTop || window.scrollY;
      setIsScrolled(scrollY > 20);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.match(/^\/learning\/\d+/)) {
    return null;
  }

  const companyResources = [
    { name: "Announcements", href: "/announcements" },
    { name: "Documents", href: "/documents" },
  ];

  const employeeResources = [
    { name: "Learning", href: "/learning" },
    { name: "Employees", href: "/employees" },
    { name: "Calendar", href: "/calendar" },
    { name: "Kudos & Recognition", href: "/kudos" },
  ];

  const workspaces = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Apps", href: "/apps" },
    { name: "AI Assistant", href: "/ai" },
  ];

  const adminLinks = [
    { name: "Admin Dashboard", href: "/admin/analytics" },
    { name: "Course Tracking", href: "/admin/tracking" },
    { name: "Manage Documents", href: "/admin/documents" },
    { name: "Manage Courses", href: "/admin/courses" },
    { name: "Manage Users", href: "/admin/users" },
  ];

  const NavItem = ({ title, links, dataTour }: { title: string, links?: { name: string, href: string }[], dataTour?: string }) => {
    // If no links, it's just a top level text/link (like Home)
    if (!links) {
      const isActive = pathname === "/";
      return (
        <Link href="/" data-tour={dataTour} className={cn(
          "font-semibold text-sm py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#00dc82] after:transition-transform after:duration-300",
          isActive ? "text-[#00dc82] after:scale-x-100 after:origin-bottom-left" : "text-white after:scale-x-0 after:origin-bottom-right hover:text-[#00dc82] hover:after:scale-x-100 hover:after:origin-bottom-left"
        )}>
          {title}
        </Link>
      );
    }

    const isParentActive = links.some(link => pathname.startsWith(link.href));

    return (
      <div className="group relative">
        <button data-tour={dataTour} suppressHydrationWarning className={cn(
          "flex items-center gap-1 text-sm font-semibold py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#00dc82] after:transition-transform after:duration-300",
          isParentActive ? "text-[#00dc82] after:scale-x-100 after:origin-bottom-left" : "text-white after:scale-x-0 after:origin-bottom-right hover:text-[#00dc82] hover:after:scale-x-100 hover:after:origin-bottom-left"
        )}>
          {title} <ChevronDown className="h-4 w-4" />
        </button>
        <div className="absolute left-0 top-full hidden w-48 flex-col bg-white shadow-lg border border-gray-200 rounded-md py-1 group-hover:flex z-50">
          {links.map(link => {
            const isChildActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn("px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", isChildActive && "bg-gray-50 font-medium text-[#00dc82]")}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full flex-shrink-0 relative z-[60] transition-all duration-300",
        isHomePage && !isScrolled
          ? "bg-transparent"
          : "bg-[#1a2530]/100 backdrop-blur-md shadow-lg border-b border-white/10"
      )}
    >
      {/* Single Unified Navbar */}
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">

        {/* Left Side: Mobile Menu, Brand, and Nav Items */}
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            className="lg:hidden text-white p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="whitespace-nowrap relative flex items-center justify-center pt-1">
            <Image
              src="/maple-logo.png"
              alt="Maple Logo"
              width={140}
              height={40}
              className="object-contain h-8 w-auto"
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center gap-4 lg:gap-6">
            <NavItem title="Home" dataTour="nav-home" />
            <NavItem title="Company Resources" links={companyResources} dataTour="nav-company-resources" />
            <NavItem title="Employee Resources" links={employeeResources} dataTour="nav-employee-resources" />
            <NavItem title="Workspaces & Teams" links={workspaces} dataTour="nav-workspaces" />
            {isAdmin && (
              <div className="hidden xl:block">
                <NavItem title="Admin" links={adminLinks} />
              </div>
            )}

            {/* More Menu for 1024px */}
            <div className="hidden lg:block xl:hidden group relative">
              <button suppressHydrationWarning className="whitespace-nowrap flex items-center gap-1 text-sm font-semibold py-1 text-white hover:text-[#00dc82]">
                More <ChevronDown className="h-4 w-4" />
              </button>
              <div id="more-nav-dropdown" className="absolute left-0 top-full hidden w-56 flex-col bg-white shadow-lg border border-gray-200 rounded-md py-2 group-hover:flex z-50">
                {isAdmin && (
                  <>
                    <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin</div>
                    {adminLinks.map(link => (
                      <Link key={link.name} href={link.href} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00dc82]">
                        {link.name}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-gray-100"></div>
                  </>
                )}
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Utilities</div>
                
                <button id="more-nav-help" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00dc82] flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Help
                </button>
                <Link href="/settings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00dc82] flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" /> Settings
                </Link>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00dc82] flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Search and Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Icon for lg (1024px) */}
          <button suppressHydrationWarning className="hidden lg:block xl:hidden text-white hover:text-gray-300 p-1">
            <Search className="h-5 w-5" />
          </button>

          {/* Full Search Bar for xl (1280px+) */}
          <div data-tour="nav-search" className="relative hidden xl:flex w-64 items-center mr-2">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Search this site"
              className="h-8 w-full rounded-md bg-white/10 border border-white/20 pl-9 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#00dc82] focus:bg-white focus:text-black transition-all"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-white">
            <button data-tour="nav-help" id="desktop-nav-help" suppressHydrationWarning className="hidden xl:block hover:text-gray-300 transition-colors relative group">
              <HelpCircle className="h-5 w-5 peer" />
              <div className="absolute right-0 top-full mt-3 w-80 bg-white text-slate-800 text-sm p-5 rounded-xl shadow-2xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-300 z-50 border border-slate-100 cursor-default">
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-l border-t border-slate-100"></div>
                <div className="relative z-10 text-left">
                  <h4 className="font-bold text-slate-900 mb-2 text-base">About Maple Intranet</h4>
                  <p className="mb-3 text-slate-600 leading-relaxed">
                    Maple Intranet provides a complete hub for internal documents, events, training resources, and company updates.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">Contact Admin for Help</p>
                    <a href="mailto:Info@maplelearningsolutions.com" className="text-brand-green font-medium hover:underline text-sm break-all">
                      Info@maplelearningsolutions.com
                    </a>
                  </div>
                </div>
              </div>
            </button>
            <Link href="/settings" className="hidden xl:block hover:text-gray-300 transition-colors">
              <SettingsIcon className="h-5 w-5" />
            </Link>
            <button suppressHydrationWarning className="hidden xl:block hover:text-gray-300 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                suppressHydrationWarning
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative hover:text-gray-300 transition-colors flex items-center justify-center p-1"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 shadow-sm border border-[#1a2530]"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        disabled={isClearing}
                        className="text-xs font-medium text-brand-teal hover:text-brand-teal-dark flex items-center gap-1 transition-colors"
                      >
                        {isClearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                        <Bell className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-100">
                        {notifications.map((notification, idx) => (
                          <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {!isLoaded ? null : isSignedIn ? (
              <div className="flex items-center gap-2">
                <button onClick={() => startNavigationTour()} className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded text-sm transition-colors hidden lg:block whitespace-nowrap font-medium">Guide</button>
                <button onClick={() => require("next-auth/react").signOut()} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors whitespace-nowrap">Sign Out</button>
              </div>
            ) : (
              <Link href="/sign-in" className="text-sm font-semibold bg-brand-green text-black px-3 py-1.5 rounded hover:bg-brand-teal transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[100%] left-0 w-full bg-[#1a2530] border-t border-white/10 shadow-xl overflow-y-auto max-h-[calc(100vh-100px)]">
          <div className="p-4 flex flex-col gap-4">
            {/* Search - Mobile */}
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search this site"
                className="h-10 w-full rounded-md bg-white pl-10 pr-4 text-sm text-black outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/" className={cn("font-semibold py-2 border-b border-white/10 transition-colors", pathname === "/" ? "text-[#00dc82]" : "text-white hover:text-[#00dc82]")}>Home</Link>

              <div className="py-2 border-b border-white/10">
                <div className="text-white font-semibold mb-2">Company Resources</div>
                <div className="flex flex-col pl-4 gap-2">
                  {companyResources.map(link => {
                    const isActive = pathname.startsWith(link.href);
                    return <Link key={link.name} href={link.href} className={cn("text-sm py-1 transition-colors", isActive ? "text-[#00dc82] font-medium" : "text-gray-300 hover:text-[#00dc82]")}>{link.name}</Link>;
                  })}
                </div>
              </div>

              <div className="py-2 border-b border-white/10">
                <div className="text-white font-semibold mb-2">Employee Resources</div>
                <div className="flex flex-col pl-4 gap-2">
                  {employeeResources.map(link => {
                    const isActive = pathname.startsWith(link.href);
                    return <Link key={link.name} href={link.href} className={cn("text-sm py-1 transition-colors", isActive ? "text-[#00dc82] font-medium" : "text-gray-300 hover:text-[#00dc82]")}>{link.name}</Link>;
                  })}
                </div>
              </div>

              <div className="py-2 border-b border-white/10">
                <div className="text-white font-semibold mb-2">Workspaces & Teams</div>
                <div className="flex flex-col pl-4 gap-2">
                  {workspaces.map(link => {
                    const isActive = pathname.startsWith(link.href);
                    return <Link key={link.name} href={link.href} className={cn("text-sm py-1 transition-colors", isActive ? "text-[#00dc82] font-medium" : "text-gray-300 hover:text-[#00dc82]")}>{link.name}</Link>;
                  })}
                </div>
              </div>

              {isAdmin && (
                <div className="py-2 border-b border-white/10">
                  <div className="text-white font-semibold mb-2">Admin</div>
                  <div className="flex flex-col pl-4 gap-2">
                    {adminLinks.map(link => {
                      const isActive = pathname.startsWith(link.href);
                      return <Link key={link.name} href={link.href} className={cn("text-sm py-1 transition-colors", isActive ? "text-[#00dc82] font-medium" : "text-gray-300 hover:text-[#00dc82]")}>{link.name}</Link>;
                    })}
                  </div>
                </div>
              )}

              {/* Mobile Quick Actions */}
              <div className="flex gap-4 pt-4 mt-2 justify-center">
                <button className="text-white flex flex-col items-center gap-1">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-xs">Help</span>
                </button>
                <Link href="/settings" className="text-white flex flex-col items-center gap-1">
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Link>
                <button className="text-white flex flex-col items-center gap-1">
                  <Share2 className="h-5 w-5" />
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
