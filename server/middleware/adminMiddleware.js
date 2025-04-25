module.exports = (req, res, next) => {
  console.log(`Admin middleware: Checking admin privileges for ${req.method} ${req.originalUrl}`);
  console.log(`Admin middleware: User data:`, req.user ? 
    { id: req.user.id, role: req.user.role } : 
    'undefined');

  // Handle missing user information
  if (!req.user) {
    console.log('Admin middleware: No user information in request');
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  // Log the full request URL path and user role for debugging
  console.log(`Full URL path being checked: ${req.originalUrl}, path: ${req.path}`);
  console.log(`User role from token: ${req.user.role}`);

  // Special routes that require superAdmin only - more robust matching
  const path = req.path;
  const isSuperAdminRoute = (
    path === '/admins' ||  // For GET /api/users/admins
    path === '/create-user' || // For POST /api/auth/create-user
    path === '/reset-admin-passwords' // For POST /api/auth/reset-admin-passwords
  );

  console.log(`Route requires superAdmin: ${isSuperAdminRoute} (path: ${path})`);
  console.log(`User role is: ${req.user.role}`);

  if (isSuperAdminRoute) {
    if (req.user.role === 'superAdmin') {
      console.log('Admin middleware: SuperAdmin access granted for restricted endpoint');
      next();
    } else {
      console.log(`Admin middleware: Access denied - SuperAdmin required but user role is ${req.user.role}`);
      res.status(403).json({ message: 'Access denied. SuperAdmin privileges required.' });
    }
  }
  // Regular admin routes
  else if (req.user.role === 'admin' || req.user.role === 'superAdmin') {
    console.log('Admin middleware: Admin access granted');
    next();
  } else {
    console.log(`Admin middleware: Access denied - Not an admin (role: ${req.user.role})`);
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
}; 