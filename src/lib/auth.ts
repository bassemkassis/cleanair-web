const SESSION_KEY = 'cleanair_session';

export interface Session {
  isLoggedIn: boolean;
  userId: string;
  userFullName: string;
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return getSession()?.isLoggedIn === true;
}

export function requireAuth(): void {
  if (!isLoggedIn()) {
    window.location.href = '/login';
  }
}
