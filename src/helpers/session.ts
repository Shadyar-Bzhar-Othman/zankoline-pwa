const STORAGE_KEY = "user-session";

export interface UserSession {
  name: string;
  grade: number;
}

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as UserSession;
    if (
      typeof parsed.name !== "string" ||
      !parsed.name.trim() ||
      typeof parsed.grade !== "number" ||
      parsed.grade < 50 ||
      parsed.grade > 100
    ) {
      return null;
    }

    return { name: parsed.name.trim(), grade: parsed.grade };
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
