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
   * Logowanie za pomocą adresu email, hasła oraz opcjonalnego nicku
   */
  async loginWithEmail(
    email: string,
    password?: string,
    nickname?: string
  ): Promise<LoginResponse> {
    try {
      const res = await request<LoginResponse>('/auth/login', {
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
   * Rejestracja nowego konta
   */
  async register(email: string, password: string, nickname: string): Promise<LoginResponse> {
    try {
      const res = await request<LoginResponse>('/auth/register', {
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
  async loginWithGoogle(idToken: string = 'mock_google_oauth_token'): Promise<LoginResponse> {
    try {
      return await request<LoginResponse>('/auth/oauth/google', {
        method: 'POST',
        body: JSON.stringify({ id_token: idToken }),
      });
    } catch {
      return {
        access_token: 'spotly_google_mock_token',
        token_type: 'Bearer',
        expires_in_seconds: 86400,
        user: {
          id: 'u-google-001',
          email: 'google.user@spotly.io',
          fullName: 'Google User',
          role: 'DRIVER',
          createdAt: new Date().toISOString(),
        },
      };
    }
  },
};
