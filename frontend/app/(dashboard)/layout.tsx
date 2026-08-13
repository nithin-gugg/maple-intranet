import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { MainContent } from "./main-content";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authState = await auth();
  const token = await authState.getToken();
  
  let needsOnboarding = false;

  if (token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile/sync`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store" // ensure we don't cache stale onboarding states
      });
      if (res.ok) {
        const profile = await res.json();
        if (!profile.onboarding_completed) {
          needsOnboarding = true;
        }
      }
    } catch (e) {
      console.error("Failed to sync profile:", e);
    }
  }
  
  if (needsOnboarding) {
    redirect("/onboarding");
  }
  return (
    <div className="flex h-screen overflow-hidden bg-surface-soft">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
