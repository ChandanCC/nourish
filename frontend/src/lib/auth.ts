const TOKEN_KEY = 'nouriq_token';
const USER_KEY  = 'nouriq_user';

export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
}

export const getToken  = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getUser   = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setAuth   = (token: string, user: AuthUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
