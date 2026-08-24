import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Check onboarding status for logged-in users
  if (userId) {
    const metadata = sessionClaims?.metadata as { onboarding_completed?: boolean } | undefined;
    const isOnboarded = metadata?.onboarding_completed === true;
    
    // User is signed in but hasn't completed onboarding, and is not currently on the onboarding page
    if (!isOnboarded && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return Response.redirect(new URL('/onboarding', request.url));
    }
    
    // User is signed in and HAS completed onboarding, but tries to visit the onboarding page
    if (isOnboarded && request.nextUrl.pathname === '/onboarding') {
      return Response.redirect(new URL('/dashboard', request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
