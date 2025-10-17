import "next-auth";
import { UserRole } from "@/models/User";

/**
 * Extend NextAuth types to include custom user properties
 */
declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    hasMembership?: boolean;
    stripeCustomerId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
      hasMembership?: boolean;
      stripeCustomerId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    hasMembership?: boolean;
    stripeCustomerId?: string;
  }
}
