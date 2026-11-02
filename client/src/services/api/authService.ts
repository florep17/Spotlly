import { User } from '../../types/user';
import { request } from './apiClient';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  user: User;
}

/**
 * Serwis autoryzacji Spotly.
 * Przygotowany do podpięcia endpointów backendu Maxa (Spring Boot /api).
 */
export const authService = {
  /**
   * Logowanie za pomocą adresu email i hasła
   */
  async loginWithEmail(email: string, _password?: string): Promise<LoginResponse> {
    try {
      // Gdy Max wdroży endpoint logowania, wystarczy odkomentować poniższe:
      // return await request<LoginResponse>('/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password: _password }),
      // });

      // Symulacja pomyślnego logowania (fallback do mocka):
      const mockUser: User = {
        id: 'u-450e12-b1',
        email: email || 'driver@spotly.io',
        fullName: email ? email.split('@')[0] : 'Jan Kowalski',
        role: 'BOTH',
        createdAt: new Date().toISOString(),
      };

      return {
        access_token: 'spotly_jwt_mock_token_dev_2026',
        token_type: 'Bearer',
        expires_in_seconds: 86400,
        user: mockUser,
      };
    } catch (error) {
      console.warn('Login request failed, using local session', error);
      throw error;
    }
  },

  /**
   * Logowanie przez Google (OAuth2 ID Token)
   */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
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
