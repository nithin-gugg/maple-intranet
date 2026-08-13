import { LandingPage } from "@/components/landing/LandingPage";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const authState = await auth();
  const token = await authState.getToken();
  
  return <LandingPage isPublic={true} isLoggedIn={!!token} />;
}
