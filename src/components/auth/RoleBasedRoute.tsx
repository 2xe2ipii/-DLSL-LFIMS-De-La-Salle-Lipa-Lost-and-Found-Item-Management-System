import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';
import { UserRole } from '../../types/user';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * A component that restricts access to routes based on user roles
 * 
 * @param children - The components to render if the user has the required role
 * @param allowedRoles - Array of roles that are allowed to access this route
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is in the allowed roles list
  if (!allowedRoles.includes(user.role)) {
    // If not allowed, redirect to dashboard or access denied page
    return <Navigate to="/access-denied" replace />;
  }

  // User is authenticated and has the required role
  return <>{children}</>;
};

export default RoleBasedRoute; 