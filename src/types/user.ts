export type UserRole = 'superAdmin' | 'admin' | 'student' | 'faculty';

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
} 