'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * Client-side session provider wrapper
 * Enables useSession hook throughout the app
 */

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}



