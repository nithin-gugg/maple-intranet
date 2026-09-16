"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { AuthLayout, FieldBox, AuthButton } from "@/components/ui/auth-section-1";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Maple Intranet account"
      showSocial={true}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldBox
          label="Official Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <FieldBox
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <div className="flex justify-end pt-2">
          <Link href="/forgot-password" className="text-sm text-brand-teal-deep hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <AuthButton isLoading={isLoading}>
          Sign In
        </AuthButton>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-black/60 dark:text-white/50">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-brand-teal-deep hover:underline">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
}
