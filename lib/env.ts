/**
 * Environment utilities
 * Checks if the application is running in demo mode
 */

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true'
}

/**
 * Log demo mode status on module load (server-side only)
 */
if (typeof window === 'undefined' && isDemoMode()) {
  console.log('🚀 Running in DEMO MODE')
}

