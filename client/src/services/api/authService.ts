import { User } from '../../types/user';
import { request, ApiError, setAuthToken } from './apiClient';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  user: User;
}

/**
 * Serwis autoryzacji Spotly.
 * Komunikacja z modułem backendowym (Spring Boot 3 / api).
 */
export const authService = {
  /**
   * Logowanie za pomocą adresu email i hasła
   */
  async loginWithEmail(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await request<LoginResponse>('/auth/login', {
        includeSession: false,
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.access_token) {
        setAuthToken(res.access_token);
      }
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(
        'Brak połączenia z serwerem API. Upewnij się, że backend jest uruchomiony na porcie 8081.'
      );
    }
  },

  /**
   * Rejestracja nowego konta
   */
  async register(email: string, password: string, nickname: string): Promise<LoginResponse> {
    try {
      const res = await request<LoginResponse>('/auth/register', {
        includeSession: false,
        method: 'POST',
        body: JSON.stringify({ email, password, nickname }),
      });
      if (res?.access_token) {
        setAuthToken(res.access_token);
      }
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(
        'Brak połączenia z serwerem API. Upewnij się, że backend jest uruchomiony na porcie 8081.'
      );
    }
  },

  /**
   * Wylogowanie - wyczyszczenie tokena
   */
  logout() {
    setAuthToken(null);
  },

  /**
   * Pobranie profilu aktualnie zalogowanego użytkownika
   */
  async getCurrentUser(token: string): Promise<User> {
    return await request<User>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Logowanie przez Google (OAuth2 ID Token)
   */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    return await request<LoginResponse>('/auth/oauth/google', {
      includeSession: false,
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
  },
};
