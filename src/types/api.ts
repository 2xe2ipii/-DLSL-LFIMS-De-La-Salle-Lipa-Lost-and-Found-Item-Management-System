import { User } from './user';

// Auth responses
export interface AuthResponse {
  user: User;
  token: string;
}

// User responses
export interface UserResponse extends User {}

// Error response
export interface ErrorResponse {
  message: string;
} 