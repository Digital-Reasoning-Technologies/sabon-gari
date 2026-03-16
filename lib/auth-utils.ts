/**
 * Client-side utility functions for handling authentication
 */

/**
 * Logs out the user by clearing the token cookie and redirecting to login
 */
export async function logoutUser() {
  try {
    // Call logout API to clear server-side cookie
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  // Clear client-side cookie as fallback
  document.cookie = 'kudan_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirect to login with expired token message
  window.location.href = '/login?expired=true';
}

/**
 * Checks if an error response indicates an authentication failure
 */
export function isAuthError(response: Response): boolean {
  return response.status === 401;
}

/**
 * Checks if the error JSON indicates a token-related issue
 */
export function isTokenError(json: any): boolean {
  return json?.code === 'INVALID_TOKEN' || json?.code === 'NO_TOKEN' || 
         json?.message?.toLowerCase().includes('token') ||
         json?.message?.toLowerCase().includes('unauthorized');
}

