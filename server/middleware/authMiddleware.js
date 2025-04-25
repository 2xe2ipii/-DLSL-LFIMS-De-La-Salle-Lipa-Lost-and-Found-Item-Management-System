const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  console.log(`Auth middleware for ${req.method} ${req.originalUrl}`);
  console.log(`Token in header: ${token ? 'present' : 'missing'}`);

  // Check if no token
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    console.log(`Auth middleware: Verifying token ${token.substring(0, 15)}...`);
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.error('ERROR: JWT_SECRET not defined in environment');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, secret);
    console.log('Token decode result:', decoded);

    // Add user to request
    req.user = decoded.user;
    console.log(`Auth middleware: User authorized - ${req.user.id} (${req.user.role})`);
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 