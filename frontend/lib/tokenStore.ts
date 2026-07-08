/**
 * Server-side token store.
 *
 * The backend JWT (accessToken) is too large to store inside the
 * NextAuth encrypted session cookie — it causes the Set-Cookie header
 * to exceed Vercel's 16 KB limit.
 *
 * Instead we keep a lightweight in-memory map keyed by the user's
 * database _id.  The JWT callback writes to it on sign-in, and
 * consumers call `getAccessToken(userId)` to retrieve it.
 *
 * Trade-off: tokens are lost on a cold-start / re-deploy, which
 * simply means the user has to log in again (same as any session-
 * based auth after a server restart).
 */

const tokenStore = new Map<string, string>();

export function setAccessToken(userId: string, token: string) {
  tokenStore.set(userId, token);
}

export function getAccessToken(userId: string): string | undefined {
  return tokenStore.get(userId);
}

export function removeAccessToken(userId: string) {
  tokenStore.delete(userId);
}
