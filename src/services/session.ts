import { requireAuth } from './auth';

let SESSION_AUTHENTICATED = false;

type Listener = (authenticated: boolean) => void;
const listeners: Listener[] = [];

export function isSessionAuthenticated() {
  return SESSION_AUTHENTICATED;
}

export function setSessionAuthenticated(v: boolean) {
  SESSION_AUTHENTICATED = v;
  listeners.forEach((l) => {
    try {
      l(SESSION_AUTHENTICATED);
    } catch (e) {
      // ignore
    }
  });
}

export function addAuthListener(fn: Listener) {
  listeners.push(fn);
  return () => removeAuthListener(fn);
}

export function removeAuthListener(fn: Listener) {
  const idx = listeners.indexOf(fn);
  if (idx >= 0) listeners.splice(idx, 1);
}

/**
 * Ensure the session is authenticated. If not, prompt device auth once.
 * Returns true if authenticated (either previously or after successful prompt).
 */
export async function ensureSessionAuth(promptMessage?: string): Promise<boolean> {
  if (SESSION_AUTHENTICATED) return true;
  const ok = await requireAuth(promptMessage ?? 'Authenticate to proceed');
  if (ok) {
    setSessionAuthenticated(true);
    return true;
  }
  return false;
}
