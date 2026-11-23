export type UserRole = 'USER';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  nickname?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}
