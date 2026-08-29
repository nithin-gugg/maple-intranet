"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-red-50 text-red-500 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Permission Forbidden</h1>
      <p className="text-gray-500 mb-8 max-w-md text-center">
        You don't have permission to access this page. This area is restricted to authorized users.
      </p>
      <Link href="/">
        <Button size="lg" className="bg-brand-green hover:bg-brand-teal text-white">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
