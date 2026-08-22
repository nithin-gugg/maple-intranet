import { LandingPage } from "@/components/landing/LandingPage";
import { TopNav } from "@/components/layout/top-nav";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const authState = await auth();
  const token = await authState.getToken();
  
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50">
      <div className="absolute top-0 left-0 right-0 z-50">
        <TopNav />
      </div>
      <div id="main-scroll-container" className="flex-1 overflow-auto h-full">
        <LandingPage isPublic={true} isLoggedIn={!!token} />
      </div>
    </div>
  );
}
