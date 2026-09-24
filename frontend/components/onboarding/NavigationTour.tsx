"use client";

import React, { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSession } from "next-auth/react";

export function NavigationTour() {
  const { data: session, update: updateSession } = useSession();
  const tourStarted = useRef(false);

  useEffect(() => {
    // Only run once when session is loaded
    if (!session || tourStarted.current) return;

    // Wait until DOM is fully painted
    const timeout = setTimeout(() => {
      const isOnboardingCompleted = session?.user?.onboarding_completed;
      const isTourCompleted = session?.user?.navigation_tour_completed;

      if (isOnboardingCompleted && !isTourCompleted) {
        tourStarted.current = true;
        startNavigationTour(updateSession);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [session, updateSession]);

  return null;
}

export const startNavigationTour = (updateSession?: any) => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(0, 0, 0, 0.7)",
    popoverClass: "maple-driver-popover",
    onDestroyed: async () => {
      try {
        await fetch("/api/v1/profile/onboarding/tour-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (updateSession) {
          await updateSession({ navigation_tour_completed: true });
        }
      } catch (err) {
        console.error("Failed to complete tour", err);
      }
    },
    steps: [
      {
        popover: {
          title: "Welcome to Maple Intranet!",
          description: "Let's take a quick tour to help you get familiar with your new digital workspace."
        }
      },
      {
        element: '[data-tour="nav-home"]',
        popover: {
          title: "Home",
          description: "Click here at any time to return to the main dashboard and access your most important updates.",
          side: "bottom",
          align: "start"
        }
      },
      {
        element: '[data-tour="nav-company-resources"]',
        popover: {
          title: "Company Resources",
          description: "Find company-wide documents, directories, announcements, and important information here.",
          side: "bottom",
          align: "start"
        },
        onHighlightStarted: (element) => {
          // Attempt to open the dropdown using simulating hover or just rely on user interaction
          // In Tailwind group-hover, we can't easily force it, but we can highlight the parent.
        }
      },
      {
        element: '[data-tour="nav-employee-resources"]',
        popover: {
          title: "Employee Resources",
          description: "Access your training materials, courses, leave policies, and HR documents.",
          side: "bottom",
          align: "start"
        }
      },
      {
        element: '[data-tour="hero-primary-cta"]',
        popover: {
          title: "Quick Action",
          description: "Use this button to quickly start or resume your learning journey and access the dashboard.",
          side: "bottom",
          align: "center"
        }
      },
      {
        element: '[data-tour="dock"]',
        popover: {
          title: "Quick Access Dock",
          description: "This floating dock gives you one-click access to your most frequently used tools like your Calendar, Documents, and Profile.",
          side: "top",
          align: "center"
        }
      },
      {
        element: '[data-tour="nav-search"]',
        popover: {
          title: "Global Search",
          description: "Looking for something specific? Search across all documents, people, and resources.",
          side: "bottom",
          align: "end"
        }
      },
      {
        element: () => {
          if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
            return document.querySelector('#more-nav-help') as Element;
          }
          return document.querySelector('[data-tour="nav-help"]') as Element;
        },
        popover: {
          title: "Help & Support",
          description: "Hover here to find admin contact details if you ever need assistance.",
          side: "bottom",
          align: "end"
        },
        onHighlightStarted: (element) => {
          const dropdown = document.getElementById('more-nav-dropdown');
          if (dropdown && window.innerWidth >= 1024 && window.innerWidth < 1280) {
            dropdown.style.display = 'flex';
          }
        },
        onDeselected: (element) => {
          const dropdown = document.getElementById('more-nav-dropdown');
          if (dropdown) {
            dropdown.style.display = '';
          }
        }
      },
      {
        popover: {
          title: "You're all set!",
          description: "Enjoy using Maple Intranet. You can restart this tour anytime from your settings or the dock."
        }
      }
    ]
  });

  driverObj.drive();
};
