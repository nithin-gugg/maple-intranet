import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const backendUrl = rawUrl.replace(/\/$/, "");

        try {
          const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email.trim(),
              password: credentials.password.trim(),
            }),
            headers: { "Content-Type": "application/json" }
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error(`Backend login failed. Status: ${res.status}, Body: ${errText}`);
            return null;
          }

          const data = await res.json();
          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.first_name} ${data.user.last_name}`.trim(),
              accessToken: data.access_token,
              roles: data.user.roles,
              onboarding_completed: data.user.onboarding_completed
            };
          }
        } catch (error) {
          console.error("Auth fetch error:", error);
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.roles = user.roles;
        token.onboarding_completed = user.onboarding_completed;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.roles = (token.roles as string[]) || [];
      session.user.onboarding_completed = token.onboarding_completed as boolean;
      return session;
    }
  },
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
