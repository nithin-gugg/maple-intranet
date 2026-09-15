import { TopNav } from "@/components/layout/top-nav";
import { MainContent } from "./main-content";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;
  
  let needsOnboarding = false;

  if (token) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profile/sync`;
      console.log("Fetching profile from:", url);
      const res = await fetch(url, {
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
