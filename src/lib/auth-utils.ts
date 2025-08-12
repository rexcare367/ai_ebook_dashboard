// Authentication utility functions for managing tokens and user sessions

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface UserSession {
  user_id: string;
  school_id: string;
  role: string;
  permissions: string[];
  expires_at: number;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_SESSION_KEY = 'user-session';

// Token management functions
export const tokenUtils = {
  // Store access token
  setAccessToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  // Get access token
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem(ACCESS_TOKEN_KEY) ||
        sessionStorage.getItem(ACCESS_TOKEN_KEY)
      );
    }
    return null;
  },

  // Store refresh token
  setRefreshToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  // Store user session
  setUserSession: (session: UserSession): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    }
  },

  // Get user session
  getUserSession: (): UserSession | null => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem(USER_SESSION_KEY);
      if (session) {
        try {
          return JSON.parse(session);
        } catch (error) {
          console.error('Failed to parse user session:', error);
          return null;
        }
      }
    }
    return null;
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    const session = tokenUtils.getUserSession();
    if (!session) return true;

    const now = Date.now();
    return now >= session.expires_at;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = tokenUtils.getAccessToken();
    if (!token) return false;

    return !tokenUtils.isTokenExpired();
  },

  // Clear all authentication data
  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_SESSION_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  // Refresh authentication tokens
  refreshTokens: async (): Promise<boolean> => {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Make refresh request to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh tokens');
      }

      const data: AuthToken = await response.json();

      // Store new tokens
      tokenUtils.setAccessToken(data.access_token);
      if (data.refresh_token) {
        tokenUtils.setRefreshToken(data.refresh_token);
      }

      // Update session expiry
      const session = tokenUtils.getUserSession();
      if (session && data.expires_in) {
        session.expires_at = Date.now() + data.expires_in * 1000;
        tokenUtils.setUserSession(session);
      }

      return true;
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      tokenUtils.clearAuth();
      return false;
    }
  }
};

// Session management functions
export const sessionUtils = {
  // Create new user session
  createSession: (userData: Partial<UserSession>): UserSession => {
    const session: UserSession = {
      user_id: userData.user_id || '',
      school_id: userData.school_id || '',
      role: userData.role || 'user',
      permissions: userData.permissions || [],
      expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours default
    };

    tokenUtils.setUserSession(session);
    return session;
  },

  // Update session data
  updateSession: (updates: Partial<UserSession>): UserSession | null => {
    const currentSession = tokenUtils.getUserSession();
    if (!currentSession) return null;

    const updatedSession = { ...currentSession, ...updates };
    tokenUtils.setUserSession(updatedSession);
    return updatedSession;
  },

  // Check if user has specific permission
  hasPermission: (permission: string): boolean => {
    const session = tokenUtils.getUserSession();
    if (!session) return false;

    return (
      session.permissions.includes(permission) ||
      session.permissions.includes('admin')
    );
  },

  // Check if user has any of the specified permissions
  hasAnyPermission: (permissions: string[]): boolean => {
    return permissions.some((permission) =>
      sessionUtils.hasPermission(permission)
    );
  },

  // Check if user has all of the specified permissions
  hasAllPermissions: (permissions: string[]): boolean => {
    return permissions.every((permission) =>
      sessionUtils.hasPermission(permission)
    );
  }
};

// Export default auth utilities
export default {
  token: tokenUtils,
  session: sessionUtils
};
