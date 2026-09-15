"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { AuthLayout, FieldBox, AuthButton } from "@/components/ui/auth-section-1";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${backendUrl}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.detail || "Failed to create account");
      } else {
        toast.success("Account created successfully!");
        
        // Auto sign-in
        const signinRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signinRes?.error) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/sign-in");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Maple Intranet as an Employee"
      showSocial={true}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldBox
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <FieldBox
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

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
        
        <FieldBox
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          required
        />

        <AuthButton isLoading={isLoading}>
          Create account
        </AuthButton>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-black/60 dark:text-white/50">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-brand-teal-deep hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
