const TOKEN_KEY = 'mmu_library_access_token';

/**
 * Isolated storage for auth token.
 * Only the auth token is allowed in localStorage per application requirements.
 */
export const authStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  },

  clearToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore
    }
  },
};
