import { Session } from 'next-auth';
import { UserRole } from '@/models/User';

/**
 * Role-based permission helpers
 * Centralized authorization logic for API routes
 */

/**
 * Check if user is authenticated
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export function hasRole(session: Session | null, role: UserRole): boolean {
  if (!session?.user) return false;
  return (session.user as any).role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(session: Session | null, roles: UserRole[]): boolean {
  if (!session?.user) return false;
  const userRole = (session.user as any).role;
  return roles.includes(userRole);
}

/**
 * Check if user is organizer or admin
 */
export function isOrganizerOrAdmin(session: Session | null): boolean {
  return hasAnyRole(session, ['organizer', 'admin']);
}

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'admin');
}

/**
 * Check if user owns a resource or is admin
 * @param session - User session
 * @param resourceOwnerId - ID of the resource owner
 * @returns true if user owns resource or is admin
 */
export function canModifyResource(
  session: Session | null,
  resourceOwnerId: string
): boolean {
  if (!session?.user) return false;
  
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  
  // Admin can modify any resource
  if (userRole === 'admin') return true;
  
  // User can modify their own resource
  return userId === resourceOwnerId;
}

/**
 * Get user ID from session
 */
export function getUserId(session: Session | null): string | null {
  if (!session?.user) return null;
  return (session.user as any).id;
}

/**
 * Get user role from session
 */
export function getUserRole(session: Session | null): UserRole | null {
  if (!session?.user) return null;
  return (session.user as any).role;
}

/**
 * Authorization response helper
 */
export const AuthErrors = {
  UNAUTHORIZED: { error: 'Unauthorized. Please sign in.' },
  FORBIDDEN: { error: 'Forbidden. You do not have permission to perform this action.' },
  INVALID_ROLE: { error: 'Invalid role. Organizers and admins only.' },
  NOT_OWNER: { error: 'Forbidden. You can only modify your own resources.' },
} as const;

