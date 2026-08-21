import { LandingPage } from "@/components/landing/LandingPage";
import { Sidebar } from "@/components/layout/sidebar";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const authState = await auth();
  const token = await authState.getToken();
  
  if (token) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <LandingPage isPublic={true} isLoggedIn={true} />
        </div>
      </div>
    );
  }

  return <LandingPage isPublic={true} isLoggedIn={false} />;
}
