export type UserRole = 'DRIVER' | 'OWNER' | 'BOTH';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}
