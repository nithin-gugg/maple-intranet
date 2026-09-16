/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles?: string[]
      onboarding_completed?: boolean
    }
  }

  interface User {
    id: string
    accessToken?: string
    roles?: string[]
    onboarding_completed?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    accessToken?: string
    roles?: string[]
    onboarding_completed?: boolean
  }
}
