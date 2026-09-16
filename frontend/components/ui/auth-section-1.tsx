"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { GrainGradient } from "@paper-design/shaders-react";
import type { ReactNode } from "react";
import { Monitor } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  showSocial = false
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  showSocial?: boolean;
}) {
  return (
    <section className="min-h-screen bg-white p-3 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[800px] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="flex min-h-[760px] items-start justify-center rounded-md border border-black/20 bg-white px-6 py-12 sm:px-10 dark:border-white/10 dark:bg-[#0a0a0a] lg:min-h-0 lg:px-14 lg:py-28 xl:px-20">
          <div className="w-full max-w-[590px]">
            <div>
              <h1 className="whitespace-nowrap text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[25px] lg:leading-[1.05] xl:text-[30px]">
                {title}
              </h1>
              <p className="mt-3 whitespace-nowrap text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl lg:text-[15px] xl:text-[20px]">
                {subtitle}
              </p>
            </div>

            {showSocial && (
              <>
                {/* <div className="mt-12 grid gap-5 sm:grid-cols-2">
                  <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
                  <SocialButton icon={<AppleIcon />} label="Continue with Apple" />
                </div> */}

                <div className="my-10 text-center text-xl font-medium text-black/60 dark:text-white/50">
                  or
                </div>
              </>
            )}

            {!showSocial && <div className="mt-12" />}

            {children}
          </div>
        </div>

        <div className="relative flex min-h-[720px] overflow-hidden rounded-md bg-black p-8 text-white sm:p-12 lg:min-h-0">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#FC7819", "#FC7819", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-black"
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <h2 className="max-w-[620px] pt-0 text-5xl font-medium tracking-[-0.05em] text-white sm:text-6xl lg:pt-16 lg:text-[64px] lg:leading-[0.98] xl:text-[70px]">
              Think fast,
              <br />
              Build faster
            </h2>

            {/* <a
              href="#"
              className="mb-0 inline-flex h-12 max-w-full items-center gap-3 rounded-[10px] border border-white/25 px-5 text-base font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/45 hover:text-white xl:mb-32 xl:px-6 xl:text-2xl"
            >
              <Monitor className="size-5 shrink-0 xl:size-7" />
              <span className="truncate whitespace-nowrap">
                Download the windows app
              </span>
            </a> */}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-black/25 bg-white px-3 text-sm leading-none text-black transition-colors hover:bg-black/[0.03] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 xl:text-[19px]"
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export function FieldBox({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex h-14 items-center justify-between gap-4 rounded-[10px] border border-black/25 bg-white px-5 text-lg leading-none dark:border-white/15 dark:bg-white/5 xl:text-xl relative focus-within:border-brand-green transition-colors">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer min-w-0 flex-1 truncate bg-transparent outline-none pt-4 text-black dark:text-white z-10 placeholder:text-transparent"
      />
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-black/50 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-brand-green peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-xs z-0 pointer-events-none">
        {label}
      </span>
    </label>
  );
}

export function AuthButton({ children, isLoading }: { children: ReactNode, isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="mt-9 flex h-12 w-full items-center justify-center rounded-[10px] border border-black/40 bg-black text-xl font-medium text-white transition-colors hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/85 disabled:opacity-50"
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}
