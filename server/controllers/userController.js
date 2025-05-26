const User = require('../models/User');

// Get all admin users
exports.getAdminUsers = async (req, res) => {
  try {
    console.log(`getAdminUsers called by user: ${req.user.id} (${req.user.role})`);
    
    // Only superAdmin can get the full list of admins
    if (req.user.role !== 'superAdmin') {
      console.log('Access denied: not a superAdmin');
      return res.status(403).json({ message: 'Access denied. Only Super Admin can view all users.' });
    }

    // Fetch all admin, superAdmin, and viewer users
    console.log('Fetching users from database');
    const users = await User.find({ 
      role: { $in: ['admin', 'superAdmin', 'viewer'] } 
    }).select('-password').sort({ createdAt: -1 });

    console.log(`Found ${users.length} users`);
    
    // Transform the _id to id for frontend compatibility
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();
      userObj.id = userObj._id.toString();
      delete userObj._id;
      return userObj;
    });

    console.log('Sending user data to client');
    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
}; 