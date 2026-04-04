/**
 * BACKWARDS COMPATIBILITY LAYER
 *
 * This file re-exports from the new auth module structure.
 * Existing imports from '@/lib/auth-context' continue to work.
 *
 * New code should import from '@/lib/auth' instead.
 */

// Re-export everything consumers currently use
export { AuthProvider, useAuth } from './auth';
export type { AuthUser } from './auth';
