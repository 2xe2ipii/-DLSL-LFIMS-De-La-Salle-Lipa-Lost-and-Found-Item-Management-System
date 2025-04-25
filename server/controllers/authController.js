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
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    
    // Check user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`Login failed: User ${username} not found`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.username}, role: ${user.role}`);
    
    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match result: ${isMatch ? 'Success' : 'Failed'}`);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
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

    const { username, email, password, name } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !name) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log(`User already exists: ${existingUser.username} (${existingUser.email})`);
      return res.status(400).json({ message: 'User already exists with that username or email' });
    }
    
    // Create new admin user (always create as admin role)
    const user = new User({
      username,
      email,
      password,
      name,
      role: 'admin', // Force role to be admin
      createdAt: new Date()
    });
    
    await user.save();
    console.log(`Admin user created successfully: ${username} (${email})`);
    
    res.status(201).json({ 
      message: 'Admin user created successfully',
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
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error while creating admin user' });
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