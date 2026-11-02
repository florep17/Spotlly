/**
 * Spotly REST API Client
 * Komunikacja z modułem backendowym (Spring Boot 3 / api)
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    throw new ApiError(response.status, message);
  }

  return response.json();
}
