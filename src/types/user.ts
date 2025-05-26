export type UserRole = 'superAdmin' | 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  department?: string;
  createdAt: Date;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
} 