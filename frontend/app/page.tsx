import { LandingPage } from "@/components/landing/LandingPage";
import { TopNav } from "@/components/layout/top-nav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;
  
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
