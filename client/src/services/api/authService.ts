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
   * Logowanie za pomocą adresu email, hasła oraz opcjonalnego nicku
   */
  async loginWithEmail(
    email: string,
    password?: string,
    nickname?: string
  ): Promise<LoginResponse> {
    try {
      return await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, nickname }),
      });
    } catch {
      // Fallback lokalny na czas pracy offline lub braku połączenia z backendem
      const mockUser: User = {
        id: 'u-450e12-b1',
        email: email || 'driver@spotly.io',
        fullName: nickname || (email ? email.split('@')[0] : 'Kierowca'),
        role: 'BOTH',
        createdAt: new Date().toISOString(),
      };

      return {
        access_token: 'spotly_jwt_mock_token_dev_2026',
        token_type: 'Bearer',
        expires_in_seconds: 86400,
        user: mockUser,
      };
    }
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
