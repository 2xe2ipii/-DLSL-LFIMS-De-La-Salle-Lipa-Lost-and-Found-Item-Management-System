import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { UserRole } from '../types/user';
import { loadUser } from '../store/slices/authSlice';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Load user if authenticated but no user data yet
  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('RoleBasedRoute: Authenticated but no user data, loading user...');
      dispatch(loadUser());
    }
  }, [isAuthenticated, user, dispatch]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('RoleBasedRoute: Loading user data...');
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('RoleBasedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If no user data yet, we need to wait
  if (!user) {
    console.log('RoleBasedRoute: No user data yet, showing loading...');
    return <div>Loading user data...</div>;
  }

  console.log(`RoleBasedRoute: User role: ${user.role}, allowed roles:`, allowedRoles);
  
  // If authenticated but doesn't have the required role, redirect to access denied
  if (!allowedRoles.includes(user.role as UserRole)) {
    console.log('RoleBasedRoute: Access denied, redirecting');
    return <Navigate to="/access-denied" replace />;
  }

  // User is authenticated and has the required role
  console.log('RoleBasedRoute: Access granted');
  return <>{children}</>;
};

export default RoleBasedRoute; 