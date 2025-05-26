const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      username,
      email,
      password,
      name,
      role: role || 'viewer',
      createdAt: new Date()
    });
    
    await user.save();
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage,
            department: user.department,
            createdAt: user.createdAt
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log(`Login attempt for username: ${username} as role: ${role}`);
    
    // Check user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`Login failed: User ${username} not found`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log(`Before login: loginAttempts=${user.loginAttempts}, lockUntil=${user.lockUntil}`);

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      console.log(`Account is locked. lockUntil=${user.lockUntil}, now=${Date.now()}`);
      return res.status(403).json({ message: `Account locked. Try again in ${minutes} minute(s).` });
    }

    // Check role matches
    console.log(`User role: ${user.role}, Selected role: ${role}`);
    if (user.role !== role) {
      return res.status(400).json({ message: 'Invalid credentials: role mismatch' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      // Lock account after 3 failed attempts
      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        console.log(`Account locked for 15 minutes. loginAttempts=${user.loginAttempts}, lockUntil=${user.lockUntil}`);
        return res.status(403).json({ message: 'Account locked due to too many failed attempts. Please try again after 15 minutes.' });
      } else {
        await user.save();
        console.log(`Failed attempt. loginAttempts=${user.loginAttempts}, lockUntil=${user.lockUntil}`);
        if (user.loginAttempts === 1) {
          return res.status(400).json({ message: 'Invalid credentials. Warning: 2 attempts left before lockout.' });
        } else if (user.loginAttempts === 2) {
          return res.status(400).json({ message: 'Invalid credentials. Warning: 1 attempt left before 15 minute lockout.' });
        } else {
          return res.status(400).json({ message: 'Invalid credentials.' });
        }
      }
    }

    // Successful login: reset attempts and lock
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();
    console.log(`Successful login. loginAttempts reset. lockUntil cleared.`);
    console.log(`Last login updated for user: ${username}`);
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        console.log(`Login successful for user: ${username}`);
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage,
            department: user.department,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create admin or superAdmin user (superAdmin only)
exports.createUser = async (req, res) => {
  try {
    console.log(`createUser called by user ID: ${req.user.id}, role: ${req.user.role}`);
    console.log('Request body:', req.body);
    
    // Check if the current user is superAdmin
    if (req.user.role !== 'superAdmin') {
      console.log(`Access denied: User role is ${req.user.role}, not superAdmin`);
      return res.status(403).json({ message: 'Access denied. Only superAdmin can create admin accounts.' });
    }

    const { username, email, password, name, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !name) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate role
    if (role !== 'admin' && role !== 'viewer') {
      console.log('Validation failed: Invalid role');
      return res.status(400).json({ message: 'Role must be either admin or viewer' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log(`User already exists: ${existingUser.username} (${existingUser.email})`);
      return res.status(400).json({ message: 'User already exists with that username or email' });
    }
    
    // Create new user with specified role
    const user = new User({
      username,
      email,
      password,
      name,
      role: role, // Use the specified role
      createdAt: new Date()
    });
    
    await user.save();
    console.log(`User created successfully: ${username} (${email}) with role: ${role}`);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// Reset all admin passwords (superAdmin only)
exports.resetAdminPasswords = async (req, res) => {
  try {
    // Check if the current user is superAdmin (additional security check)
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Access denied. Only superAdmin can reset admin passwords.' });
    }
    
    // Find all admin users (not superAdmin)
    const adminUsers = await User.find({ role: 'admin' });
    
    // Generate a temporary password
    const tempPassword = 'admin123';
    
    // Update all admin users with the new password
    for (const admin of adminUsers) {
      admin.password = tempPassword;
      await admin.save();
    }
    
    res.status(200).json({ 
      message: 'All admin passwords have been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting admin passwords:', error);
    res.status(500).json({ message: 'Server error while resetting admin passwords' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
}; 