"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, SignInButton, useAuth } from "@clerk/nextjs";
import { Search, Bell, Settings as SettingsIcon, ChevronDown, HelpCircle, Share2, CheckCheck, Loader2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { toast } from "sonner";

export function TopNav() {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

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
      toast('New Announcement', {
        description: lastMessage.data.title,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/announcements'
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
      const token = await getToken();
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
      const token = await getToken();
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
  ];

  const workspaces = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Apps", href: "/apps" },
    { name: "AI Assistant", href: "/ai" },
  ];

  const adminLinks = [
    { name: "Admin Dashboard", href: "/admin/analytics" },
    { name: "Manage Documents", href: "/admin/documents" },
    { name: "Manage Courses", href: "/admin/courses" },
  ];

  const NavItem = ({ title, links }: { title: string, links?: {name: string, href: string}[] }) => {
    // If no links, it's just a top level text/link (like Home)
    if (!links) {
      const isActive = pathname === "/";
      return (
        <Link href="/" className={cn("text-white font-semibold text-sm pb-1", isActive && "border-b-2 border-white")}>
          {title}
        </Link>
      );
    }
    
    return (
      <div className="group relative">
        <button suppressHydrationWarning className="flex items-center gap-1 text-white text-sm font-semibold hover:text-gray-200 py-2">
          {title} <ChevronDown className="h-4 w-4" />
        </button>
        <div className="absolute left-0 top-full hidden w-48 flex-col bg-white shadow-lg border border-gray-200 rounded-md py-1 group-hover:flex z-50">
          {links.map(link => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn("px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", pathname.startsWith(link.href) && "bg-gray-50 font-medium text-brand-teal")}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex flex-col w-full flex-shrink-0 z-50 transition-all duration-300",
        isHomePage && !isScrolled
          ? "bg-transparent"
          : "bg-[#1a2530]/100 backdrop-blur-md shadow-lg border-b border-white/10"
      )}
    >
      {/* Top Black Bar */}
      <div className="flex h-14 md:h-12 items-center justify-between px-4 md:px-6 gap-2 md:gap-4">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="hidden sm:flex items-center text-white font-semibold text-xs md:text-sm whitespace-nowrap">
          Maple Learning Solutions
        </div>
        
        {/* Search - Desktop */}
        <div className="relative hidden md:flex w-full max-w-lg items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-500" />
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search this site"
            className="h-8 w-full rounded-sm bg-white pl-9 pr-4 text-sm text-black outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>

        {/* Mobile Spacer if Search is hidden */}
        <div className="flex-1 md:hidden"></div>

        <div className="flex items-center gap-2 md:gap-4 text-white">
          <button suppressHydrationWarning className="hidden sm:block hover:text-gray-300 transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          <Link href="/settings" className="hidden sm:block hover:text-gray-300 transition-colors">
            <SettingsIcon className="h-5 w-5" />
          </Link>
          <button suppressHydrationWarning className="hidden sm:block hover:text-gray-300 transition-colors">
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
                            {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7"
                }
              }}
            />
          ) : (
            <SignInButton>
              <button suppressHydrationWarning className="text-sm font-semibold bg-brand-green text-black px-3 py-1.5 rounded hover:bg-brand-teal transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Second Banner Bar */}
      <div className="flex flex-col justify-end bg-transparent h-14 md:h-15 px-4 md:px-6 relative overflow-visible">
        <div className="flex items-center gap-4 md:gap-8 pb-2 md:pb-3 mt-auto relative z-10">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
            THE HUB
          </h1>
          
          <div className="hidden md:flex items-center gap-6 ml-4">
            <NavItem title="Home" />
            <NavItem title="Company Resources" links={companyResources} />
            <NavItem title="Employee Resources" links={employeeResources} />
            <NavItem title="Workspaces & Teams" links={workspaces} />
            {isAdmin && (
              <NavItem title="Admin" links={adminLinks} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-[#1a2530] border-t border-white/10 shadow-xl overflow-y-auto max-h-[calc(100vh-100px)]">
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
              <Link href="/" className="text-white font-semibold py-2 border-b border-white/10">Home</Link>
              
              <div className="py-2 border-b border-white/10">
                <div className="text-white font-semibold mb-2">Company Resources</div>
                <div className="flex flex-col pl-4 gap-2">
                  {companyResources.map(link => (
                    <Link key={link.name} href={link.href} className="text-gray-300 text-sm py-1">{link.name}</Link>
                  ))}
                </div>
              </div>

              <div className="py-2 border-b border-white/10">
                <div className="text-white font-semibold mb-2">Employee Resources</div>
                <div className="flex flex-col pl-4 gap-2">
                  {employeeResources.map(link => (
                    <Link key={link.name} href={link.href} className="text-gray-300 text-sm py-1">{link.name}</Link>
                  ))}
                </div>
              </div>

              <div className="py-2 border-b border-white/10">
                <div className="text-white font-semibold mb-2">Workspaces & Teams</div>
                <div className="flex flex-col pl-4 gap-2">
                  {workspaces.map(link => (
                    <Link key={link.name} href={link.href} className="text-gray-300 text-sm py-1">{link.name}</Link>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="py-2 border-b border-white/10">
                  <div className="text-white font-semibold mb-2">Admin</div>
                  <div className="flex flex-col pl-4 gap-2">
                    {adminLinks.map(link => (
                      <Link key={link.name} href={link.href} className="text-gray-300 text-sm py-1">{link.name}</Link>
                    ))}
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
